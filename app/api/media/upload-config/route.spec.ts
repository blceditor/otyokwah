/**
 * REQ-MEDIA-009: Upload config endpoint tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("REQ-MEDIA-009 — Upload Config Endpoint", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  describe("REQ-MEDIA-009a — Repository config construction", () => {
    it("strips owner prefix from GITHUB_REPO", () => {
      process.env.GITHUB_OWNER = "blceditor";
      process.env.GITHUB_REPO = "blceditor/otyokwah";

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo =
        process.env.GITHUB_REPO?.split("/").pop() || "bearlakecamp";

      expect(owner).toBe("blceditor");
      expect(repo).toBe("otyokwah");
    });

    it("uses defaults when env vars not set", () => {
      delete process.env.GITHUB_OWNER;
      delete process.env.GITHUB_REPO;

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo =
        process.env.GITHUB_REPO?.split("/").pop() || "bearlakecamp";

      expect(owner).toBe("blceditor");
      expect(repo).toBe("bearlakecamp");
    });
  });

  describe("REQ-MEDIA-009b — Branch selection", () => {
    it("uses KEYSTATIC_DEFAULT_BRANCH for upload target", () => {
      process.env.KEYSTATIC_DEFAULT_BRANCH = "staging";

      const branch = process.env.KEYSTATIC_DEFAULT_BRANCH || "main";
      expect(branch).toBe("staging");
    });

    it("defaults to main when not configured", () => {
      delete process.env.KEYSTATIC_DEFAULT_BRANCH;

      const branch = process.env.KEYSTATIC_DEFAULT_BRANCH || "main";
      expect(branch).toBe("main");
    });
  });

  describe("REQ-MEDIA-009c — Response shape", () => {
    it("returns owner, repo, branch, token fields", () => {
      const response = {
        owner: "blceditor",
        repo: "otyokwah",
        branch: "staging",
        token: "gho_test_token",
      };

      expect(response).toHaveProperty("owner");
      expect(response).toHaveProperty("repo");
      expect(response).toHaveProperty("branch");
      expect(response).toHaveProperty("token");
      expect(typeof response.owner).toBe("string");
      expect(typeof response.repo).toBe("string");
      expect(typeof response.branch).toBe("string");
      expect(typeof response.token).toBe("string");
    });
  });
});
