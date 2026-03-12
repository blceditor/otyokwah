// REQ-203: OG Image Templates
import React from 'react';

interface OGTemplateProps {
  title: string;
  subtitle?: string;
  type?: 'default' | 'program' | 'event' | 'staff';
  imageUrl?: string;
}

export function ProgramOGTemplate({ title, subtitle }: OGTemplateProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        padding: '60px',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          fontWeight: '600',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Summer Camp Program
      </div>
      <h1
        style={{
          fontSize: '72px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: '30px',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: '36px',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function EventOGTemplate({ title, subtitle }: OGTemplateProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        padding: '60px',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          fontWeight: '600',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Upcoming Event
      </div>
      <h1
        style={{
          fontSize: '72px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: '30px',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: '36px',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function StaffOGTemplate({ title, subtitle, imageUrl }: OGTemplateProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        padding: '60px',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Meet Our Staff
        </div>
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: '20px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '32px',
              opacity: 0.9,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {imageUrl && (
        <div
          style={{
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: 'white',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '8px solid white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        />
      )}
    </div>
  );
}