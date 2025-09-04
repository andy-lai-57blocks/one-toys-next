'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchTools } from '@/utils/toolsData';
import SearchResults from '@/components/search/SearchResults';
import AppLayout from '@/components/layout/AppLayout';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      setLoading(true);
      
      // Small delay to show loading state
      const searchTimeout = setTimeout(() => {
        const results = searchTools(queryParam);
        setSearchResults(results);
        setLoading(false);
      }, 150);

      return () => clearTimeout(searchTimeout);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleClear = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="search-loading">
          <div className="loading-spinner">🔍</div>
          <p>Finding tools for you...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SearchResults 
        results={searchResults}
        query={query}
        onClear={handleClear}
      />
    </AppLayout>
  );
};

export default SearchPage;
