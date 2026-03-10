import type { LeelaSettings, VoiceState } from '../../shared/types'

export class ElevenLabsService {
  buildState(settings: LeelaSettings, status: VoiceState['status']): VoiceState {
    if (!settings.elevenLabsApiKey.trim()) {
      return {
        status: 'error',
        provider: 'elevenlabs',
        message: 'ElevenLabs API key missing. Add it in Settings to enable spoken responses.'
      }
    }

    if (!settings.elevenLabsVoiceId.trim()) {
      return {
        status: 'error',
        provider: 'elevenlabs',
        message: 'ElevenLabs voice ID missing. Add one in Settings to enable spoken responses.'
      }
    }

    return {
      status,
      provider: 'elevenlabs',
      message: status === 'speaking' ? 'Speaking with ElevenLabs.' : 'Voice output ready.'
    }
  }

  async previewVoice(settings: LeelaSettings, assistantName: string) {
    const state = this.buildState(settings, 'speaking')

    if (state.status === 'error') {
      throw new Error(state.message)
    }

    return {
      ok: true,
      message: `${assistantName} voice preview is scaffolded and ready for ElevenLabs streaming hookup.`
    }
  }
}
