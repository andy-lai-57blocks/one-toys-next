'use client';

import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';

const HLSTool = () => {
  const [hlsUrl, setHlsUrl] = useState('');
  const [error, setError] = useState('');
  const [streamInfo, setStreamInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [streamStats, setStreamStats] = useState({
    loadTime: 0,
    bufferLength: 0,
    droppedFrames: 0
  });
  const [hlsMimeType, setHlsMimeType] = useState(null);
  const [streamFileInfo, setStreamFileInfo] = useState({
    manifestSize: null,
    realDuration: null,
    totalSegments: null
  });
  
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // Sample HLS streams for testing
  const sampleStreams = [
    {
      name: 'Apple Basic Stream',
      url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
      description: 'Apple\'s reference HLS stream with multiple qualities'
    },
    {
      name: 'Big Buck Bunny',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      description: 'Test stream with adaptive bitrates'
    },
    {
      name: 'Sintel Trailer',
      url: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      description: 'Short film trailer in HLS format'
    }
  ];

  useEffect(() => {
    // Update stream stats periodically
    const statsInterval = setInterval(() => {
      if (hlsRef.current && videoRef.current) {
        const hls = hlsRef.current;
        const video = videoRef.current;
        
        setStreamStats({
          loadTime: hls.stats?.total?.loading?.end || 0,
          bufferLength: video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) - video.currentTime : 0,
          droppedFrames: video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality().droppedVideoFrames : 0
        });

        // Update real duration from video element if available and different from manifest
        if (video.duration && !isNaN(video.duration) && video.duration !== Infinity) {
          setStreamFileInfo(prev => ({
            ...prev,
            realDuration: prev.realDuration === 'Master Playlist' || typeof prev.realDuration !== 'number' ? video.duration : prev.realDuration
          }));
        }
      }
    }, 1000);

    return () => clearInterval(statsInterval);
  }, []);

  // Function to detect HLS MIME type
  const detectHLSMimeType = async (url) => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      const contentType = response.headers.get('content-type');
      setHlsMimeType(contentType);
      return contentType;
    } catch {
      // Cross-origin manifests routinely refuse a HEAD request. The UI already
      // says so, which is more useful than a console warning on every load.
      setHlsMimeType('Detection failed');
      return null;
    }
  };

  // Function to get manifest file size and analyze content
  const analyzeHLSManifest = async (url) => {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        mode: 'cors'
      });
      
      const manifestText = await response.text();
      const manifestSize = new Blob([manifestText]).size;
      
      // Parse M3U8 manifest to extract information
      let realDuration = null;
      let totalSegments = 0;

      const lines = manifestText.split('\n');
      let currentDuration = 0;

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('#EXTINF:')) {
          const durationMatch = trimmedLine.match(/#EXTINF:([\d.]+)/);
          if (durationMatch) {
            currentDuration += parseFloat(durationMatch[1]);
            totalSegments++;
          }
        }
      }
      
      // If no segments found, it might be a master playlist
      if (totalSegments === 0) {
        // Try to find variant streams
        for (const line of lines) {
          if (line.trim().endsWith('.m3u8') && !line.startsWith('#')) {
            totalSegments++; // Count variant streams instead
          }
        }
        realDuration = 'Master Playlist';
      } else {
        realDuration = currentDuration;
      }
      
      setStreamFileInfo({ manifestSize, realDuration, totalSegments });
    } catch {
      setStreamFileInfo({
        manifestSize: 'Analysis failed',
        realDuration: 'Analysis failed',
        totalSegments: null
      });
    }
  };

  const loadHLS = async (url) => {
    if (!url) {
      setError('Please enter a valid HLS URL');
      return;
    }

    setError('');
    setStreamInfo(null);
    setAvailableLevels([]);
    setCurrentLevel(-1);
    setHlsMimeType(null);
    setStreamFileInfo({ manifestSize: null, realDuration: null, totalSegments: null });

    // Detect MIME type and analyze manifest
    await detectHLSMimeType(url);
    await analyzeHLSManifest(url);

    if (Hls.isSupported()) {
      // Destroy existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      // Auto-play when media is attached
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        // Browsers routinely block autoplay, so a rejection here is expected
        // and the built-in controls are the fallback.
        videoRef.current.play().catch(() => {});
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setStreamInfo({
          levels: data.levels.length,
          duration: data.totalduration || 'Live',
          type: data.levels[0]?.details?.live ? 'Live' : 'VOD'
        });
        
        setAvailableLevels(data.levels.map((level, index) => ({
          index,
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          fps: level.attrs?.['FRAME-RATE'],
          codecs: level.codecs
        })));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          // Only fatal errors are worth the console: hls.js emits non-fatal
          // ones routinely and recovers from them on its own.
          console.error('HLS fatal error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error: Unable to load the stream');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error: Unable to decode the stream');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error: Unable to play the stream');
              hls.destroy();
              break;
          }
        }
      });

    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = url;
      
      // Auto-play for native HLS
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play().catch(() => {});
      }, { once: true });
      setStreamInfo({
        levels: 1,
        duration: 'Unknown',
        type: 'Native HLS'
      });
    } else {
      setError('HLS is not supported in this browser');
    }
  };



  const handleLevelChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
  };

  const loadSample = (url) => {
    setHlsUrl(url);
    loadHLS(url);
  };

  const handleCopyPlaylist = () => {
    if (hlsUrl) {
      navigator.clipboard.writeText(hlsUrl).then(() => {
        // Could add a toast notification here
      });
    }
  };

  const formatBitrate = (bitrate) => {
    if (bitrate >= 1000000) {
      return (bitrate / 1000000).toFixed(1) + ' Mbps';
    } else if (bitrate >= 1000) {
      return (bitrate / 1000).toFixed(0) + ' Kbps';
    }
    return bitrate + ' bps';
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="tool-container">
      <div className="input-group">
        <label className="input-label">HLS Stream URL (.m3u8)</label>
        <div className="input-with-button">
          <input
            type="text"
            className="text-input"
            value={hlsUrl}
            onChange={(e) => setHlsUrl(e.target.value)}
            placeholder="https://example.com/stream/playlist.m3u8"
            onKeyPress={(e) => e.key === 'Enter' && loadHLS(hlsUrl)}
          />
          <button 
            className="btn btn-primary" 
            onClick={() => loadHLS(hlsUrl)}
            disabled={!hlsUrl.trim()}
          >
            Load Stream
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Sample Streams */}
      <div className="input-group">
        <label className="input-label">Sample HLS Streams</label>
        <div className="sample-streams">
          {sampleStreams.map((stream, index) => (
            <div key={index} className="sample-stream-item">
              <div className="sample-stream-info">
                <strong>{stream.name}</strong>
                <p>{stream.description}</p>
              </div>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => loadSample(stream.url)}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player */}
      <div className="input-group">
        <label className="input-label">Video Player</label>
        <div className="hls-player-container">
          <video 
            ref={videoRef}
            className="hls-video-player"
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            poster="data:image/svg+xml,%3Csvg width='800' height='450' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%236b7280' text-anchor='middle' dy='.3em'%3ELoad an HLS stream to start playback%3C/text%3E%3C/svg%3E"
          />
          
          {streamInfo && (
            <div className="player-overlay">
              <div className="stream-indicator">
                <span className={`stream-status ${streamInfo.type === 'Live' ? 'live' : 'vod'}`}>
                  {streamInfo.type === 'Live' ? '🔴 LIVE' : '▶️ VOD'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stream Information */}
      {streamInfo && (
        <div className="stream-info-section">
          <h3>📊 Stream Information</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>🎬 Stream Details</h4>
              <ul>
                <li><strong>Type:</strong> {streamInfo.type}</li>
                <li><strong>Quality Levels:</strong> {streamInfo.levels}</li>
                <li><strong>Duration:</strong> {streamInfo.duration}</li>
                <li><strong>Current Level:</strong> {currentLevel >= 0 ? currentLevel : 'Auto'}</li>
                {hlsMimeType && (
                  <li><strong>MIME Type:</strong> <code>{hlsMimeType}</code></li>
                )}
                {streamFileInfo.manifestSize && (
                  <li><strong>Manifest Size:</strong> {typeof streamFileInfo.manifestSize === 'number' ? formatFileSize(streamFileInfo.manifestSize) : streamFileInfo.manifestSize}</li>
                )}
                {streamFileInfo.realDuration && (
                  <li><strong>Real Duration:</strong> {
                    typeof streamFileInfo.realDuration === 'number' 
                      ? formatDuration(streamFileInfo.realDuration) + ` (${streamFileInfo.realDuration}s)`
                      : streamFileInfo.realDuration
                  }</li>
                )}
                {streamFileInfo.totalSegments && (
                  <li><strong>Total Segments:</strong> {streamFileInfo.totalSegments}</li>
                )}
              </ul>
            </div>
            
            <div className="info-card">
              <h4>📈 Real-time Stats</h4>
              <ul>
                <li><strong>Buffer Length:</strong> {formatDuration(streamStats.bufferLength)}</li>
                <li><strong>Load Time:</strong> {streamStats.loadTime}ms</li>
                <li><strong>Dropped Frames:</strong> {streamStats.droppedFrames}</li>
                <li><strong>Status:</strong> {isPlaying ? '▶️ Playing' : '⏸️ Paused'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quality Levels */}
      {availableLevels.length > 0 && (
        <div className="quality-levels-section">
          <h3>🎯 Available Quality Levels</h3>
          <div className="quality-levels-grid">
            {availableLevels.map((level) => (
              <div 
                key={level.index} 
                className={`quality-level-card ${currentLevel === level.index ? 'active' : ''}`}
                onClick={() => handleLevelChange(level.index)}
              >
                <div className="quality-resolution">{level.width} × {level.height}</div>
                <div className="quality-bitrate">{formatBitrate(level.bitrate)}</div>
                <div className="quality-fps">{level.fps ? `${level.fps} FPS` : 'Variable FPS'}</div>
                <div className="quality-codecs">{level.codecs}</div>
                {currentLevel === level.index && <div className="quality-active-indicator">●</div>}
              </div>
            ))}
            <div 
              className={`quality-level-card ${currentLevel === -1 ? 'active' : ''}`}
              onClick={() => handleLevelChange(-1)}
            >
              <div className="quality-resolution">Auto</div>
              <div className="quality-bitrate">Adaptive</div>
              <div className="quality-fps">Dynamic</div>
              <div className="quality-codecs">Best Quality</div>
              {currentLevel === -1 && <div className="quality-active-indicator">●</div>}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {hlsUrl && (
        <div className="button-group">
          <button className="btn btn-outline" onClick={handleCopyPlaylist}>
            📋 Copy URL
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => window.open(hlsUrl, '_blank')}
          >
            🔗 Open Playlist
          </button>
          {hlsRef.current && (
            <button 
              className="btn btn-outline" 
              onClick={() => {
                hlsRef.current.destroy();
                setStreamInfo(null);
                setHlsUrl('');
                setError('');
                videoRef.current.src = '';
              }}
            >
              🗑️ Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HLSTool;
