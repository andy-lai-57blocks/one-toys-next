'use client';

import React, { useState, useEffect } from 'react';

const SystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getSystemInfo = () => {
      const nav = navigator;
      const screen = window.screen;
      const info = {
        // Browser Info
        browser: {
          name: getBrowserName(),
          version: getBrowserVersion(),
          userAgent: nav.userAgent,
          language: nav.language,
          languages: nav.languages?.join(', ') || nav.language,
          cookieEnabled: nav.cookieEnabled,
          onLine: nav.onLine,
          doNotTrack: nav.doNotTrack || 'Not specified'
        },
        // Screen Info
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
          orientation: screen.orientation?.type || 'Unknown'
        },
        // Window Info
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
          devicePixelRatio: window.devicePixelRatio || 1,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        // Platform Info
        platform: {
          platform: nav.platform,
          oscpu: nav.oscpu || 'Unknown',
          hardwareConcurrency: nav.hardwareConcurrency || 'Unknown',
          maxTouchPoints: nav.maxTouchPoints || 0,
          vendor: nav.vendor || 'Unknown',
          product: nav.product || 'Unknown'
        },
        // Memory Info (if available)
        memory: nav.deviceMemory ? {
          deviceMemory: nav.deviceMemory + ' GB',
          jsHeapSizeLimit: nav.memory?.jsHeapSizeLimit ? formatBytes(nav.memory.jsHeapSizeLimit) : 'Unknown',
          totalJSHeapSize: nav.memory?.totalJSHeapSize ? formatBytes(nav.memory.totalJSHeapSize) : 'Unknown',
          usedJSHeapSize: nav.memory?.usedJSHeapSize ? formatBytes(nav.memory.usedJSHeapSize) : 'Unknown'
        } : null,
        // Network Info (if available)
        connection: nav.connection ? {
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink + ' Mbps',
          rtt: nav.connection.rtt + ' ms',
          saveData: nav.connection.saveData
        } : null,
        // Time Info
        time: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: new Date().getTimezoneOffset(),
          timestamp: Date.now(),
          date: new Date().toISOString(),
          locale: Intl.DateTimeFormat().resolvedOptions().locale
        }
      };
      setSystemInfo(info);
    };

    getSystemInfo();
    
    // Update window info on resize
    const handleResize = () => {
      setSystemInfo(prev => ({
        ...prev,
        window: {
          ...prev.window,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight
        }
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  };

  const getBrowserVersion = () => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(systemInfo, null, 2);
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
            <span className="info-value">{String(value)}</span>
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

        <div className="system-info-container">
          <InfoSection title="Browser" data={systemInfo.browser || {}} icon="🌐" />
          <InfoSection title="Screen" data={systemInfo.screen || {}} icon="🖥️" />
          <InfoSection title="Window" data={systemInfo.window || {}} icon="🪟" />
          <InfoSection title="Platform" data={systemInfo.platform || {}} icon="⚙️" />
          {systemInfo.memory && <InfoSection title="Memory" data={systemInfo.memory} icon="🧠" />}
          {systemInfo.connection && <InfoSection title="Connection" data={systemInfo.connection} icon="📡" />}
          <InfoSection title="Time & Location" data={systemInfo.time || {}} icon="🌍" />
        </div>
    </div>
  );
};

export default SystemInfo;
