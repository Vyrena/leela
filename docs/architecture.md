# Leela Architecture

## Stack

- Desktop shell: Electron
- Renderer: React + TypeScript
- Build tooling: electron-vite
- State: Zustand
- Local persistence: electron-store today, database layer later
- AI gateway: OpenRouter
- STT: Deepgram
- TTS: ElevenLabs

## Current Structure

```text
Leela/
├── docs/
│   ├── architecture.md
│   ├── product-spec.md
│   └── roadmap.md
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   └── services/
│   │       └── assistant.ts
│   ├── preload/
│   │   └── index.ts
│   ├── renderer/
│   │   └── src/
│   │       ├── components/
│   │       ├── store/
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       └── styles.css
│   └── shared/
│       └── types.ts
├── electron.vite.config.ts
├── package.json
└── tsconfig.json
```

## Process Boundaries

### Main Process

Owns desktop-native responsibilities:

- tray creation
- window lifecycle
- global shortcuts
- persistence access
- future service orchestration
- future notifications and background jobs

### Preload

Exposes a narrow, controlled API from Electron to the renderer.

Current exposed capabilities:

- read settings
- update settings
- fetch conversation
- send chat messages

### Renderer

Owns UI concerns:

- chat surface
- settings drawer
- local interaction state
- presentational layout

## Current Data Flow

1. Renderer loads settings and conversation through preload IPC.
2. User sends a message from the chat composer.
3. Renderer calls `window.leela.sendMessage(...)`.
4. Main process appends user message, generates a prototype reply, persists conversation, and returns the updated list.
5. Renderer hydrates the returned conversation into Zustand.

## Near-Term Architecture Plan

### Chat Layer

- Replace prototype reply generation with OpenRouter-backed streaming responses
- Add request/error/loading states that survive renderer refreshes
- Introduce conversation/session abstraction

### Voice Layer

- Add Deepgram streaming client in `src/main/services/`
- Add ElevenLabs playback service in `src/main/services/`
- Create IPC events for microphone state and voice playback state

### Persistence Layer

- Move from simple `electron-store` conversation persistence toward a structured local database
- Add memory records, user profile facts, reminders, and integration tokens

### Background Systems

- proactive scheduler
- daily briefings
- DND/focus detection
- notification dispatch
- Telegram bridge

## Guiding Principles

- Keep Electron-native logic in main, not renderer
- Keep renderer focused on presentation and local UX state
- Use shared types for all IPC contracts
- Prefer services for external integrations so they remain swappable
- Build v1 in slices that stay shippable after each commit
