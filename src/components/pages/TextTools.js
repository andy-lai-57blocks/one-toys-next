'use client';

import React from 'react';
import Link from 'next/link';

const TextTools = () => {
  // Tools ordered by general industry usage within each group (most-used first).
  const tools = [
    {
      path: '/text/case-converter',
      title: 'Case Converter',
      description: 'Convert text between different case formats',
      icon: '🔤',
      category: 'Conversion'
    },
    {
      path: '/text/character-count',
      title: 'Character Count Tool',
      description: 'Analyze text with detailed character, word, and readability statistics',
      icon: '📊',
      category: 'Analysis'
    },
    {
      path: '/text/space-remover',
      title: 'Space Remover',
      description: 'Remove, replace, or normalize spaces and whitespace in text',
      icon: '🚫',
      category: 'Processing'
    },
    {
      path: '/text/lorem',
      title: 'Lorem Ipsum Generator',
      description: 'Generate placeholder text for designs and layouts',
      icon: '📝',
      category: 'Generation'
    },
    {
      path: '/text/markdown',
      title: 'Markdown Preview',
      description: 'Preview and convert Markdown to HTML with live rendering',
      icon: '📝',
      category: 'Preview'
    }
  ];

  // FLAT on purpose. This used to render five group headings for five tools —
  // one heading per tool — and because each group held a single card, the
  // auto-fit grid stretched that card to the full 1310px row. The heading
  // delivered no grouping information, so it and the grouping code are gone.
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>Text Tools</h1>
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

export default TextTools;
