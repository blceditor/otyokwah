# Hero Video Encoding Guide

> **Purpose**: Production-ready FFmpeg commands and settings for encoding hero videos that balance quality with fast loading times.

---

## Target Specifications

| Metric | Desktop | Mobile |
|--------|---------|--------|
| **Resolution** | 1920×1080 (1080p) | 1280×720 (720p) |
| **Length** | 15-20 seconds | 15-20 seconds |
| **Frame Rate** | 24 fps | 24 fps |
| **File Size** | 2-5 MB (target: 2-3 MB) | 1-2 MB |
| **Formats** | WebM + MP4 | WebM + MP4 |
| **Audio** | None (stripped) | None (stripped) |

---

## FFmpeg Commands

### Desktop - MP4 (H.264)

```bash
ffmpeg -i hero-video-original.mp4 \
  -vf "scale=1920:1080:flags=lanczos" \
  -c:v libx264 \
  -preset slow \
  -crf 24 \
  -profile:v high \
  -level 4.0 \
  -movflags +faststart \
  -r 24 \
  -an \
  hero-video-desktop.mp4
```

### Desktop - WebM (VP9)

```bash
ffmpeg -i hero-video-original.mp4 \
  -vf "scale=1920:1080:flags=lanczos" \
  -c:v libvpx-vp9 \
  -b:v 1M \
  -maxrate 1.2M \
  -bufsize 2M \
  -quality good \
  -speed 2 \
  -tile-columns 2 \
  -threads 4 \
  -row-mt 1 \
  -r 24 \
  -an \
  hero-video-desktop.webm
```

### Mobile - MP4 (H.264)

```bash
ffmpeg -i hero-video-original.mp4 \
  -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 \
  -preset slow \
  -crf 26 \
  -profile:v main \
  -level 3.1 \
  -movflags +faststart \
  -r 24 \
  -an \
  hero-video-mobile.mp4
```

### Mobile - WebM (VP9)

```bash
ffmpeg -i hero-video-original.mp4 \
  -vf "scale=1280:720:flags=lanczos" \
  -c:v libvpx-vp9 \
  -b:v 600K \
  -maxrate 750K \
  -bufsize 1.5M \
  -quality good \
  -speed 2 \
  -tile-columns 1 \
  -threads 4 \
  -row-mt 1 \
  -r 24 \
  -an \
  hero-video-mobile.webm
```

---

## Settings Explanation

| Parameter | Value | Why |
|-----------|-------|-----|
| **scale** | `1920:1080` or `1280:720` | Target resolution with Lanczos scaling (high quality) |
| **crf** | `24` (desktop), `26` (mobile) | Constant Rate Factor: 18=visually lossless, 28=acceptable, 24=sweet spot |
| **preset** | `slow` | Better compression (20-30% smaller files, slower encoding) |
| **profile:v** | `high` (desktop), `main` (mobile) | H.264 profile: high=best quality, main=better compatibility |
| **level** | `4.0` (desktop), `3.1` (mobile) | Compatibility level for devices |
| **movflags** | `+faststart` | Moves metadata to start so video can play before fully downloaded |
| **r** | `24` | Frame rate: 24fps is cinematic and 20% smaller than 30fps |
| **an** | - | Strips audio (required for autoplay, saves 500KB+) |
| **b:v** | `1M` / `600K` | Target bitrate for WebM (VP9 codec) |
| **maxrate** | `1.2M` / `750K` | Maximum bitrate spikes allowed |
| **bufsize** | `2M` / `1.5M` | Buffer size for rate control |
| **quality** | `good` | VP9 quality preset (good balance of speed/quality) |
| **speed** | `2` | VP9 encoding speed: 0=slowest/best, 4=fastest/worst |
| **tile-columns** | `2` (desktop), `1` (mobile) | Parallel encoding tiles |
| **row-mt** | `1` | Enable row-based multi-threading |

---

## Poster Image Generation

Extract a high-quality poster image from the video:

```bash
# Extract frame at 2 seconds (adjust time as needed)
ffmpeg -i hero-video-desktop.mp4 \
  -ss 00:00:02 \
  -vframes 1 \
  -q:v 2 \
  hero-camp-poster.jpg

# Optimize with WebP format (smaller file size)
ffmpeg -i hero-camp-poster.jpg \
  -quality 85 \
  hero-camp-poster.webp
```

---

## Quality Verification

### Check File Size
```bash
ls -lh hero-video-*.{mp4,webm}
```

**Expected output:**
```
2.3M  hero-video-desktop.mp4
2.1M  hero-video-desktop.webm
1.2M  hero-video-mobile.mp4
1.0M  hero-video-mobile.webm
```

### Verify Video Properties
```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,bit_rate,codec_name \
  -of json \
  hero-video-desktop.mp4
```

### Test Load Time on 3G
```bash
# 3G connection = 3 Mbps download speed
# File size ÷ 3 Mbps = estimated load time

# 2.5 MB ÷ 3 Mbps = 6.7 seconds ✅ Acceptable
# 5.0 MB ÷ 3 Mbps = 13.3 seconds ❌ Too slow
```

---

## Batch Processing Script

Create `scripts/encode-hero-video.sh`:

