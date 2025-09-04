'use client';

import React from 'react';
import Link from 'next/link';

const SearchResults = ({ results, query, onClear }) => {
  if (!results || results.length === 0) {
    return (
      <div className="search-results-container">
        <div className="search-results-header">
          <h2 className="search-results-title">
            No results found for &ldquo;<span className="search-query">{query}</span>&rdquo;
          </h2>
          <button onClick={onClear} className="search-clear-results">
            ✕ Clear Search
          </button>
        </div>
        
        <div className="search-no-results">
          <div className="no-results-icon">🔍</div>
          <div className="no-results-content">
            <h3>No tools found</h3>
            <p>Try adjusting your search terms or browse our categories:</p>
            <div className="no-results-suggestions">
              <Link href="/code" className="suggestion-link">Code Tools</Link>
              <Link href="/text" className="suggestion-link">Text Tools</Link>
              <Link href="/datetime" className="suggestion-link">DateTime Tools</Link>
              <Link href="/info" className="suggestion-link">Info Tools</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2 className="search-results-title">
          Found {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;<span className="search-query">{query}</span>&rdquo;
        </h2>
        <button onClick={onClear} className="search-clear-results">
          ✕ Clear Search
        </button>
      </div>

      <div className="search-results-grid">
        {results.map((tool, index) => (
          <SearchResultCard
            key={tool.path}
            tool={tool}
            index={index}
            query={query}
          />
        ))}
      </div>
    </div>
  );
};

const SearchResultCard = ({ tool, index, query }) => {
  // Highlight matching text in title and description
  const highlightText = (text, searchQuery) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <Link
      href={tool.path}
      className="search-result-card"
      style={{ '--card-index': index }}
    >
      <div className="search-card-header">
        <div className="search-card-icon">{tool.icon}</div>
        <div className="search-card-meta">
          <span className="search-card-section">{tool.section}</span>
          <span className="search-card-category">{tool.category}</span>
        </div>
      </div>
      
      <div className="search-card-content">
        <h3 className="search-card-title">
          {highlightText(tool.title, query)}
        </h3>
        <p className="search-card-description">
          {highlightText(tool.description, query)}
        </p>
      </div>
      
      <div className="search-card-footer">
        <span className="search-card-arrow">→</span>
      </div>
    </Link>
  );
};

export default SearchResults;
