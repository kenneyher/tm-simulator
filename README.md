# Turing Machine Simulator

A small interactive Turing Machine simulator built with Next.js and React.

Use this project to design, run and visualise Turing machines in the browser. It provides a UI for creating states and transition rules, editing the tape, and stepping or running the machine to observe how the tape and head position change over time.

**Where to look in the codebase**
- `app/simulator/page.tsx`: the simulator page and entry point for the UI.
- `lib/machine.tsx`: core Turing machine model and execution logic.
- `components/`: UI building blocks used by the simulator.

## Quick Start

Prerequisites:
- Node.js 18 or newer
- npm (bundled with Node) or another package manager

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open the simulator in your browser at:

```
http://localhost:3000/simulator
```

Available npm scripts (from `package.json`):
- `npm run dev` — run the development server (Next.js)
- `npm run build` — build the production bundle
- `npm run start` — start the production server after building
- `npm run lint` — run ESLint

To build and run a production instance locally:

```bash
npm run build
npm run start
```

## Usage (UI overview)
- Create states and transition rules using the simulator UI.
- Edit the tape contents and set the initial head position.
- Use the step controls to advance one transition at a time or run continuously.
- Reset the machine to the initial configuration to try different inputs.

## Development notes
- This is a Next.js (app router) + TypeScript project. Files under `app/` use the Next 13+ app router conventions.
- The Turing machine implementation is in `lib/machine.tsx` and is intentionally small so you can modify or extend the model easily.
- UI components are in `components/` and `components/ui/`.

If you plan to contribute, open a branch, make changes, and submit a pull request. Run `npm run lint` before submitting.

## License
This repository does not specify a license. Add a `LICENSE` file if you want to make the project open-source.

Enjoy experimenting with Turing machines! If you want, I can add example machine definitions or a short tutorial page inside the app.
