/**
 * REQ-MEDIA-COMPRESS: Client-side image compression tests
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage } from "./compress-image";

function makeFile(name: string, sizeBytes: number, type = "image/jpeg"): File {
  return new File([new ArrayBuffer(sizeBytes)], name, { type });
}

function mockImageLoad(width: number, height: number) {
  vi.spyOn(globalThis, "Image").mockImplementation(() => {
    const img = { width: 0, height: 0 } as unknown as HTMLImageElement;
    Object.defineProperty(img, "src", {
      set() {
        setTimeout(() => {
          Object.assign(img, { width, height });
          img.onload?.(new Event("load") as never);
        }, 0);
      },
    });
    return img;
  });
}

function mockCanvas(outputSize: number) {
  const mockCtx = { drawImage: vi.fn() };
  vi.spyOn(document, "createElement").mockImplementation(
    ((orig: typeof document.createElement) =>
      (tag: string) => {
        if (tag === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: () => mockCtx,
            toBlob: (cb: BlobCallback, type: string) => {
              cb(new Blob([new ArrayBuffer(outputSize)], { type }));
            },
          } as unknown as HTMLCanvasElement;
        }
        return orig.call(document, tag);
      })(document.createElement.bind(document)),
  );
  return mockCtx;
}

describe("REQ-MEDIA-COMPRESS — compressImage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("REQ-MEDIA-COMPRESS-01 — resizes large JPG (4000x3000) to max 1920px", async () => {
    const file = makeFile("big.jpg", 2 * 1024 * 1024);
    mockImageLoad(4000, 3000);
    mockCanvas(400 * 1024);

    const result = await compressImage(file);

    expect(result).not.toBe(file);
    expect(result.size).toBeLessThan(file.size);
    expect(result.name).toBe("big.jpg");
  });

  it("REQ-MEDIA-COMPRESS-02 — skips images under 500KB", async () => {
    const file = makeFile("tiny.jpg", 200 * 1024);
    const imgSpy = vi.spyOn(globalThis, "Image");

    const result = await compressImage(file);

    expect(result).toBe(file);
    expect(imgSpy).not.toHaveBeenCalled();
  });

  it("REQ-MEDIA-COMPRESS-03 — quality-compresses images <=1920px but >500KB", async () => {
    const file = makeFile("medium.jpg", 800 * 1024);
    mockImageLoad(1200, 900);
    mockCanvas(300 * 1024);

    const result = await compressImage(file);

    expect(result).not.toBe(file);
    expect(result.size).toBeLessThan(file.size);
  });

  it("REQ-MEDIA-COMPRESS-04 — skips non-image files (.pdf)", async () => {
    const file = makeFile("doc.pdf", 2 * 1024 * 1024, "application/pdf");

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-05 — skips video files (.mp4)", async () => {
    const file = makeFile("clip.mp4", 10 * 1024 * 1024, "video/mp4");

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-06 — returns original when compressed blob is larger", async () => {
    const file = makeFile("optimized.jpg", 600 * 1024);
    mockImageLoad(4000, 3000);
    mockCanvas(800 * 1024);

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-07 — returns original when canvas getContext fails", async () => {
    const file = makeFile("broken.jpg", 2 * 1024 * 1024);
    mockImageLoad(4000, 3000);
    vi.spyOn(document, "createElement").mockImplementation(
      ((orig: typeof document.createElement) =>
        (tag: string) => {
          if (tag === "canvas") {
            return {
              width: 0,
              height: 0,
              getContext: () => null,
            } as unknown as HTMLCanvasElement;
          }
          return orig.call(document, tag);
        })(document.createElement.bind(document)),
    );

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-08 — returns original when image fails to load", async () => {
    const file = makeFile("corrupt.jpg", 2 * 1024 * 1024);
    vi.spyOn(globalThis, "Image").mockImplementation(() => {
      const img = {} as HTMLImageElement;
      Object.defineProperty(img, "src", {
        set() {
          setTimeout(() => img.onerror?.(new Event("error") as never), 0);
        },
      });
      return img;
    });

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-09 — returns original when toBlob returns null", async () => {
    const file = makeFile("null-blob.jpg", 2 * 1024 * 1024);
    mockImageLoad(4000, 3000);
    vi.spyOn(document, "createElement").mockImplementation(
      ((orig: typeof document.createElement) =>
        (tag: string) => {
          if (tag === "canvas") {
            return {
              width: 0,
              height: 0,
              getContext: () => ({ drawImage: vi.fn() }),
              toBlob: (cb: BlobCallback) => cb(null),
            } as unknown as HTMLCanvasElement;
          }
          return orig.call(document, tag);
        })(document.createElement.bind(document)),
    );

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-10 — compresses PNG as image/png not image/jpeg", async () => {
    const file = makeFile("graphic.png", 2 * 1024 * 1024, "image/png");
    mockImageLoad(3000, 2000);
    let capturedType = "";
    vi.spyOn(document, "createElement").mockImplementation(
      ((orig: typeof document.createElement) =>
        (tag: string) => {
          if (tag === "canvas") {
            return {
              width: 0,
              height: 0,
              getContext: () => ({ drawImage: vi.fn() }),
              toBlob: (cb: BlobCallback, type: string) => {
                capturedType = type;
                cb(new Blob([new ArrayBuffer(500 * 1024)], { type }));
              },
            } as unknown as HTMLCanvasElement;
          }
          return orig.call(document, tag);
        })(document.createElement.bind(document)),
    );

    await compressImage(file);

    expect(capturedType).toBe("image/png");
  });

  it("REQ-MEDIA-COMPRESS-11 — scales landscape proportionally", async () => {
    const file = makeFile("wide.jpg", 2 * 1024 * 1024);
    mockImageLoad(3840, 2160);
    let w = 0, h = 0;
    vi.spyOn(document, "createElement").mockImplementation(
      ((orig: typeof document.createElement) =>
        (tag: string) => {
          if (tag === "canvas") {
            const c = {
              width: 0, height: 0,
              getContext: () => ({ drawImage: vi.fn() }),
              toBlob: (cb: BlobCallback, type: string) => {
                w = c.width; h = c.height;
                cb(new Blob([new ArrayBuffer(400 * 1024)], { type }));
              },
            };
            return c as unknown as HTMLCanvasElement;
          }
          return orig.call(document, tag);
        })(document.createElement.bind(document)),
    );

    await compressImage(file);

    expect(w).toBe(1920);
    expect(h).toBe(1080);
  });

  it("REQ-MEDIA-COMPRESS-12 — scales portrait proportionally", async () => {
    const file = makeFile("tall.jpg", 2 * 1024 * 1024);
    mockImageLoad(2160, 3840);
    let w = 0, h = 0;
    vi.spyOn(document, "createElement").mockImplementation(
      ((orig: typeof document.createElement) =>
        (tag: string) => {
          if (tag === "canvas") {
            const c = {
              width: 0, height: 0,
              getContext: () => ({ drawImage: vi.fn() }),
              toBlob: (cb: BlobCallback, type: string) => {
                w = c.width; h = c.height;
                cb(new Blob([new ArrayBuffer(400 * 1024)], { type }));
              },
            };
            return c as unknown as HTMLCanvasElement;
          }
          return orig.call(document, tag);
        })(document.createElement.bind(document)),
    );

    await compressImage(file);

    expect(w).toBe(1080);
    expect(h).toBe(1920);
  });

  it("REQ-MEDIA-COMPRESS-13 — preserves filename with special characters", async () => {
    const file = makeFile("my photo (2).jpg", 2 * 1024 * 1024);
    mockImageLoad(4000, 3000);
    mockCanvas(400 * 1024);

    const result = await compressImage(file);

    expect(result.name).toBe("my photo (2).jpg");
  });

  it("REQ-MEDIA-COMPRESS-14 — skips .gif files", async () => {
    const file = makeFile("anim.gif", 2 * 1024 * 1024, "image/gif");

    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it("REQ-MEDIA-COMPRESS-15 — handles .webp files", async () => {
    const file = makeFile("hero.webp", 2 * 1024 * 1024, "image/webp");
    mockImageLoad(4000, 3000);
    mockCanvas(400 * 1024);

    const result = await compressImage(file);

    expect(result).not.toBe(file);
    expect(result.size).toBeLessThan(file.size);
  });
});
