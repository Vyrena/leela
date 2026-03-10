import type { AssistantMessage } from '../../../shared/types'

interface MessageListProps {
  messages: AssistantMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <section className="message-list" aria-label="Conversation">
      {messages.map((message) => (
        <article key={message.id} className={`message-bubble ${message.role}`}>
          <span className="message-role">{message.role === 'assistant' ? 'Leela' : 'You'}</span>
          <p>{message.content}</p>
        </article>
      ))}
    </section>
  )
}
