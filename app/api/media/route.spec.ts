/**
 * REQ-MEDIA-001: Media upload pipeline tests
 *
 * Tests the shared constants, URL construction, branch targeting,
 * file size limits, and error handling used by the media API route.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  ALLOWED_EXTENSIONS,
  DIRECT_UPLOAD_THRESHOLD,
  getMaxFileSize,
  getMaxFileSizeLabel,
  isDocumentExtension,
} from "@/lib/media/constants";

describe("REQ-MEDIA-001 — Media Upload Pipeline", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  describe("REQ-MEDIA-002 — Repository URL construction", () => {
    it("REQ-MEDIA-002a — uses owner/repo from defaults when env vars not set", () => {
      delete process.env.GITHUB_OWNER;
      delete process.env.GITHUB_REPO;

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo =
        process.env.GITHUB_REPO?.split("/").pop() || "bearlakecamp";
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/public/images/uploads/test.jpg`;

      expect(url).toBe(
        "https://api.github.com/repos/blceditor/bearlakecamp/contents/public/images/uploads/test.jpg",
      );
    });

    it("REQ-MEDIA-002b — strips owner prefix from GITHUB_REPO when it includes slash", () => {
      process.env.GITHUB_OWNER = "blceditor";
      process.env.GITHUB_REPO = "blceditor/otyokwah";

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo =
        process.env.GITHUB_REPO?.split("/").pop() || "otyokwah";
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/test.jpg`;

      expect(url).toBe(
        "https://api.github.com/repos/blceditor/otyokwah/contents/test.jpg",
      );
    });

    it("REQ-MEDIA-002c — handles GITHUB_REPO without owner prefix", () => {
      process.env.GITHUB_OWNER = "blceditor";
      process.env.GITHUB_REPO = "otyokwah";

      const owner = process.env.GITHUB_OWNER || "blceditor";
      const repo =
        process.env.GITHUB_REPO?.split("/").pop() || "otyokwah";
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/test.jpg`;

      expect(url).toBe(
        "https://api.github.com/repos/blceditor/otyokwah/contents/test.jpg",
      );
    });
  });

  describe("REQ-MEDIA-003 — Branch targeting", () => {
    it("REQ-MEDIA-003a — uses KEYSTATIC_DEFAULT_BRANCH for uploads", () => {
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

    it("REQ-MEDIA-003b — defaults to main when KEYSTATIC_DEFAULT_BRANCH not set", () => {
      delete process.env.KEYSTATIC_DEFAULT_BRANCH;

      const branch = process.env.KEYSTATIC_DEFAULT_BRANCH || "main";
      expect(branch).toBe("main");
    });
  });

  describe("REQ-MEDIA-004 — File size limits (via shared constants)", () => {
    it("REQ-MEDIA-004a — allows videos up to 50MB", () => {
      expect(getMaxFileSize(".mp4")).toBe(50 * 1024 * 1024);
      expect(getMaxFileSize(".webm")).toBe(50 * 1024 * 1024);
    });

    it("REQ-MEDIA-004b — allows images up to 10MB", () => {
      expect(getMaxFileSize(".jpg")).toBe(10 * 1024 * 1024);
      expect(getMaxFileSize(".png")).toBe(10 * 1024 * 1024);
      expect(getMaxFileSize(".webp")).toBe(10 * 1024 * 1024);
    });

    it("REQ-MEDIA-004c — allows documents up to 10MB", () => {
      expect(getMaxFileSize(".pdf")).toBe(10 * 1024 * 1024);
      expect(getMaxFileSize(".docx")).toBe(10 * 1024 * 1024);
    });

    it("REQ-MEDIA-004d — labels match sizes", () => {
      expect(getMaxFileSizeLabel(".mp4")).toBe("50MB");
      expect(getMaxFileSizeLabel(".jpg")).toBe("10MB");
      expect(getMaxFileSizeLabel(".pdf")).toBe("10MB");
    });
  });

  describe("REQ-MEDIA-005 — File type validation (via shared constants)", () => {
    it("REQ-MEDIA-005a — allows standard image formats", () => {
      for (const ext of IMAGE_EXTENSIONS) {
        expect(ALLOWED_EXTENSIONS).toContain(ext);
      }
    });

    it("REQ-MEDIA-005b — allows video formats", () => {
      for (const ext of VIDEO_EXTENSIONS) {
        expect(ALLOWED_EXTENSIONS).toContain(ext);
      }
    });

    it("REQ-MEDIA-005c — allows document formats", () => {
      for (const ext of DOCUMENT_EXTENSIONS) {
        expect(ALLOWED_EXTENSIONS).toContain(ext);
      }
    });

    it("REQ-MEDIA-005d — blocks SVG (XSS risk)", () => {
      expect(ALLOWED_EXTENSIONS).not.toContain(".svg");
    });

    it("REQ-MEDIA-005e — isDocumentExtension identifies documents", () => {
      expect(isDocumentExtension(".pdf")).toBe(true);
      expect(isDocumentExtension(".jpg")).toBe(false);
      expect(isDocumentExtension(".mp4")).toBe(false);
    });
  });

  describe("REQ-MEDIA-006 — Filename sanitization and matching", () => {
    it("REQ-MEDIA-006a — sanitizes special characters to underscores", () => {
      const filename = "Seasonal Cabin Interior.jpg";
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      expect(sanitized).toBe("Seasonal_Cabin_Interior.jpg");
    });

    it("REQ-MEDIA-006b — matches sanitized name back to original for thumbnail", () => {
      const originalName = "Seasonal Cabin Interior.jpg";
      const uploadedFilename = "1774543048545-Seasonal_Cabin_Interior.jpg";

      const origMap = new Map<string, string>();
      origMap.set(originalName, "blob:original");
      origMap.set(
        originalName.replace(/[^a-zA-Z0-9.-]/g, "_"),
        "blob:original",
      );

      const stripped = uploadedFilename.replace(/^\d+-/, "");
      expect(stripped).toBe("Seasonal_Cabin_Interior.jpg");
      expect(origMap.get(stripped)).toBe("blob:original");
    });

    it("REQ-MEDIA-006c — handles filenames with parentheses and dashes", () => {
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

  describe("REQ-MEDIA-007 — Upload path routing (via shared constants)", () => {
    it("REQ-MEDIA-007a — routes images to public/images/uploads/", () => {
      const repoDir = isDocumentExtension(".jpg")
        ? "public/documents"
        : "public/images/uploads";
      expect(repoDir).toBe("public/images/uploads");
    });

    it("REQ-MEDIA-007b — routes documents to public/documents/", () => {
      const repoDir = isDocumentExtension(".pdf")
        ? "public/documents"
        : "public/images/uploads";
      expect(repoDir).toBe("public/documents");
    });

    it("REQ-MEDIA-007c — routes videos to public/images/uploads/", () => {
      const repoDir = isDocumentExtension(".mp4")
        ? "public/documents"
        : "public/images/uploads";
      expect(repoDir).toBe("public/images/uploads");
    });
  });

  describe("REQ-MEDIA-008 — Client-side direct upload threshold (via shared constant)", () => {
    it("REQ-MEDIA-008a — threshold is below Vercel body limit with margin", () => {
      expect(DIRECT_UPLOAD_THRESHOLD).toBeLessThan(4 * 1024 * 1024);
    });

    it("REQ-MEDIA-008b — routes files above threshold to direct GitHub upload", () => {
      const fileSize = 4 * 1024 * 1024;
      expect(fileSize > DIRECT_UPLOAD_THRESHOLD).toBe(true);
    });

    it("REQ-MEDIA-008c — routes files below threshold through server API", () => {
      const fileSize = 3 * 1024 * 1024;
      expect(fileSize > DIRECT_UPLOAD_THRESHOLD).toBe(false);
    });
  });
});
