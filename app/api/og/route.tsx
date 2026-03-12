// REQ-203: Dynamic OG Image Generation
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { isSsrfSafeUrl } from '@/lib/security/validate-ssrf';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get parameters from URL
  const title = searchParams.get('title') || 'Camp Otyokwah';
  const subtitle = searchParams.get('subtitle') || '';
  const type = searchParams.get('type') || 'default';
  const rawImageUrl = searchParams.get('image') || '';
  const imageUrl = rawImageUrl && isSsrfSafeUrl(rawImageUrl) ? rawImageUrl : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e40af',
          backgroundImage: imageUrl
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo/Camp Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e40af',
            }}
          >
            Camp Otyokwah
          </div>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: type === 'staff' ? '60px' : '72px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.2,
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>

        {/* Subtitle if provided */}
        {subtitle && (
          <p
            style={{
              fontSize: '32px',
              color: 'white',
              textAlign: 'center',
              marginTop: '0',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '24px',
            fontStyle: 'italic',
          }}
        >
          To Know Christ - Phil. 3:10
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}