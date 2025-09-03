'use client';

import React from 'react';
import Link from 'next/link';

const TextTools = () => {
  const tools = [
    {
      path: '/text/space-remover',
      title: 'Space Remover',
      description: 'Remove, replace, or normalize spaces and whitespace in text',
      icon: '🚫',
      category: 'Processing'
    },
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
      path: '/text/lorem',
      title: 'Lorem Ipsum Generator',
      description: 'Generate placeholder text for designs and layouts',
      icon: '📝',
      category: 'Generation'
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

  return (
    <div className="category-page">
      
      {Object.entries(groupedTools).map(([category, categoryTools], groupIndex) => (
        <div key={category} className="tool-group">
          <h2 className="group-title">{category}</h2>
          <div className="tools-grid">
            {categoryTools.map((tool, index) => {
              const globalIndex = Object.entries(groupedTools).slice(0, groupIndex).reduce((acc, [, tools]) => acc + tools.length, 0) + index;
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

export default TextTools;
