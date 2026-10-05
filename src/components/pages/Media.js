'use client';

import React from 'react';
import Link from 'next/link';

const Media = () => {
  // Flat grid, not grouped: two tools is far too few for group headings to
  // carry any information (see the note in TextTools.js). Ordered by usage.
  const tools = [
    {
      path: '/media/image-compress',
      title: 'Image Compressor',
      description: 'Resize and re-encode JPEG, PNG and WebP images without uploading them',
      icon: '🖼️'
    },
    {
      path: '/media/hls',
      title: 'HLS Stream Player',
      description: 'Play and analyze HTTP Live Streaming (HLS) content',
      icon: '📺'
    }
  ];

  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Media Tools</h1>
        <p>{tools.length} tools</p>
      </header>

      <div className="tool-grid">
        {tools.map((tool, index) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="tool-tile"
            style={{ '--card-index': index }}
          >
            <span className="tool-tile-icon" aria-hidden="true">{tool.icon}</span>
            <span className="tool-tile-body">
              <span className="tool-tile-title">{tool.title}</span>
              <span className="tool-tile-desc">{tool.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Media;
