# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript/Vue 3 browser extension built with Vite. Core entry points live in `src/` (`background.ts`, `content.ts`, `popup.ts`, `options.ts`, `permissions.ts`). UI components are in `src/components/`, state modules in `src/store/`, domain logic in `src/models/`, and declarations in `src/definitions/`. Tests live in `src/test/`. Static pages are in `view/`, Sass in `sass/`, images in `images/` and `svg/`, locales in `_locales/`, and browser manifests in `manifests/`.

## Build, Test, and Development Commands

Run `npm install` before development.

- `npm run dev:chrome`: builds the Chrome extension package with the same Vite pipeline as `npm run chrome`.
- `npm run chrome`, `npm run firefox`, `npm run edge`: builds the extension package for the selected browser.
- `npm run prod`: builds release artifacts for all supported browsers and generates license output.
- `npm run pretest`: builds the Chrome and Firefox test bundles into `test/`.
- `npm test`: runs the Puppeteer/Mocha test runner after `pretest`.

Output directories such as `chrome/`, `firefox/`, `edge/`, `release/`, `test/`, `dist/`, `css/`, and `build/` are generated.

## Coding Style & Naming Conventions

Use TypeScript for extension logic and Vue single-file components for UI. Vue components use PascalCase filenames such as `AddAccountPage.vue`; store modules and model files should match their directory convention. The build script runs Prettier over `src/**/*.ts`, `src/**/*.vue`, and `sass/*.scss`, then ESLint with `@typescript-eslint`. Keep imports explicit and prefer existing Vuex/store patterns.

## Testing Guidelines

Tests use Mocha, Chai, Sinon, and Puppeteer. Place tests in `src/test/` and name them `*.test.ts`, following `src/test/gost.test.ts`. Run `npm test` for the full test path, or `npm run pretest` for build validation. Add tests when changing OTP algorithms, encryption, storage, import flows, or browser integration behavior.

## Commit & Pull Request Guidelines

Recent history uses short imperative or release-oriented subjects, often with issue or PR references, for example `fix #1274 (#1288)`, `v8.0.2`, and `Bump webpack from 5.77.0 to 5.94.0 (#1286)`. Keep commits focused. Pull requests should include a summary, linked issues, test results, and screenshots for UI changes.

## Security & Configuration Tips

Do not commit real API keys or production secrets. `src/models/credentials.ts` is checked by the build script; production builds fail when required fields are missing. If redistributing a fork, generate your own browser/API credentials and verify manifests before release.

## Licensing, Branding & Store Release

This fork is MIT licensed. Keep `LICENSE` intact and preserve the original copyright notice in source distributions, release bundles, and generated license pages. MIT permits modification, redistribution, and commercial publication, but it does not grant trademark or store identity rights. If publishing under your own account, use a distinct extension name, icon, screenshots, support URL, privacy policy, and developer identity; do not imply endorsement by `Authenticator-Extension` or reuse store metadata in a misleading way. A safe attribution pattern is: "Based on Authenticator-Extension/Authenticator, licensed under MIT; independently maintained."
