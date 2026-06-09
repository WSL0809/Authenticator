# Algorithm Import Normalization Design

## Context

Imported `otpauth://` URIs can include an `algorithm` query parameter such as `SHA1`, `SHA256`, or `SHA512`. The current QR/text import path stores that value as a string in raw import data, but `EntryStorage.import` parses it with `parseInt`. Values such as `SHA256` become `NaN`, fail enum validation, and silently fall back to SHA-1.

## Scope

Fix import handling for standard `otpauth` algorithm strings only:

- `SHA1`
- `SHA256`
- `SHA512`

Do not add support for GOST algorithm strings, MD5, new UI options, or broader import/export format changes in this patch.

## Approach

Normalize imported algorithm values at the storage import boundary. Add a focused parser near `EntryStorage.import` that accepts raw algorithm values and returns an `OTPAlgorithm` enum value.

The parser will:

- Return `OTPAlgorithm.SHA1` for missing, empty, invalid, or unsupported values.
- Map case-insensitive `SHA1`, `SHA256`, and `SHA512` strings to their enum values.
- Preserve compatibility with existing numeric enum strings such as `"1"`, `"2"`, and `"3"`.

`src/import.ts` can continue collecting raw query parameter values. `EntryStorage.import` will call the parser instead of directly using `parseInt(rawAlgorithm)`, so QR image import, text import, and file import share the same behavior.

## Error Handling

Invalid algorithms should keep the existing forgiving behavior: default to SHA-1 and continue importing the account. This avoids turning previously importable QR codes or backups into hard failures.

## Testing

Add focused tests for algorithm normalization:

- `SHA256` imports as `OTPAlgorithm.SHA256`.
- `SHA512` imports as `OTPAlgorithm.SHA512`.
- Missing or invalid values default to `OTPAlgorithm.SHA1`.
- Numeric strings still map to existing enum values.

Prefer testing the parser directly or through the smallest practical import boundary to avoid brittle browser storage setup.
