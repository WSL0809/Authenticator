import "mocha";
import { expect } from "chai";
import { getMatchedEntries, getSiteIdentity } from "../utils";

function entry(issuer: string, hash = issuer): OTPEntryInterface {
  return {
    issuer,
    hash,
  } as OTPEntryInterface;
}

describe("smart filter", () => {
  it("uses the registrable domain across multi-part public suffixes", () => {
    expect(
      getSiteIdentity("Example account", "https://accounts.example.co.uk/login")
    ).to.deep.equal(["example account", "example", "accounts.example.co.uk"]);
  });

  it("recognizes tenants on private suffixes", () => {
    expect(
      getSiteIdentity("Tenant", "https://my-team.github.io/settings")
    ).to.deep.equal(["tenant", "myteam", "my-team.github.io"]);
  });

  it("matches common extended service domains", () => {
    const microsoft = entry("Microsoft");
    const matched = getMatchedEntries(
      [
        "sign in to your account",
        "microsoftonline",
        "login.microsoftonline.com",
      ],
      [microsoft]
    );

    expect(matched).to.deep.equal([microsoft]);
  });

  it("matches an issuer as a complete phrase in the page title", () => {
    const microsoft = entry("Microsoft");
    const matched = getMatchedEntries(
      ["sign in to your microsoft account", "live", "login.live.com"],
      [microsoft]
    );

    expect(matched).to.deep.equal([microsoft]);
  });

  it("does not match an issuer hidden inside another title word", () => {
    const apple = entry("Apple");
    const matched = getMatchedEntries(
      ["pineapple recipes", "recipes", "recipes.example"],
      [apple]
    );

    expect(matched).to.deep.equal([]);
  });

  it("requires a hostname boundary for explicit host matches", () => {
    const example = entry("Example::example.com");

    expect(
      getMatchedEntries(["example", "example", "login.example.com"], [example])
    ).to.deep.equal([example]);
    expect(
      getMatchedEntries(["example", "evil", "example.com.evil.test"], [example])
    ).to.deep.equal([]);
  });

  it("does not let short issuer names loosely match unrelated sites", () => {
    const x = entry("X");

    expect(
      getMatchedEntries(["xylophone", "example", "example.com"], [x])
    ).to.deep.equal([]);
    expect(getMatchedEntries(["x", "x", "x.com"], [x])).to.deep.equal([x]);
  });

  it("handles invalid and non-web URLs without throwing", () => {
    expect(getSiteIdentity("Settings", "not a URL")).to.deep.equal([
      "settings",
      null,
      null,
    ]);
    expect(getSiteIdentity("Extensions", "chrome://extensions")).to.deep.equal([
      "extensions",
      null,
      "extensions",
    ]);
  });
});
