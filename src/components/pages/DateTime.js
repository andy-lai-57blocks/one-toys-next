'use client';

import React from 'react';
import Link from 'next/link';

const DateTime = () => {
  // Tools ordered by general industry usage within each group (most-used first).
  const tools = [
    {
      path: '/datetime/timestamp',
      title: 'Timestamp Converter',
      description: 'Convert between timestamps and human-readable dates',
      icon: '⏰',
      category: 'Conversion'
    },
    {
      path: '/datetime/timezone',
      title: 'Timezone Converter',
      description: 'Convert time between different timezones',
      icon: '🌍',
      category: 'Conversion'
    },
    {
      path: '/datetime/calculator',
      title: 'Date Calculator',
      description: 'Calculate date differences and add/subtract time',
      icon: '🧮',
      category: 'Calculation'
    },
    {
      path: '/datetime/format',
      title: 'Date Formatter',
      description: 'Format dates in various formats and timezones',
      icon: '📅',
      category: 'Formatting'
    },
    {
      path: '/datetime/cron-parser',
      title: 'Cron Expression Parser',
      description: 'Explain a cron schedule in plain English and preview the next runs',
      icon: '⏲️',
      category: 'Scheduling'
    }
  ];

  // FLAT for the same reason as TextTools: four group headings for five tools,
  // three of them holding a single tool.
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>DateTime Tools</h1>
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

export default DateTime;
