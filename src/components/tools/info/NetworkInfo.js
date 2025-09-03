'use client';

import React, { useState, useEffect } from 'react';

const NetworkInfo = () => {
  const [networkInfo, setNetworkInfo] = useState({});
  const [ipInfo, setIpInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getNetworkInfo = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const networkData = {
        // Connection Info
        online: navigator.onLine,
        connectionType: connection?.effectiveType || 'Unknown',
        downlink: connection?.downlink ? connection.downlink + ' Mbps' : 'Unknown',
        uplink: connection?.uplink ? connection.uplink + ' Mbps' : 'Unknown',
        rtt: connection?.rtt ? connection.rtt + ' ms' : 'Unknown',
        saveData: connection?.saveData || false,
        // WebRTC Info
        webrtcSupported: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection),
        // Protocol Info
        protocol: window.location.protocol,
        host: window.location.host,
        port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
        // Browser Capabilities
        websocketSupported: !!window.WebSocket,
        serviceworkerSupported: 'serviceWorker' in navigator,
        webworkerSupported: !!window.Worker,
        // Timing Info
        loadTime: performance.timing ? (performance.timing.loadEventEnd - performance.timing.navigationStart) + ' ms' : 'Unknown',
        domContentLoaded: performance.timing ? (performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) + ' ms' : 'Unknown'
      };
      setNetworkInfo(networkData);
    };

    const getIPInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try multiple IP services in case one fails
        const ipServices = [
          'https://api.ipify.org?format=json',
          'https://httpbin.org/ip',
          'https://api.myip.com'
        ];
        
        let ipData = null;
        
        for (const service of ipServices) {
          try {
            const response = await fetch(service);
            if (response.ok) {
              const data = await response.json();
              ipData = {
                ip: data.ip || data.origin || data.ip_address,
                service: service
              };
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (ipData) {
          // Try to get detailed IP information
          try {
            const detailResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              setIpInfo({
                publicIP: ipData.ip,
                city: detailData.city || 'Unknown',
                region: detailData.region || 'Unknown',
                country: detailData.country_name || 'Unknown',
                countryCode: detailData.country_code || 'Unknown',
                timezone: detailData.timezone || 'Unknown',
                isp: detailData.org || 'Unknown',
                asn: detailData.asn || 'Unknown',
                latitude: detailData.latitude || 'Unknown',
                longitude: detailData.longitude || 'Unknown'
              });
            } else {
              setIpInfo({ publicIP: ipData.ip });
            }
          } catch (err) {
            setIpInfo({ publicIP: ipData.ip });
          }
        } else {
          setError('Unable to fetch IP information');
        }
      } catch (err) {
        setError('Network request failed');
      } finally {
        setLoading(false);
      }
    };

    getNetworkInfo();
    getIPInfo();

    // Listen for online/offline events
    const handleOnlineStatusChange = () => {
      setNetworkInfo(prev => ({ ...prev, online: navigator.onLine }));
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const copyToClipboard = (text) => {
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
        <div className="network-status">
          <div className={`status-indicator ${networkInfo.online ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {networkInfo.online ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
        </div>

        <div className="network-info-container">
          <InfoSection title="Connection" data={networkInfo} icon="📡" />
          
          {loading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Fetching IP information...</p>
            </div>
          )}

          {error && (
            <div className="error-section">
              <p className="error-text">⚠️ {error}</p>
            </div>
          )}

          {!loading && !error && ipInfo.publicIP && (
            <div className="ip-section">
              <InfoSection title="IP & Location" data={ipInfo} icon="🌍" />
              <div className="button-group">
                <button 
                  className="btn btn-outline btn-small" 
                  onClick={() => copyToClipboard(ipInfo.publicIP)}
                >
                  {copied ? '✓ Copied!' : '📋 Copy IP'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="privacy-notice">
          <p><strong>🔒 Privacy Note:</strong> This information is retrieved from your browser and public IP services. No personal data is stored or transmitted to our servers.</p>
        </div>
    </div>
  );
};

export default NetworkInfo;
