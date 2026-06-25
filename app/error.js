'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="not-found-page">
      <h1 style={{ fontSize: 60 }}>⚠️</h1>
      <h2>Something Went Wrong</h2>
      <p>We encountered an error. Please try again or go back to the home page.</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          className="btn-primary"
          style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Try Again
        </button>
        <Link href="/" className="btn-primary" style={{ background: '#555' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
