'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAutocompleteSuggestions } from '@/utils/toolsData';

const GlobalSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle autocomplete suggestions
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        const suggestions = getAutocompleteSuggestions(query);
        setAutocompleteResults(suggestions);
      } else {
        setAutocompleteResults([]);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Handle clicking outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || autocompleteResults.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          handleSuggestionSelect(autocompleteResults[selectedSuggestion]);
        } else {
          handleSearch();
        }
        break;
              case 'Escape':
        setIsOpen(false);
        setSelectedSuggestion(-1);
        searchInputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle search execution - navigate to search page
  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setAutocompleteResults([]);
      setSelectedSuggestion(-1);
    }
  };

  // Handle suggestion selection - navigate to search page
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    setIsOpen(false);
    setSelectedSuggestion(-1);
    // Navigate to search page with selected suggestion
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    if (query.trim()) {
      const suggestions = getAutocompleteSuggestions(query);
      setAutocompleteResults(suggestions);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestion(-1);
    setIsOpen(true);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setAutocompleteResults([]);
    setIsOpen(false);
    setSelectedSuggestion(-1);
    searchInputRef.current?.focus();
  };

  return (
    <div className="global-search-container" ref={searchContainerRef}>
      <input
        ref={searchInputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder="Search tools... (Press Enter to search)"
        className="global-search-input"
        autoComplete="off"
        spellCheck="false"
      />
      
      {/* Search Icon */}
      <div className="search-input-icon">
        🔍
      </div>
      
      {/* Clear Button */}
      {query && (
        <button
          onClick={handleClear}
          className="search-clear-button"
          type="button"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && autocompleteResults.length > 0 && (
        <div className="autocomplete-dropdown" ref={suggestionsRef}>
          {autocompleteResults.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`autocomplete-item ${index === selectedSuggestion ? 'selected' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedSuggestion(index)}
            >
              <span className="autocomplete-icon">🔍</span>
              <span className="autocomplete-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
