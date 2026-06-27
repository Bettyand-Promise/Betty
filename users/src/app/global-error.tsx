'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          A critical error occurred. Please refresh the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '1.5rem',
            background: '#E10600',
            color: '#fff',
            border: 0,
            borderRadius: '0',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
