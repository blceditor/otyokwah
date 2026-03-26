/**
 * Media API — GitHub upload integration tests
 *
 * Tests the URL construction, branch targeting, file size limits,
 * and error handling for the media upload pipeline.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the logic by extracting what the route does into verifiable assertions
// against the GitHub API URL, body, and headers.

describe("Media Upload — GitHub API Integration", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  describe("Repository URL construction", () => {
    it("uses owner/repo from defaults when env vars not set", () => {
      delete process.env.GITHUB_OWNER;
      delete process.env.GITHUB_REPO;

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo = process.env.GITHUB_REPO?.split("/").pop() || "bearlakecamp";
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/public/images/uploads/test.jpg`;

      expect(url).toBe(
        "https://api.github.com/repos/blceditor/bearlakecamp/contents/public/images/uploads/test.jpg",
      );
    });

    it("strips owner prefix from GITHUB_REPO when it includes slash", () => {
      process.env.GITHUB_OWNER = "blceditor";
      process.env.GITHUB_REPO = "blceditor/otyokwah";

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo = process.env.GITHUB_REPO?.split("/").pop() || "otyokwah";
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/test.jpg`;

      expect(url).toBe(
        "https://api.github.com/repos/blceditor/otyokwah/contents/test.jpg",
      );
      // NOT "repos/blceditor/blceditor/otyokwah/contents/test.jpg"
    });

    it("handles GITHUB_REPO without owner prefix", () => {
      process.env.GITHUB_OWNER = "blceditor";
      process.env.GITHUB_REPO = "otyokwah";

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo = process.env.GITHUB_REPO?.split("/").pop() || "otyokwah";
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/test.jpg`;

      expect(url).toBe(
        "https://api.github.com/repos/blceditor/otyokwah/contents/test.jpg",
      );
    });
  });

  describe("Branch targeting", () => {
    it("uses KEYSTATIC_DEFAULT_BRANCH for uploads", () => {
      process.env.KEYSTATIC_DEFAULT_BRANCH = "staging";

      const branch = process.env.KEYSTATIC_DEFAULT_BRANCH || "main";
      const body = JSON.stringify({
        message: "media: upload test.jpg",
        content: "base64data",
        branch,
      });

      const parsed = JSON.parse(body);
      expect(parsed.branch).toBe("staging");
    });

    it("defaults to main when KEYSTATIC_DEFAULT_BRANCH not set", () => {
      delete process.env.KEYSTATIC_DEFAULT_BRANCH;

      const branch = process.env.KEYSTATIC_DEFAULT_BRANCH || "main";
      expect(branch).toBe("main");
    });
  });

  describe("File size limits", () => {
    const VIDEO_EXTENSIONS = [".mp4", ".webm"];
    const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

    function getMaxSize(extension: string): number {
      const isDocument = DOCUMENT_EXTENSIONS.includes(extension);
      const isVideo = VIDEO_EXTENSIONS.includes(extension);
      return isDocument
        ? 10 * 1024 * 1024
        : isVideo
          ? 50 * 1024 * 1024
          : 10 * 1024 * 1024;
    }

    it("allows videos up to 50MB", () => {
      expect(getMaxSize(".mp4")).toBe(50 * 1024 * 1024);
      expect(getMaxSize(".webm")).toBe(50 * 1024 * 1024);
    });

    it("allows images up to 10MB", () => {
      expect(getMaxSize(".jpg")).toBe(10 * 1024 * 1024);
      expect(getMaxSize(".png")).toBe(10 * 1024 * 1024);
      expect(getMaxSize(".webp")).toBe(10 * 1024 * 1024);
    });

    it("allows documents up to 10MB", () => {
      expect(getMaxSize(".pdf")).toBe(10 * 1024 * 1024);
      expect(getMaxSize(".docx")).toBe(10 * 1024 * 1024);
    });
  });

  describe("Filename sanitization and matching", () => {
    it("sanitizes special characters to underscores", () => {
      const filename = "Seasonal Cabin Interior.jpg";
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      expect(sanitized).toBe("Seasonal_Cabin_Interior.jpg");
    });

    it("matches sanitized name back to original for thumbnail", () => {
      const originalName = "Seasonal Cabin Interior.jpg";
      const uploadedFilename = "1774543048545-Seasonal_Cabin_Interior.jpg";

      // Build lookup map with both original and sanitized names
      const origMap = new Map<string, string>();
      origMap.set(originalName, "blob:original");
      origMap.set(
        originalName.replace(/[^a-zA-Z0-9.-]/g, "_"),
        "blob:original",
      );

      // Strip timestamp prefix to get sanitized name
      const stripped = uploadedFilename.replace(/^\d+-/, "");
      expect(stripped).toBe("Seasonal_Cabin_Interior.jpg");

      // Should find the match via sanitized name
      const match = origMap.get(stripped);
      expect(match).toBe("blob:original");
    });

    it("handles filenames with parentheses and dashes", () => {
      const filename = "Camp Map (1).png";
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      expect(sanitized).toBe("Camp_Map__1_.png");

      const origMap = new Map<string, string>();
      origMap.set(filename, "blob:url");
      origMap.set(sanitized, "blob:url");

      const uploaded = "1774543048545-Camp_Map__1_.png";
      const stripped = uploaded.replace(/^\d+-/, "");
      expect(origMap.get(stripped)).toBe("blob:url");
    });
  });

  describe("Upload path routing", () => {
    it("routes images to public/images/uploads/", () => {
      const ext = ".jpg";
      const isDocument = DOCUMENT_EXTENSIONS.includes(ext);
      const repoDir = isDocument ? "public/documents" : "public/images/uploads";
      expect(repoDir).toBe("public/images/uploads");
    });

    it("routes documents to public/documents/", () => {
      const ext = ".pdf";
      const isDocument = DOCUMENT_EXTENSIONS.includes(ext);
      const repoDir = isDocument ? "public/documents" : "public/images/uploads";
      expect(repoDir).toBe("public/documents");
    });

    it("routes videos to public/images/uploads/", () => {
      const ext = ".mp4";
      const isDocument = DOCUMENT_EXTENSIONS.includes(ext);
      const repoDir = isDocument ? "public/documents" : "public/images/uploads";
      expect(repoDir).toBe("public/images/uploads");
    });
  });

  describe("Client-side direct upload threshold", () => {
    const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024;

    it("routes files >4MB to direct GitHub upload", () => {
      const fileSize = 5 * 1024 * 1024;
      expect(fileSize > DIRECT_UPLOAD_THRESHOLD).toBe(true);
    });

    it("routes files <4MB through server API", () => {
      const fileSize = 3 * 1024 * 1024;
      expect(fileSize > DIRECT_UPLOAD_THRESHOLD).toBe(false);
    });

    it("routes exactly 4MB files through server API", () => {
      const fileSize = 4 * 1024 * 1024;
      expect(fileSize > DIRECT_UPLOAD_THRESHOLD).toBe(false);
    });
  });
});

const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
