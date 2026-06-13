'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    try { localStorage.setItem('cookie_consent', 'accepted'); } catch {}
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem('cookie_consent', 'declined'); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <p className="cookie-text">
        We use cookies to improve your experience. By using YojanaSamachar.in, you agree to our{' '}
        <Link href="/cookie-policy">Cookie Policy</Link> and{' '}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
      <div className="cookie-btns">
        <button className="cookie-accept" onClick={accept}>Accept</button>
        <button className="cookie-decline" onClick={decline}>Decline</button>
      </div>
    </div>
  );
}
