'use strict';

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = '_locales';
const BRAND = 'VaultOTP';
const BASE_LOCALE = 'en';
const SOURCE_DIRS = ['src', 'view', 'manifests'];
const MANIFEST_DIR = 'manifests';
const REQUIRED_BRAND_KEYS = [
  'extDesc',
  'delete_all',
  'delete_all_warning',
  'permission_context_menus',
];
const REQUIRED_KEYS = ['command_scan_qr', 'command_autofill'];

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));
}

function listLocaleFiles() {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((locale) =>
      fs.existsSync(path.join(LOCALES_DIR, locale, 'messages.json'))
    )
    .sort()
    .map((locale) => ({
      locale,
      file: path.join(LOCALES_DIR, locale, 'messages.json'),
    }));
}

function listFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const filename = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(filename));
    } else {
      files.push(filename);
    }
  }
  return files;
}

function addError(errors, file, message) {
  errors.push(`${file}: ${message}`);
}

function compareKeys(errors, baseMessages, locale, file, messages) {
  const baseKeys = Object.keys(baseMessages).sort();
  const localeKeys = Object.keys(messages).sort();
  const missing = baseKeys.filter((key) => !(key in messages));
  const extra = localeKeys.filter((key) => !(key in baseMessages));

  if (missing.length > 0) {
    addError(errors, file, `${locale} is missing keys: ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    addError(errors, file, `${locale} has extra keys: ${extra.join(', ')}`);
  }
}

function checkLocaleBrand(errors, locale, file, messages) {
  for (const key of ['extName', 'extShortName']) {
    if (messages[key]?.message !== BRAND) {
      addError(errors, file, `${locale}.${key} must be "${BRAND}"`);
    }
  }

  for (const key of REQUIRED_BRAND_KEYS) {
    const message = messages[key]?.message || '';
    if (!message.includes(BRAND)) {
      addError(errors, file, `${locale}.${key} must include "${BRAND}"`);
    }
  }

  for (const key of REQUIRED_KEYS) {
    if (!messages[key]?.message) {
      addError(errors, file, `${locale}.${key} must be present and non-empty`);
    }
  }
}

function checkManifestMessages(errors, baseMessages) {
  const manifestFiles = listFiles(MANIFEST_DIR).filter((file) =>
    file.endsWith('.json')
  );

  for (const file of manifestFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    for (const match of raw.matchAll(/__MSG_([A-Za-z0-9_]+)__/g)) {
      if (!(match[1] in baseMessages)) {
        addError(errors, file, `manifest references unknown key ${match[1]}`);
      }
    }

    const manifest = JSON.parse(raw);
    if (!manifest.commands) {
      continue;
    }

    for (const [name, command] of Object.entries(manifest.commands)) {
      if (name.startsWith('_execute_')) {
        continue;
      }
      if (!/^__MSG_[A-Za-z0-9_]+__$/.test(command.description || '')) {
        addError(
          errors,
          file,
          `command "${name}" description must use a __MSG_*__ key`
        );
      }
    }
  }
}

function checkSourceReferences(errors, baseMessages) {
  const files = SOURCE_DIRS.flatMap(listFiles).filter((file) =>
    /\.(ts|vue|html|json)$/.test(file)
  );
  const refs = new Map();

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const patterns = [
      /chrome\.i18n\.getMessage\(\s*['"]([A-Za-z0-9_]+)['"]/g,
      /(?<!chrome\.)\bi18n\.([A-Za-z0-9_]+)/g,
      /__MSG_([A-Za-z0-9_]+)__/g,
    ];

    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const key = match[1];
        if (!refs.has(key)) {
          refs.set(key, new Set());
        }
        refs.get(key).add(file);
      }
    }
  }

  for (const [key, filesWithRef] of [...refs.entries()].sort()) {
    if (!(key in baseMessages)) {
      addError(
        errors,
        [...filesWithRef].sort().join(', '),
        `references unknown i18n key ${key}`
      );
    }
  }
}

function main() {
  const errors = [];
  const baseFile = path.join(LOCALES_DIR, BASE_LOCALE, 'messages.json');
  const baseMessages = readJson(baseFile);

  for (const { locale, file } of listLocaleFiles()) {
    const messages = readJson(file);
    compareKeys(errors, baseMessages, locale, file, messages);
    checkLocaleBrand(errors, locale, file, messages);
  }

  checkManifestMessages(errors, baseMessages);
  checkSourceReferences(errors, baseMessages);

  if (errors.length > 0) {
    console.error(`i18n check failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('i18n check passed.');
}

main();
