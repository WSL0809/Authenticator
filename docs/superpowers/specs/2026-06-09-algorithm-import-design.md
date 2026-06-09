# Algorithm Import Normalization Design

## Context

`otpauth://` imports can include `algorithm=SHA1`, `algorithm=SHA256`, or `algorithm=SHA512`. The current parser in `src/import.ts` stores this value as a raw string, but `EntryStorage.import` later uses `parseInt(rawAlgorithm)`. Standard algorithm strings therefore become `NaN` and fall back to SHA-1.

## Scope

Fix import of standard `otpauth` algorithm strings only:

- `SHA1`
- `SHA256`
- `SHA512`

GOST algorithm names and other non-standard values are out of scope for this patch.

## Design

Add a focused parser at the storage import boundary, near `EntryStorage.import`.

The parser will accept an optional raw algorithm value and return an `OTPAlgorithm`:

- missing, empty, invalid, or unsupported values return `OTPAlgorithm.SHA1`
- case-insensitive `SHA1`, `SHA256`, and `SHA512` map to the matching enum values
- existing numeric enum strings such as `"1"`, `"2"`, and `"3"` continue to work for backward compatibility

`EntryStorage.import` will call this parser instead of directly using `parseInt(rawAlgorithm)`. This keeps `src/import.ts` simple and fixes all callers that feed raw import data into storage, including QR import, text import, and file import.

## Error Handling

Invalid values will continue to default to SHA-1, matching existing behavior. The importer will not reject otherwise valid accounts solely because an unsupported algorithm value is present.

## Testing

Add focused tests for the parser or import behavior:

- `SHA256` imports as `OTPAlgorithm.SHA256`
- `SHA512` imports as `OTPAlgorithm.SHA512`
- lowercase or mixed-case values are accepted
- missing or invalid values default to `OTPAlgorithm.SHA1`
- numeric strings still resolve to existing enum values

Prefer a small unit test around the parser if direct browser storage testing would add unnecessary setup.
