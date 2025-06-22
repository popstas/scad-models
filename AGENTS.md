# Contributor Guidelines

Welcome to **scad-models**! This project hosts customizable 3D models
rendered through OpenSCAD and served via a small Express application.
Below is a short overview to help new contributors navigate the codebase.

## Project Layout
- `src/` – Backend source code. `index.js` is the entry point. Each model
  resides in `src/models/` and exports configuration for model generation.
- `public/` – Front‑end assets (Vue-based interface) served by Express.
- `config.js` – Default application settings (port, cache location, kits).
- `Dockerfile` and `docker-compose.yml` – Container setup to run with
  `openscad` and Node.
- `CONTRIBUTING.md` – Basic setup and how to add new models.

## Local Development
1. Install dependencies with `npm install`.
2. Run `npm start` (which executes `npm run dev`) to launch the server.
   It uses `nodemon` to restart on changes and automatically opens OpenSCAD
   for preview.
3. Access the web interface at `http://localhost:3014`.

## Adding a New Model
- Place a module inside `src/models/` and export an object containing
  `{ name, label, generator, params, presets }` as described in
  `CONTRIBUTING.md`.
- Front‑end parameters are defined in the exported configuration, which the
  client uses to generate forms.

## Tips
- Cached STL files are stored under `data/cache` by default.
- The project expects `openscad` to be available in your `PATH`.
- Review existing model modules to see common patterns.

