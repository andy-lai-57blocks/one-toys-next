'use client';

import React, { useEffect, useRef, useState } from 'react';

const SimpleAdSSG = ({ 
  className = '',
  style = {},
  adSlot = '1681486325',
  adClient = 'ca-pub-8806399994474387'
}) => {
  const adRef = useRef(null);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Check localhost on client-side only to prevent hydration mismatch
  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    );
  }, []);

  useEffect(() => {
    // Skip ads on localhost
    if (isLocalhost) return;

    // Simple AdSense initialization
    if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        // AdSense errors are usually non-critical
        console.warn('AdSense initialization:', error);
      }
    }
  }, [isLocalhost]);

  // Development placeholder
  if (isLocalhost) {
    return (
      <div 
        className={`ad-placeholder ${className}`}
        style={{
          width: '300px',
          height: '250px',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d',
          fontSize: '14px',
          ...style
        }}
      >
        🚫 AdSense (Development Mode)
      </div>
    );
  }

  return (
    <div 
      className={`ad-container ${className}`} 
      style={{
        width: '300px',
        maxWidth: '100%',
        margin: '0 auto',
        ...style
      }} 
      ref={adRef}
    >
      <ins 
        className="adsbygoogle"
        style={{ 
          display: 'block', 
          width: '300px', 
          maxWidth: '100%'
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default SimpleAdSSG;

