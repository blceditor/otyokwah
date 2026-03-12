// REQ-203: Generate OG Image URLs
interface OGImageParams {
  title: string;
  subtitle?: string;
  type?: 'default' | 'program' | 'event' | 'staff';
  imageUrl?: string;
}

export function generateOGImageURL(params: OGImageParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.bearlakecamp.com';
  const url = new URL(`${baseUrl}/api/og`);

  // Add parameters
  url.searchParams.set('title', params.title);
  if (params.subtitle) url.searchParams.set('subtitle', params.subtitle);
  if (params.type) url.searchParams.set('type', params.type);
  if (params.imageUrl) url.searchParams.set('image', params.imageUrl);

  return url.toString();
}