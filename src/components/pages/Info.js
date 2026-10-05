'use client';

import React from 'react';
import Link from 'next/link';

const Info = () => {
  // Tools ordered by general industry usage within each group (most-used first).
  const tools = [
    {
      path: '/info/calling-codes',
      title: 'International Calling Codes',
      description: 'Search and lookup country calling codes worldwide',
      icon: '📞',
      category: 'Lookup'
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
  const categoryOrder = ['Lookup'];
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

export default Info;
