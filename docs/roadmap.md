# Leela Roadmap

## Status Snapshot

Completed foundation work already in repo:

- local git repo created and connected to GitHub
- Electron + React + TypeScript app scaffolded
- tray window shell and global hotkey support added
- settings persistence wired through IPC
- chat UI and quick actions added
- prototype chat flow moved behind Electron IPC
- dependency lockfile committed
- build verified locally with Node.js installed

## Current MVP Todo List

### High Priority

- [ ] Replace prototype replies with OpenRouter integration
- [ ] Add streaming assistant responses in the chat UI
- [ ] Add API key configuration flow for OpenRouter
- [ ] Add structured error handling for model/API failures
- [ ] Add voice service scaffolding for Deepgram and ElevenLabs
- [ ] Add microphone permission and device selection UX

### Medium Priority

- [ ] Add persistent conversation/history schema beyond simple store usage
- [ ] Add user memory primitives: remember, forget, profile facts
- [ ] Add assistant status states: idle, listening, thinking, speaking
- [ ] Add avatar upload and visual identity settings
- [ ] Improve tray menu and startup behavior

### Future Integrations

- [ ] Google Calendar read + reminder workflow
- [ ] Spotify playback controls
- [ ] Telegram two-way remote chat
- [ ] RSS/news briefing pipeline
- [ ] screenshot analysis requests
- [ ] app launching workflows

### Proactive Assistant Systems

- [ ] configurable daily briefing
- [ ] idle-time conversation engine
- [ ] mood check-ins
- [ ] smart notifications
- [ ] DND / focus detection
- [ ] context-aware suggestions from active window title

## Suggested Build Order

1. Real AI chat via OpenRouter
2. Voice pipeline skeleton
3. Better persistence and memory model
4. Proactive scheduler foundation
5. First external integration: Calendar or Telegram

## Notes For Future Work

- ChatGPT Plus and Claude Pro subscriptions are not API access; OpenRouter remains the practical primary path
- Turkish-English mixed input should be supported in STT and model prompting, while replies stay in English by default
- The app should stay useful even before advanced automations land
