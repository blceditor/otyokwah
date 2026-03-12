// Calculate WCAG-compliant color closest to target
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid hex color');
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  // Euclidean distance in RGB space
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

// Target color and requirements
const target = '#5A9A01';
const targetRgb = hexToRgb(target);
const whiteLuminance = 1.0; // #FFFFFF
const minContrast = 4.5; // WCAG AA for normal text

console.log(`Target color: ${target} RGB${JSON.stringify(targetRgb)}`);
console.log(`Target luminance: ${relativeLuminance(...targetRgb).toFixed(3)}`);
console.log(`Target contrast on white: ${contrastRatio(whiteLuminance, relativeLuminance(...targetRgb)).toFixed(2)}:1`);
console.log(`Minimum required: ${minContrast}:1\n`);

// Find closest color that meets WCAG AA
let bestColor: [number, number, number] = targetRgb;
let bestDistance = Infinity;

// Search by scaling RGB values down proportionally
for (let scale = 1.0; scale >= 0.3; scale -= 0.01) {
  const [r, g, b] = targetRgb.map(v => Math.round(v * scale)) as [number, number, number];
  const lum = relativeLuminance(r, g, b);
  const contrast = contrastRatio(whiteLuminance, lum);

  if (contrast >= minContrast) {
    const distance = colorDistance(targetRgb, [r, g, b]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestColor = [r, g, b];
    }
  }
}

const bestHex = rgbToHex(...bestColor);
const bestLum = relativeLuminance(...bestColor);
const bestContrast = contrastRatio(whiteLuminance, bestLum);

console.log(`\n✓ Best WCAG AA compliant color:`);
console.log(`  ${bestHex} RGB${JSON.stringify(bestColor)}`);
console.log(`  Contrast ratio: ${bestContrast.toFixed(2)}:1`);
console.log(`  Distance from target: ${bestDistance.toFixed(2)}`);
console.log(`  Luminance: ${bestLum.toFixed(3)}`);
