'use client';

import React from 'react';
import Link from 'next/link';

const Office = () => {
  const redirectTools = [
    {
      newPath: '/code/password',
      title: 'Password Generator',
      description: 'Generate secure passwords with custom options',
      icon: '🔑',
      newCategory: 'Code',
      categoryIcon: '🖥️'
    },
    {
      newPath: '/text/lorem',
      title: 'Lorem Ipsum Generator',
      description: 'Generate placeholder text for designs and layouts',
      icon: '📝',
      newCategory: 'Text',
      categoryIcon: '🔤'
    }
  ];

  return (
    <div className="category-page">
      
      <div className="tool-group">
        <h2 className="group-title">Tools Have Been Relocated</h2>
        <div className="tools-grid">
          {redirectTools.map((tool, index) => (
            <Link 
              key={tool.newPath} 
              href={tool.newPath} 
              className="tool-card category-card"
              style={{ '--card-index': index }}
            >
              <div className="card-header">
                <div className="category-icon">{tool.icon}</div>
                <div className="category-arrow">→</div>
              </div>
              <div className="card-content">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '4px 8px', 
                  backgroundColor: 'var(--primary-color)', 
                  color: 'white', 
                  borderRadius: '4px', 
                  fontSize: '0.8em' 
                }}>
                  {tool.categoryIcon} Now in {tool.newCategory}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>ℹ️ What Changed?</h3>
        <p style={{ margin: 0, color: '#0369a1' }}>
          We&apos;ve reorganized our tools for better discoverability! 
          <strong> Password Generator</strong> is now with other development tools in <strong>Code</strong>, 
          and <strong>Lorem Ipsum Generator</strong> is with text tools in <strong>Text</strong>.
        </p>
      </div>
    </div>
  );
};

export default Office;
