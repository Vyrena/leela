# Development Workflow

## Daily Commands

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run typecheck
npm run build
```

## Packaging Commands

```bash
npm run dist:dir
npm run dist:win
```

`dist:dir` creates an unpacked build for quick verification.

`dist:win` produces Windows installer artifacts through `electron-builder`.

## Environment Notes

- OpenRouter, Deepgram, and ElevenLabs keys are currently configured inside the app settings UI
- build outputs go to `dist/`, `dist-electron/`, and packaged artifacts go to `release/`
- the tray icon asset lives in `assets/icons/leela-tray.svg`

## Current Workflow Expectations

- typecheck before commit when touching TypeScript contracts
- build before push when touching Electron, renderer, or preload code
- keep each feature slice shippable and committed independently
