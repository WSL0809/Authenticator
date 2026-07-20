import { getDomainWithoutSuffix } from "tldts";

export async function getSiteName() {
  const query = new URLSearchParams(document.location.search.substring(1));

  let title: string | null;
  let url: string | null;
  const titleFromQuery = query.get("title");
  const urlFromQuery = query.get("url");

  if (urlFromQuery !== null) {
    // URLSearchParams already decodes query values. Decoding a second time
    // breaks valid titles and URLs containing literal percent characters.
    title = titleFromQuery;
    url = urlFromQuery;
  } else {
    const tab = await getCurrentTab();
    if (!tab) {
      return [null, null];
    }

    title = tab.title ?? null;
    url = tab.url ?? null;
  }

  return getSiteIdentity(title, url);
}

export function getSiteIdentity(title: string | null, url: string | null) {
  const normalizedTitle = title ? normalizeWords(title) : null;
  if (!url) {
    return [normalizedTitle, null, null];
  }

  let urlParser: URL;
  try {
    urlParser = new URL(url);
  } catch {
    return [normalizedTitle, null, null];
  }

  const hostname = urlParser.hostname.toLowerCase().replace(/\.$/, "");
  if (
    !hostname ||
    (urlParser.protocol !== "http:" && urlParser.protocol !== "https:")
  ) {
    return [normalizedTitle, null, hostname || null];
  }

  const domainWithoutSuffix = getDomainWithoutSuffix(hostname, {
    allowPrivateDomains: true,
  });
  const nameFromDomain = normalizeCompact(domainWithoutSuffix || hostname);

  return [normalizedTitle, nameFromDomain || null, hostname];
}

export async function getPopoutUrl() {
  const currentQuery = new URLSearchParams(
    document.location.search.substring(1)
  );
  let title = currentQuery.get("title");
  let url = currentQuery.get("url");

  if (!url) {
    const tab = await getCurrentTab();
    const extensionUrl = chrome.runtime.getURL("");
    if (tab?.url && !tab.url.startsWith(extensionUrl)) {
      title = tab.title ?? null;
      url = tab.url;
    }
  }

  const popupQuery = new URLSearchParams({ popup: "true" });
  if (url) {
    popupQuery.set("url", url);
    if (title) {
      popupQuery.set("title", title);
    }
  }

  return `view/popup.html?${popupQuery.toString()}`;
}

export function getMatchedEntries(
  siteName: Array<string | null>,
  entries: OTPEntryInterface[]
) {
  if (siteName.length < 2) {
    return false;
  }

  const matched = [];

  for (const entry of entries) {
    if (isMatchedEntry(siteName, entry)) {
      matched.push(entry);
    }
  }

  return matched;
}

export function getMatchedEntriesHash(
  siteName: Array<string | null>,
  entries: OTPEntryInterface[]
) {
  const matchedEnteries = getMatchedEntries(siteName, entries);
  if (matchedEnteries) {
    return matchedEnteries.map((entry) => entry.hash);
  }

  return false;
}

function isMatchedEntry(
  siteName: Array<string | null>,
  entry: OTPEntryInterface
) {
  if (!entry.issuer) {
    return false;
  }

  const [issuerName, explicitHost] = entry.issuer.split("::", 2);
  const issuer = normalizeCompact(issuerName);

  if (!issuer) {
    return false;
  }

  const siteTitle = siteName[0] || "";
  const siteNameFromHost = siteName[1] || "";
  const siteHost = siteName[2] || "";

  if (explicitHost?.trim()) {
    return isExplicitHostMatch(siteHost, explicitHost);
  }

  if (siteNameFromHost && isBrandMatch(issuer, siteNameFromHost)) {
    return true;
  }

  if (siteTitle && isTitleMatch(siteTitle, issuerName)) {
    return true;
  }

  return false;
}

function normalizeWords(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizeCompact(value: string) {
  return normalizeWords(value).replace(/\s/g, "");
}

function isBrandMatch(issuer: string, domainName: string) {
  const domain = normalizeCompact(domainName);
  if (!domain) {
    return false;
  }

  if (issuer === domain) {
    return true;
  }

  // Prefix matching covers common names such as "Microsoft" /
  // "microsoftonline" and "Amazon Web Services" / "amazon". Requiring a
  // meaningful length prevents short issuer names from matching by accident.
  return (
    Math.min(issuer.length, domain.length) >= 4 &&
    (issuer.startsWith(domain) || domain.startsWith(issuer))
  );
}

function isTitleMatch(siteTitle: string, issuerName: string) {
  const title = normalizeWords(siteTitle);
  const issuer = normalizeWords(issuerName);
  if (!title || !issuer || normalizeCompact(issuer).length < 3) {
    return false;
  }

  return ` ${title} `.includes(` ${issuer} `);
}

function isExplicitHostMatch(siteHost: string, explicitHost: string) {
  if (!siteHost) {
    return false;
  }

  const expectedHost = parseExplicitHost(explicitHost);
  if (!expectedHost) {
    return false;
  }

  if (!expectedHost.includes(".")) {
    return siteHost.split(".").includes(expectedHost);
  }

  return siteHost === expectedHost || siteHost.endsWith(`.${expectedHost}`);
}

function parseExplicitHost(value: string) {
  const host = value.trim().replace(/^\*\./, "");
  if (!host) {
    return "";
  }

  try {
    const url = new URL(
      host.includes("://") ? host : `https://${host.toLowerCase()}`
    );
    return url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return "";
  }
}

export async function getCurrentTab() {
  const currentWindow = await chrome.windows.getCurrent();
  const queryOptions = { active: true, windowId: currentWindow.id };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

interface TabWithIdAndURL extends chrome.tabs.Tab {
  id: number;
  url: string;
}

export function okToInjectContentScript(
  tab: chrome.tabs.Tab
): tab is TabWithIdAndURL {
  return (
    tab.id !== undefined &&
    tab.url !== undefined &&
    (tab.url.startsWith("https://") ||
      tab.url.startsWith("http://") ||
      tab.url.startsWith("file://"))
  );
}
