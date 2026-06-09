import "mocha";
import * as chai from "chai";

import { OTPAlgorithm } from "../models/otp";
import { parseImportedAlgorithm } from "../models/storage";

const expect = chai.expect;

describe("parseImportedAlgorithm", () => {
  it("imports standard otpauth SHA algorithm strings", () => {
    expect(parseImportedAlgorithm("SHA1")).to.equal(OTPAlgorithm.SHA1);
    expect(parseImportedAlgorithm("SHA256")).to.equal(OTPAlgorithm.SHA256);
    expect(parseImportedAlgorithm("SHA512")).to.equal(OTPAlgorithm.SHA512);
  });

  it("imports standard algorithm strings case-insensitively", () => {
    expect(parseImportedAlgorithm("sha256")).to.equal(OTPAlgorithm.SHA256);
  });

  it("keeps numeric enum string compatibility", () => {
    expect(parseImportedAlgorithm("1")).to.equal(OTPAlgorithm.SHA1);
    expect(parseImportedAlgorithm("2")).to.equal(OTPAlgorithm.SHA256);
    expect(parseImportedAlgorithm("3")).to.equal(OTPAlgorithm.SHA512);
  });

  it("defaults missing or unsupported algorithms to SHA1", () => {
    expect(parseImportedAlgorithm()).to.equal(OTPAlgorithm.SHA1);
    expect(parseImportedAlgorithm("")).to.equal(OTPAlgorithm.SHA1);
    expect(parseImportedAlgorithm("MD5")).to.equal(OTPAlgorithm.SHA1);
    expect(parseImportedAlgorithm("GOST3411_2012_256")).to.equal(
      OTPAlgorithm.SHA1
    );
  });
});