```bash
#!/bin/bash
set -e

INPUT="$1"

if [ -z "$INPUT" ]; then
  echo "Usage: $0 input-video.mp4"
  exit 1
fi

echo "🎬 Encoding hero videos from: $INPUT"
echo ""

# Desktop MP4
echo "📹 Encoding desktop MP4..."
ffmpeg -i "$INPUT" \
  -vf "scale=1920:1080:flags=lanczos" \
  -c:v libx264 -preset slow -crf 24 \
  -profile:v high -level 4.0 \
  -movflags +faststart -r 24 -an \
  -y public/videos/hero-camp-desktop.mp4

# Desktop WebM
echo "📹 Encoding desktop WebM..."
ffmpeg -i "$INPUT" \
  -vf "scale=1920:1080:flags=lanczos" \
  -c:v libvpx-vp9 -b:v 1M -maxrate 1.2M -bufsize 2M \
  -quality good -speed 2 -tile-columns 2 -threads 4 -row-mt 1 \
  -r 24 -an \
  -y public/videos/hero-camp-desktop.webm

# Mobile MP4
echo "📱 Encoding mobile MP4..."
ffmpeg -i "$INPUT" \
  -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -preset slow -crf 26 \
  -profile:v main -level 3.1 \
  -movflags +faststart -r 24 -an \
  -y public/videos/hero-camp-mobile.mp4

# Mobile WebM
echo "📱 Encoding mobile WebM..."
ffmpeg -i "$INPUT" \
  -vf "scale=1280:720:flags=lanczos" \
  -c:v libvpx-vp9 -b:v 600K -maxrate 750K -bufsize 1.5M \
  -quality good -speed 2 -tile-columns 1 -threads 4 -row-mt 1 \
  -r 24 -an \
  -y public/videos/hero-camp-mobile.webm

# Poster image
echo "🖼️  Generating poster image..."
ffmpeg -i "$INPUT" -ss 00:00:02 -vframes 1 -q:v 2 \
  -y public/images/hero-camp-poster.jpg

echo ""
echo "✅ Done! Files created:"
ls -lh public/videos/hero-camp-* public/images/hero-camp-poster.jpg
```

Make executable:
```bash
chmod +x scripts/encode-hero-video.sh
```

Usage:
```bash
./scripts/encode-hero-video.sh raw-footage/camp-scenes.mp4
```

---

## Production Checklist

Before deploying hero videos:

- [ ] Desktop MP4 < 5 MB (target: 2-3 MB)
- [ ] Desktop WebM < 5 MB (target: 2-3 MB)
- [ ] Mobile MP4 < 2 MB
- [ ] Mobile WebM < 2 MB
- [ ] Video loops seamlessly (no visible jump at restart)
- [ ] Poster image matches first frame of video
- [ ] No audio track present (`ffprobe` shows 0 audio streams)
- [ ] `faststart` flag present (metadata at beginning)
- [ ] Test autoplay on:
  - [ ] Chrome desktop
  - [ ] Safari desktop
  - [ ] Chrome mobile
  - [ ] Safari iOS (requires `muted` + `playsinline`)
- [ ] Test on throttled connection (Chrome DevTools → Network → Slow 3G)
- [ ] Verify mobile version loads on actual mobile device

---

## Troubleshooting

### Video won't autoplay on iOS
**Solution:** Ensure both `muted` and `playsinline` attributes present:
```html
<video autoplay muted loop playsinline>
```

### File size still too large
**Solutions:**
- Increase CRF value (`-crf 26` instead of 24)
- Reduce video length (15 seconds instead of 20)
- Lower bitrate for WebM (`-b:v 800K` instead of 1M)
- Reduce resolution (`1280×720` instead of 1920×1080)

### Video looks pixelated
**Solutions:**
- Decrease CRF value (`-crf 22` instead of 24)
- Increase WebM bitrate (`-b:v 1.5M` instead of 1M)
- Use higher quality source footage (4K downsampled to 1080p)
- Ensure source has good lighting (avoids compression artifacts)

### Encoding takes too long
**Solutions:**
- Change preset to `medium` or `fast` (sacrifices ~10% file size)
- Reduce `speed` value for VP9 (`-speed 4` instead of 2)
- Use fewer threads for testing (`-threads 2`)

---

## File Locations

| File | Path | Used By |
|------|------|---------|
| Desktop MP4 | `/public/videos/hero-camp-desktop.mp4` | Safari, Edge |
| Desktop WebM | `/public/videos/hero-camp-desktop.webm` | Chrome, Firefox |
| Mobile MP4 | `/public/videos/hero-camp-mobile.mp4` | Safari iOS, mobile browsers |
| Mobile WebM | `/public/videos/hero-camp-mobile.webm` | Chrome mobile |
| Poster | `/public/images/hero-camp-poster.jpg` | All browsers (loading state) |

**Configuration:** [lib/config/homepage.ts:17-21](../lib/config/homepage.ts)
**Component:** [components/homepage/Hero.tsx:14-30](../../components/homepage/Hero.tsx)

---

## References

- [IMPLEMENTATION-TRACKER.md](../project/IMPLEMENTATION-TRACKER.md#L97) — Q2-001 task requirements
- [FINAL-DESIGN-STYLEGUIDE.md](../design/FINAL-DESIGN-STYLEGUIDE.md#L1613-L1650) — Original video optimization guidance
- [FFmpeg H.264 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)
- [FFmpeg VP9 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/VP9)
- [Web Video Performance Best Practices](https://web.dev/fast/#optimize-your-videos)
