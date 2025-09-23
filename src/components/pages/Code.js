'use client';

import React from 'react';
import Link from 'next/link';

const Code = () => {
  const tools = [
    // Encoders/Decoders
    {
      path: '/code/base64',
      title: 'Base64 Encoder/Decoder',
      description: 'Encode and decode Base64 strings',
      icon: '🔐',
      category: 'Encoding'
    },
    {
      path: '/code/url',
      title: 'URL Encoder/Decoder',
      description: 'Encode and decode URL strings',
      icon: '🌐',
      category: 'Encoding'
    },
    {
      path: '/code/html',
      title: 'HTML Encoder/Decoder',
      description: 'Encode and decode HTML entities',
      icon: '🏷️',
      category: 'Encoding'
    },
    {
      path: '/code/xml-escaper',
      title: 'XML Escaper/Unescaper',
      description: 'Escape and unescape XML special characters',
      icon: '📝',
      category: 'Encoding'
    },
    {
      path: '/code/json-escaper',
      title: 'JSON Escaper/Unescaper',
      description: 'Escape and unescape JSON special characters',
      icon: '🔤',
      category: 'Encoding'
    },
            {
          path: '/code/gzip',
          title: 'Gzip Compression',
          description: 'Simple text compression and decompression with gzip',
          icon: '🗜️',
          category: 'Encoding'
        },
        {
          path: '/code/hls',
          title: 'HLS Stream Player',
          description: 'Play and analyze HTTP Live Streaming (HLS) content',
          icon: '📺',
          category: 'Media'
        },
    // Formatters
    {
      path: '/code/json',
      title: 'JSON Formatter',
      description: 'Format, validate and minify JSON',
      icon: '📋',
      category: 'Formatting'
    },
    {
      path: '/code/xml',
      title: 'XML Formatter',
      description: 'Format, validate and minify XML',
      icon: '📄',
      category: 'Formatting'
    },
    {
      path: '/code/vast',
      title: 'VAST Formatter',
      description: 'Format, validate and analyze VAST XML for video ads',
      icon: '📺',
      category: 'Formatting'
    },
    // Generators
    {
      path: '/code/uuid',
      title: 'UUID Generator',
      description: 'Generate UUID v1, v4, and Nil UUIDs',
      icon: '🆔',
      category: 'Generators'
    },
    {
      path: '/code/password',
      title: 'Password Generator',
      description: 'Generate secure passwords with custom options',
      icon: '🔑',
      category: 'Generators'
    }
  ];

  const groupedTools = tools.reduce((groups, tool) => {
    const category = tool.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tool);
    return groups;
  }, {});

  // Define category order with Formatting first
  const categoryOrder = ['Formatting', 'Encoding', 'Media', 'Generators'];
  const orderedGroupedTools = categoryOrder
    .filter(category => groupedTools[category]) // Only include categories that exist
    .map(category => [category, groupedTools[category]]);

  return (
    <div className="category-page">
      
      {orderedGroupedTools.map(([category, categoryTools], groupIndex) => (
        <div key={category} className="tool-group">
          <h2 className="group-title">{category}</h2>
          <div className="tools-grid">
            {categoryTools.map((tool, index) => {
              const globalIndex = orderedGroupedTools.slice(0, groupIndex).reduce((acc, [, tools]) => acc + tools.length, 0) + index;
              return (
                <Link 
                  key={tool.path} 
                  href={tool.path} 
                  className="tool-card category-card"
                  style={{ '--card-index': globalIndex }}
                >
                  <div className="card-header">
                    <div className="category-icon">{tool.icon}</div>
                    <div className="category-arrow">→</div>
                  </div>
                  <div className="card-content">
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Code;
