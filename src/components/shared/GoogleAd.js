import React, { useEffect, useRef, useState, useMemo } from 'react';

const GoogleAd = ({ 
  adClient = process.env.REACT_APP_GOOGLE_ADSENSE_CLIENT || "ca-pub-8806399994474387",
  adSlot = process.env.REACT_APP_GOOGLE_ADSENSE_SLOT,
  adFormat = "rectangle",
  width = 300,
  height = 250,
  responsive = false,
  className = ""
}) => {
  const adRef = useRef(null);
  const adInitialized = useRef(false);
  const [adError, setAdError] = useState(false);

  // Create a stable unique key for this ad instance
  const adKey = useMemo(() => 
    `${adClient || 'default'}-${adSlot || 'default'}-${Math.random().toString(36).substr(2, 9)}`, 
    [adClient, adSlot]
  );

  useEffect(() => {
    let mounted = true;

    const loadAd = async () => {
      // Don't load if already initialized
      if (adInitialized.current) {
        return;
      }

      // Reset states
      if (mounted) {
        setAdError(false);
      }

      try {
        // Only load ads if we're in production or have valid ad credentials
        if (adClient && adClient !== "ca-pub-xxxxxxxxxx" && window.adsbygoogle && adRef.current) {
          // Check if this ad element already has an ad loaded
          const existingAd = adRef.current.querySelector('ins[data-adsbygoogle-status]');
          if (existingAd) {
            if (mounted) {
              adInitialized.current = true;
            }
            return;
          }

          // Wait a brief moment to ensure DOM is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (mounted && adRef.current && !adInitialized.current) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adInitialized.current = true;
          }
        }
      } catch (err) {
        console.warn('Google AdSense initialization skipped:', err.message);
        if (mounted) setAdError(false); // Don't show error, just skip ad loading
      }
    };

    // Only load ads in production with valid credentials
    const isProduction = process.env.NODE_ENV === 'production';
    const hasValidCredentials = adClient && adClient.startsWith("ca-pub-") && 
                                 adSlot && adSlot !== "xxxxxxxxxx";

    if (isProduction && hasValidCredentials) {
      loadAd();
    }

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [adClient, adSlot]); // Only re-run if ad credentials change

  // Show placeholder in development or when ad slot is not set
  const isProduction = process.env.NODE_ENV === 'production';
  const hasValidCredentials = adClient && adClient.startsWith("ca-pub-") && 
                               adSlot && adSlot !== "xxxxxxxxxx";

  if (!isProduction || !hasValidCredentials) {
    return (
      <div className={`ad-container ${className}`} ref={adRef}>
        <div className="ad-placeholder" style={{ width: `${width}px`, height: `${height}px` }}>
          <span>Advertisement</span>
          <div className="ad-size">{width} × {height}</div>
          {!hasValidCredentials && (
            <div className="ad-setup-note">
              {adSlot === "xxxxxxxxxx" ? 
                "Create ad units in AdSense and set REACT_APP_GOOGLE_ADSENSE_SLOT" : 
                "Set REACT_APP_GOOGLE_ADSENSE_CLIENT and REACT_APP_GOOGLE_ADSENSE_SLOT"
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      {adError ? (
        <div className="ad-error" style={{ width: `${width}px`, height: `${height}px` }}>
          <span>Ad failed to load</span>
        </div>
      ) : (
        <ins
          key={adKey} // Stable unique key to prevent conflicts
          className="adsbygoogle"
          style={{
            display: 'block',
            width: responsive ? 'auto' : `${width}px`,
            height: responsive ? 'auto' : `${height}px`
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={responsive ? "true" : "false"}
        ></ins>
      )}
    </div>
  );
};

export default GoogleAd;
