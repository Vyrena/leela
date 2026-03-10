import type { LeelaSettings, VoiceState } from '../../shared/types'

export class DeepgramService {
  buildState(settings: LeelaSettings, status: VoiceState['status']): VoiceState {
    if (!settings.deepgramApiKey.trim()) {
      return {
        status: 'error',
        provider: 'deepgram',
        message: 'Deepgram API key missing. Add it in Settings to enable voice input.'
      }
    }

    if (status === 'listening') {
      return {
        status,
        provider: 'deepgram',
        message: settings.voiceInputMode === 'continuous' ? 'Listening continuously.' : 'Listening in push-to-talk mode.'
      }
    }

    return {
      status,
      provider: 'deepgram',
      message: 'Voice input ready.'
    }
  }
}
