/**
 * Tests for spam domain denylist
 * REQ-OP006: Silent rejection of known disposable email domains
 */

import { SPAM_DOMAINS, isSpamDomain } from "./spam-denylist";

describe("SPAM_DOMAINS", () => {
  it("REQ-OP006 — contains at least 30 known disposable domains", () => {
    expect(SPAM_DOMAINS.size).toBeGreaterThanOrEqual(30);
  });
});

describe("isSpamDomain", () => {
  describe("REQ-OP006 — known spam domains are rejected", () => {
    it("rejects mailinator.com", () => {
      expect(isSpamDomain("test@mailinator.com")).toBe(true);
    });

    it("rejects guerrillamail.com", () => {
      expect(isSpamDomain("user@guerrillamail.com")).toBe(true);
    });

    it("rejects yopmail.com", () => {
      expect(isSpamDomain("someone@yopmail.com")).toBe(true);
    });

    it("rejects tempmail.com", () => {
      expect(isSpamDomain("anon@tempmail.com")).toBe(true);
    });

    it("rejects 10minutemail.com", () => {
      expect(isSpamDomain("quick@10minutemail.com")).toBe(true);
    });

    it("rejects trashmail.com", () => {
      expect(isSpamDomain("trash@trashmail.com")).toBe(true);
    });

    it("rejects maildrop.cc", () => {
      expect(isSpamDomain("drop@maildrop.cc")).toBe(true);
    });

    it("rejects getnada.com", () => {
      expect(isSpamDomain("nope@getnada.com")).toBe(true);
    });
  });

  describe("REQ-OP006 — real email providers pass through", () => {
    it("allows gmail.com", () => {
      expect(isSpamDomain("user@gmail.com")).toBe(false);
    });

    it("allows yahoo.com", () => {
      expect(isSpamDomain("user@yahoo.com")).toBe(false);
    });

    it("allows outlook.com", () => {
      expect(isSpamDomain("user@outlook.com")).toBe(false);
    });

    it("allows hotmail.com", () => {
      expect(isSpamDomain("user@hotmail.com")).toBe(false);
    });

    it("allows icloud.com", () => {
      expect(isSpamDomain("user@icloud.com")).toBe(false);
    });

    it("allows protonmail.com", () => {
      expect(isSpamDomain("user@protonmail.com")).toBe(false);
    });

    it("allows custom company domains", () => {
      expect(isSpamDomain("contact@bearlakecamp.com")).toBe(false);
    });
  });

  describe("REQ-OP006 — case-insensitive check", () => {
    it("rejects MAILINATOR.COM (all caps)", () => {
      expect(isSpamDomain("test@MAILINATOR.COM")).toBe(true);
    });

    it("rejects Guerrillamail.Com (mixed case)", () => {
      expect(isSpamDomain("user@Guerrillamail.Com")).toBe(true);
    });

    it("rejects YOPMAIL.COM", () => {
      expect(isSpamDomain("user@YOPMAIL.COM")).toBe(true);
    });
  });

  describe("REQ-OP006 — invalid/empty emails handled gracefully", () => {
    it("returns false for empty string", () => {
      expect(isSpamDomain("")).toBe(false);
    });

    it("returns false for string with no @ symbol", () => {
      expect(isSpamDomain("notanemail")).toBe(false);
    });

    it("returns false for string ending with @", () => {
      expect(isSpamDomain("user@")).toBe(false);
    });

    it("returns false for @ only", () => {
      expect(isSpamDomain("@")).toBe(false);
    });
  });

  describe("REQ-OP006 — subdomain rejection (optional)", () => {
    it("rejects sub.mailinator.com when mailinator.com is in denylist", () => {
      expect(isSpamDomain("test@sub.mailinator.com")).toBe(true);
    });

    it("rejects deep.sub.guerrillamail.com", () => {
      expect(isSpamDomain("x@deep.sub.guerrillamail.com")).toBe(true);
    });
  });
});
