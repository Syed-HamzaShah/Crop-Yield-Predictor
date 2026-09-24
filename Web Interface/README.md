# Crop Yield Prediction Web Interface

The Web Interface provides a browser-based interface for the crop yield prediction project. It is built with TanStack Start, React, TypeScript, and Tailwind CSS.

## Requirements

- Node.js 18 or newer
- npm or Bun

## Getting started

From this directory, install dependencies and start the development server:

```sh
npm install
npm run dev
```

The development server prints the local URL in the terminal, typically `http://localhost:3000`.

When using Bun, the equivalent commands are:

```sh
bun install
bun run dev
```

## Available scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite development server    |
| `npm run build`     | Create a production build            |
| `npm run build:dev` | Create a development-mode build      |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run ESLint                           |
| `npm run format`    | Format the project with Prettier     |

## Project structure

```text
src/
	components/  Reusable interface components
	hooks/       Shared React hooks
	lib/         Prediction, error handling, and utility modules
	routes/      Application pages and the root route
	router.tsx   Router configuration
	styles.css   Global styles
```

Dataset preparation and model training are kept outside this folder in the repository's `Datasets/` and `Model Training/` directories.

## Environment variables

Keep local secrets and machine-specific configuration in `.env` files. Do not commit them. Use `.env.example` to document required variables for other developers.

## Lovable workflow

This project is connected to [Lovable](https://lovable.dev). Keep the branch in a working state and avoid force-pushing or rewriting published history, since commits pushed to the connected branch are synchronized with the Lovable editor.
