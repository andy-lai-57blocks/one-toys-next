'use client';

import React from 'react';
import Link from 'next/link';
import GlobalSearch from '@/components/search/GlobalSearch';
import SubdomainWrapper from '@/components/shared/SubdomainWrapper';
import { allTools } from '@/utils/toolsData';

// Counts are derived from the single source of truth (toolsData.js) so the
// homepage can never drift from the tools that actually exist again.
const SECTION_BY_PATH = {
  '/code': 'Code',
  '/text': 'Text',
  '/info': 'Info',
  '/datetime': 'DateTime'
};

const countTools = (path) =>
  allTools.filter((tool) => tool.section === SECTION_BY_PATH[path]).length;

const Home = () => {
  const categories = [
    {
      path: '/code',
      title: 'Code',
      description: 'Comprehensive encoding, decoding, and formatting functions for data processing',
      icon: '🖥️',
      toolCount: countTools('/code')
    },
    {
      path: '/text',
      title: 'Text',
      description: 'Advanced text processing and manipulation functions',
      icon: '🔤',
      toolCount: countTools('/text')
    },
    {
      path: '/info',
      title: 'Info',
      description: 'System analysis and information retrieval functions',
      icon: 'ℹ️',
      toolCount: countTools('/info')
    },
    {
      path: '/datetime',
      title: 'DateTime',
      description: 'Comprehensive date, time, and timezone processing functions',
      icon: '🕐',
      toolCount: countTools('/datetime')
    }
  ];

  // Scale bars against the largest category so the progress can't exceed 100%.
  const maxToolCount = Math.max(...categories.map((category) => category.toolCount));

  return (
    <SubdomainWrapper>
      <div className="home-container">
      {/* Enhanced Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-icon">🚀</span>
            <span className="hero-badge-text">Comprehensive Platform</span>
          </div>
          <h1 className="home-title">
            <span className="title-highlight">One</span> Toys
          </h1>
          <p className="home-subtitle">
            One Toys Tools is a comprehensive platform that integrates hundreds of practical functions, 
            designed to help users process various types of data more efficiently and enhance work productivity. 
            Everything you need, organized by category for seamless workflow optimization.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Functions</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">4</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free</span>
            </div>
          </div>
          
          <div className="hero-search-section">
            <GlobalSearch />
          </div>
        </div>
      </div>

      {/* Enhanced Categories Section */}
      <div className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-subtitle">Discover hundreds of practical functions organized by category to boost your productivity</p>
        </div>
        
        <div className="tools-grid">
          {categories.map((category, index) => (
            <Link 
              key={category.path} 
              href={category.path} 
              className="tool-card category-card"
              style={{ '--card-index': index }}
            >
              <div className="card-header">
                <div className="category-icon">{category.icon}</div>
                <div className="category-arrow">→</div>
              </div>
              <div className="card-content">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
              <div className="category-meta">
                <span className="tool-count">
                  {category.toolCount} tool{category.toolCount > 1 ? 's' : ''}
                </span>
                <div className="category-progress-bar">
                  <div className="category-progress" style={{ '--progress': `${(category.toolCount / maxToolCount) * 100}%` }}></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h4>Lightning Fast</h4>
            <p>Process your data instantly with optimized performance</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h4>Privacy First</h4>
            <p>All data processing done locally - your information never leaves your device</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h4>Boost Productivity</h4>
            <p>Hundreds of practical functions to streamline your workflow</p>
          </div>
        </div>
      </div>

      </div>
    </SubdomainWrapper>
  );
};

export default Home;
