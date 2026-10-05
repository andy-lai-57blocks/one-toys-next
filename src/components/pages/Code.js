'use client';

import React from 'react';
import Link from 'next/link';

const Code = () => {
  // Tools ordered by general industry usage within each group (most-used first).
  const tools = [
    // Formatters
    {
      path: '/code/json',
      title: 'JSON Formatter',
      description: 'Format, validate and minify JSON',
      icon: '📋',
      category: 'Formatting'
    },
    {
      path: '/code/json-fixer',
      title: 'JSON Fixer',
      description: 'Repair broken JSON locally: fences, comments, trailing commas',
      icon: '🩹',
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
      path: '/code/gzip',
      title: 'Gzip Compression',
      description: 'Simple text compression and decompression with gzip',
      icon: '🗜️',
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
      path: '/code/xml-escaper',
      title: 'XML Escaper/Unescaper',
      description: 'Escape and unescape XML special characters',
      icon: '📝',
      category: 'Encoding'
    },
    // Generators
    {
      path: '/code/password',
      title: 'Password Generator',
      description: 'Generate secure passwords with custom options',
      icon: '🔑',
      category: 'Generators'
    },
    {
      path: '/code/uuid',
      title: 'UUID Generator',
      description: 'Generate UUID v1, v4, and Nil UUIDs',
      icon: '🆔',
      category: 'Generators'
    },
    // Security
    {
      path: '/code/jwt-decoder',
      title: 'JWT Decoder',
      description: 'Decode and verify JSON Web Tokens locally, with security checks',
      icon: '🎫',
      category: 'Security'
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

  // Group order by general industry usage (most-used groups first)
  const categoryOrder = ['Formatting', 'Encoding', 'Generators', 'Security'];
  const orderedGroupedTools = categoryOrder
    .filter(category => groupedTools[category]) // Only include categories that exist
    .map(category => [category, groupedTools[category]]);

  return (
    <div className="category-page">
      {/* The page had no h1 at all — heading order jumped straight to the group
          h2s, which is bad for both screen readers and search engines. */}
      <header className="category-header">
        <h1>Code Tools</h1>
        <p>{tools.length} tools</p>
      </header>

      {/* Grouping earns its place here: 14 tools is enough that the sections
          carry real information. Text and DateTime are flat for the opposite
          reason — see the notes in those files. */}
      {orderedGroupedTools.map(([category, categoryTools], groupIndex) => (
        <div key={category} className="tool-group">
          <h2 className="group-title">{category}</h2>
          <div className="tool-grid">
            {categoryTools.map((tool, index) => {
              const globalIndex = orderedGroupedTools.slice(0, groupIndex).reduce((acc, [, tools]) => acc + tools.length, 0) + index;
              return (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className="tool-tile"
                  style={{ '--card-index': globalIndex }}
                >
                  <span className="tool-tile-icon" aria-hidden="true">{tool.icon}</span>
                  <span className="tool-tile-body">
                    <span className="tool-tile-title">{tool.title}</span>
                    <span className="tool-tile-desc">{tool.description}</span>
                  </span>
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
