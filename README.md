# SCAD customizable models in Web interface

![](public/og-image.png)

## Features
- Generate STL and SCAD files
- Customizable model params
- Kits - model set from several models
- Share - send link to tuned model
- Printer-friendly - STL filenames optimized
- Save as preset to reuse parameters

Custom presets are stored in `data/user-presets/<model>/<name>.json` and loaded on startup.

## Models
- Funnel
- Shim
- Cup
- Cap

## Development
Run `npm install` to install dependencies. Execute `npm test` to run the
Mocha test suite. TypeScript sources can be compiled with `npm run build` using
the provided `tsconfig.json`.
