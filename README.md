# VaultOTP

VaultOTP is an open-source 2FA authenticator browser extension for generating
TOTP and HOTP one-time passwords directly in Chrome. It helps you manage
two-step verification codes for Google, GitHub, Microsoft, Discord, and other
services that support standard OTP authentication.

[Install VaultOTP from the Chrome Web Store](https://chromewebstore.google.com/detail/kghimfkkjamkpinfgmpmfngpjiofbkbn?utm_source=item-share-cb)

> **Fork notice:** VaultOTP is a fork of
> [Authenticator-Extension/Authenticator](https://github.com/Authenticator-Extension/Authenticator).
> It is independently maintained and is not endorsed by the original
> Authenticator-Extension project. The original project is licensed under MIT;
> its copyright notice is preserved in [LICENSE](./LICENSE).

## Current Status

This fork modernizes the original browser extension stack and is published as a
separate Chrome Web Store release under the VaultOTP name.

## Features

- Generate time-based and counter-based OTP codes in the browser.
- Add accounts by scanning QR codes, importing QR images, or entering secrets
  manually.
- Import standard `otpauth://` URLs and Google Authenticator migration exports.
- Copy codes quickly, use optional autofill, and add VaultOTP to the context
  menu.
- Protect account data with local encryption and optional encrypted backups.
- Back up data manually or through supported cloud providers.

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

To type-check and build Chrome in one step:

```bash
npm run check
```

## Manual Chrome Web Store Release

Before uploading a new Chrome Web Store package, update the version in
`manifests/manifest-chrome.json`. The Chrome Web Store rejects uploads that do
not increase the extension version.

Create a zip package for manual submission:

```bash
npm run package:chrome
```

The script runs `npm run check`, rebuilds the Chrome extension, removes
`.DS_Store` files from the archive, and writes
`release/vaultotp-chrome-<version>.zip`. Upload that zip in the Chrome Web Store
Developer Dashboard. Generated packages are ignored by Git.

## Development

```bash
npm install
npm run dev:chrome
```

Load the unpacked Chrome extension from `chrome/`.

Before submitting changes, run:

```bash
npm run check
npm audit --omit=dev
```

## Attribution

VaultOTP is based on Authenticator-Extension/Authenticator, licensed under MIT.
Keep the original license and attribution in source distributions and release
bundles.

## Privacy

See [PRIVACY.md](./PRIVACY.md) for VaultOTP's privacy policy.
