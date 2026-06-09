# VaultOTP

VaultOTP generates two-factor authentication codes in your browser.

> **Fork notice:** VaultOTP is a fork of
> [Authenticator-Extension/Authenticator](https://github.com/Authenticator-Extension/Authenticator).
> It is independently maintained and is not endorsed by the original
> Authenticator-Extension project. The original project is licensed under MIT;
> its copyright notice is preserved in [LICENSE](./LICENSE).

## Current Status

This fork modernizes the original browser extension stack and prepares a
separate Chrome Web Store release under the VaultOTP name. Use distinct store
metadata, icons, screenshots, support URLs, and developer identity when
publishing.

## Build Setup

```bash
npm ci
npm run chrome
```

Other supported build targets:

```bash
npm run firefox
npm run edge
npm run prod
```

Chrome builds are written to `chrome/`. Production builds are written to
`release/`.

## Development

```bash
npm install
npm run dev:chrome
```

Load the unpacked Chrome extension from `chrome/`.

Before submitting changes, run:

```bash
npm run pretest
npm audit --omit=dev
```

## Attribution

VaultOTP is based on Authenticator-Extension/Authenticator, licensed under MIT.
Keep the original license and attribution in source distributions and release
bundles.
