'use client';

import React, { useState, useEffect } from 'react';

const BrowserInfo = () => {
  const [browserInfo, setBrowserInfo] = useState({});
  const [features, setFeatures] = useState({});
  const [permissions, setPermissions] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getBrowserInfo = () => {
      const nav = navigator;
      
      // Basic browser information
      const basicInfo = {
        name: getBrowserName(),
        version: getBrowserVersion(),
        userAgent: nav.userAgent,
        vendor: nav.vendor || 'Unknown',
        product: nav.product || 'Unknown',
        appName: nav.appName,
        appVersion: nav.appVersion,
        buildID: nav.buildID || 'Unknown',
        language: nav.language,
        languages: nav.languages?.join(', ') || nav.language,
        platform: nav.platform,
        cookieEnabled: nav.cookieEnabled,
        javaEnabled: nav.javaEnabled ? nav.javaEnabled() : false,
        onLine: nav.onLine,
        doNotTrack: nav.doNotTrack || 'Not specified'
      };

      setBrowserInfo(basicInfo);

      // Check browser features and capabilities
      checkFeatures();
      checkPermissions();
    };

    const getBrowserName = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      if (userAgent.includes('Opera')) return 'Opera';
      if (userAgent.includes('Internet Explorer')) return 'Internet Explorer';
      return 'Unknown';
    };

    const getBrowserVersion = () => {
      const userAgent = navigator.userAgent;
      const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|Version)\/(\d+)/);
      return match ? match[2] : 'Unknown';
    };

    const checkFeatures = () => {
      const featureTests = {
        // HTML5 Features
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof Storage !== 'undefined',
        indexedDB: !!window.indexedDB,
        webSQL: !!window.openDatabase,
        applicationCache: !!window.applicationCache,
        
        // CSS Features
        cssGrid: CSS.supports('display', 'grid'),
        cssFlexbox: CSS.supports('display', 'flex'),
        cssVariables: CSS.supports('color', 'var(--test)'),
        cssAnimations: CSS.supports('animation-name', 'test'),
        
        // JavaScript Features
        webWorkers: !!window.Worker,
        serviceWorkers: 'serviceWorker' in navigator,
        sharedWorkers: !!window.SharedWorker,
        
        // Media Features
        webRTC: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection),
        getUserMedia: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices?.getUserMedia),
        webAudio: !!(window.AudioContext || window.webkitAudioContext),
        
        // Graphics Features
        canvas: !!document.createElement('canvas').getContext,
        webGL: !!document.createElement('canvas').getContext('webgl'),
        webGL2: !!document.createElement('canvas').getContext('webgl2'),
        
        // Network Features
        fetch: !!window.fetch,
        webSockets: !!window.WebSocket,
        xhr2: 'FormData' in window,
        
        // Device Features
        geolocation: 'geolocation' in navigator,
        deviceMotion: 'DeviceMotionEvent' in window,
        deviceOrientation: 'DeviceOrientationEvent' in window,
        vibration: 'vibrate' in navigator,
        
        // Security Features
        cryptoAPI: 'crypto' in window && 'subtle' in window.crypto,
        credentialsAPI: 'credentials' in navigator,
        
        // Other Features
        fullscreen: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled),
        notifications: 'Notification' in window,
        clipboard: 'clipboard' in navigator,
        bluetooth: 'bluetooth' in navigator,
        usb: 'usb' in navigator,
        wakeLock: 'wakeLock' in navigator,
        share: 'share' in navigator,
        fileSystem: 'showOpenFilePicker' in window
      };

      setFeatures(featureTests);
    };

    const checkPermissions = async () => {
      const permissionsList = ['camera', 'microphone', 'notifications', 'geolocation', 'clipboard-write'];
      const permissionsStatus = {};

      for (const permission of permissionsList) {
        try {
          if ('permissions' in navigator) {
            const result = await navigator.permissions.query({ name: permission });
            permissionsStatus[permission] = result.state;
          } else {
            permissionsStatus[permission] = 'unknown';
          }
        } catch (error) {
          permissionsStatus[permission] = 'unsupported';
        }
      }

      setPermissions(permissionsStatus);
    };

    getBrowserInfo();
  }, []);

  const copyToClipboard = () => {
    const allInfo = {
      browser: browserInfo,
      features: features,
      permissions: permissions
    };
    const text = JSON.stringify(allInfo, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const InfoSection = ({ title, data, icon }) => (
    <div className="info-section">
      <h3 className="info-section-title">
        <span className="info-icon">{icon}</span>
        {title}
      </h3>
      <div className="info-grid">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="info-item">
            <span className="info-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className={`info-value ${typeof value === 'boolean' ? (value ? 'supported' : 'unsupported') : ''}`}>
              {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const PermissionSection = ({ title, data, icon }) => (
    <div className="info-section">
      <h3 className="info-section-title">
        <span className="info-icon">{icon}</span>
        {title}
      </h3>
      <div className="info-grid">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="info-item">
            <span className="info-label">{key.replace(/([A-Z-])/g, ' $1').trim()}:</span>
            <span className={`info-value permission-${value}`}>
              {value === 'granted' && '✅ Granted'}
              {value === 'denied' && '❌ Denied'}
              {value === 'prompt' && '❓ Prompt'}
              {value === 'unknown' && '❔ Unknown'}
              {value === 'unsupported' && '🚫 Unsupported'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tool-container">
        <div className="button-group">
          <button className="btn btn-primary" onClick={copyToClipboard}>
            {copied ? '✓ Copied!' : '📋 Copy All Info'}
          </button>
        </div>

        <div className="browser-info-container">
          <InfoSection title="Browser Details" data={browserInfo} icon="🌐" />
          <InfoSection title="Supported Features" data={features} icon="⚡" />
          <PermissionSection title="Permissions Status" data={permissions} icon="🔐" />
        </div>

        <div className="browser-notice">
          <p><strong>ℹ️ Note:</strong> Feature support may vary between browser versions. Some experimental features might not be available in all browsers.</p>
        </div>
    </div>
  );
};

export default BrowserInfo;
