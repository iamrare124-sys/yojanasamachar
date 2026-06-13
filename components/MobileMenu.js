'use client';
import { useState } from 'react';
import Link from 'next/link';

const siteConfig = require('@/config/site.config');

const states = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu Kashmir',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
        <span>☰</span>
        <span className="menu-text">MENU</span>
      </button>

      {open && (
        <div className="mobile-menu-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span>{siteConfig.siteName}</span>
              <button className="mobile-menu-close" onClick={close} aria-label="Close menu">✕</button>
            </div>
            <nav className="mobile-menu-nav">
              <Link href="/"       onClick={close}>🏠 Home</Link>
              <Link href="/search" onClick={close}>🔍 Search Schemes</Link>

              <div className="mobile-menu-section-label">Categories</div>
              {siteConfig.categories.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={close}>
                  {cat.label}
                </Link>
              ))}

              <div className="mobile-menu-section-label">State Schemes</div>
              {states.map((state) => (
                <Link key={state} href="/category/state-schemes" onClick={close}>
                  {state}
                </Link>
              ))}

              <div className="mobile-menu-section-label">Info</div>
              <Link href="/about"         onClick={close}>About Us</Link>
              <Link href="/privacy-policy" onClick={close}>Privacy Policy</Link>
              <Link href="/disclaimer"     onClick={close}>Disclaimer</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
