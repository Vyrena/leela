import type { AssistantMessage, LeelaSettings } from '../../shared/types'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenRouterStreamOptions {
  messages: AssistantMessage[]
  settings: LeelaSettings
}

function toModelMessages(messages: AssistantMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content
  }))
}

export async function* streamOpenRouterReply({ messages, settings }: OpenRouterStreamOptions) {
  if (!settings.openRouterApiKey.trim()) {
    throw new Error('Add your OpenRouter API key in Settings before sending messages.')
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/Vyrena/leela',
      'X-Title': 'Leela'
    },
    body: JSON.stringify({
      model: settings.openRouterModel,
      stream: true,
      messages: toModelMessages(messages)
    })
  })

  if (!response.ok) {
    let errorMessage = `OpenRouter request failed with status ${response.status}.`

    try {
      const data = (await response.json()) as { error?: { message?: string } }
      errorMessage = data.error?.message ?? errorMessage
    } catch {
      // ignore JSON parsing failure and use fallback message
    }

    throw new Error(errorMessage)
  }

  if (!response.body) {
    throw new Error('OpenRouter returned no response body.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const lines = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())

      for (const line of lines) {
        if (!line || line === '[DONE]') {
          continue
        }

        const payload = JSON.parse(line) as {
          choices?: Array<{
            delta?: { content?: string }
            finish_reason?: string | null
          }>
        }

        const chunk = payload.choices?.[0]?.delta?.content

        if (chunk) {
          yield chunk
        }
      }
    }
  }
}
