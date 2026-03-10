# Leela Product Spec

## Vision

Leela is a personable desktop AI assistant for Windows that feels present throughout the day without becoming intrusive. She should be witty, conversational, voice-capable, and able to act unprompted like a real assistant.

## Product Direction

- Primary platform: Windows 10/11
- App shell: Electron + React + TypeScript
- Default presence: system tray app with a floating chat panel
- Default assistant identity: Leela
- Default tone: witty and playful, but still helpful and warm
- Default response language: English
- Language understanding: English plus Turkish-English mixed speech/text

## Core User Experience Goals

- Feel like a real desktop companion, not just a chatbot in a window
- Be easy to summon from anywhere through tray access and hotkeys
- Support both typing and full voice interaction
- Remember the user across sessions
- Act proactively in useful, low-friction ways
- Stay configurable so the user can tune personality and intensity

## Chosen Integrations And Capabilities

### AI And Voice

- AI provider strategy: OpenRouter as the primary model gateway
- Speech-to-text: Deepgram
- Text-to-speech: ElevenLabs
- Voice mode: full STT + TTS
- Voice response language: English only by default

### Desktop Features

- App launching
- Screenshot analysis
- Keyboard shortcuts / hotkeys
- Active window title awareness for v1 context-awareness groundwork

### External Services

- Google Calendar
- Spotify
- News feeds / RSS
- Telegram two-way chat
- Reminders and proactive notifications

## Proactive Behavior Goals

- Context-aware suggestions
- Daily briefing / morning summary
- Idle-time conversation
- Smart notifications
- Mood check-ins
- Configurable proactive frequency
- Do Not Disturb with smart detection

## Memory And Behavior Rules

- Memory mode: persistent memory across sessions
- Notifications: Windows toast with optional voice
- Idle behavior: configurable frequency
- DND: smart detection plus manual/scheduled expansion later
- Personality and preferences: manageable through settings UI and chat-based edits

## MVP Scope

### v1 Priority

Core chat + personality + voice first.

### v1 Includes

- System tray app shell
- Floating chat panel
- Hotkey summon/dismiss flow
- Witty Leela persona
- Settings UI for key behavior controls
- Voice-ready interaction model
- OpenRouter-backed assistant chat
- Persistent local settings and conversation state

### v1 Defers

- Full Google Calendar integration
- Spotify control
- Telegram remote chat
- News briefing sources
- Smart notification ranking
- Mood tracking logic
- Screenshot analysis workflows
- Full autonomous action loops

## Design Direction

- Avoid bland default SaaS styling
- Warm, intentional visual identity
- Distinctive assistant presence rather than generic chat UI
- Works on both desktop and mobile-sized windows

## Success Criteria

- Leela launches from tray reliably
- Chat feels responsive and conversational
- Voice pipeline feels natural enough for daily use
- Settings persist and reflect user preferences
- Repo architecture supports future integrations without rewrites
