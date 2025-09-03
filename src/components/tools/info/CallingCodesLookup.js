'use client';

import React, { useState, useEffect } from 'react';

const CallingCodesLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('country');
  const [copied, setCopied] = useState('');

  // Comprehensive list of international calling codes
  const countries = [
    // North America
    { country: 'United States', code: '+1', iso: 'US', flag: '🇺🇸', region: 'North America' },
    { country: 'Canada', code: '+1', iso: 'CA', flag: '🇨🇦', region: 'North America' },
    { country: 'Mexico', code: '+52', iso: 'MX', flag: '🇲🇽', region: 'North America' },
    { country: 'Greenland', code: '+299', iso: 'GL', flag: '🇬🇱', region: 'North America' },
    
    // South America
    { country: 'Brazil', code: '+55', iso: 'BR', flag: '🇧🇷', region: 'South America' },
    { country: 'Argentina', code: '+54', iso: 'AR', flag: '🇦🇷', region: 'South America' },
    { country: 'Chile', code: '+56', iso: 'CL', flag: '🇨🇱', region: 'South America' },
    { country: 'Colombia', code: '+57', iso: 'CO', flag: '🇨🇴', region: 'South America' },
    { country: 'Peru', code: '+51', iso: 'PE', flag: '🇵🇪', region: 'South America' },
    { country: 'Venezuela', code: '+58', iso: 'VE', flag: '🇻🇪', region: 'South America' },
    { country: 'Uruguay', code: '+598', iso: 'UY', flag: '🇺🇾', region: 'South America' },
    { country: 'Paraguay', code: '+595', iso: 'PY', flag: '🇵🇾', region: 'South America' },
    { country: 'Bolivia', code: '+591', iso: 'BO', flag: '🇧🇴', region: 'South America' },
    { country: 'Ecuador', code: '+593', iso: 'EC', flag: '🇪🇨', region: 'South America' },
    { country: 'Guyana', code: '+592', iso: 'GY', flag: '🇬🇾', region: 'South America' },
    { country: 'Suriname', code: '+597', iso: 'SR', flag: '🇸🇷', region: 'South America' },
    
    // Europe
    { country: 'United Kingdom', code: '+44', iso: 'GB', flag: '🇬🇧', region: 'Europe' },
    { country: 'Germany', code: '+49', iso: 'DE', flag: '🇩🇪', region: 'Europe' },
    { country: 'France', code: '+33', iso: 'FR', flag: '🇫🇷', region: 'Europe' },
    { country: 'Italy', code: '+39', iso: 'IT', flag: '🇮🇹', region: 'Europe' },
    { country: 'Spain', code: '+34', iso: 'ES', flag: '🇪🇸', region: 'Europe' },
    { country: 'Netherlands', code: '+31', iso: 'NL', flag: '🇳🇱', region: 'Europe' },
    { country: 'Belgium', code: '+32', iso: 'BE', flag: '🇧🇪', region: 'Europe' },
    { country: 'Switzerland', code: '+41', iso: 'CH', flag: '🇨🇭', region: 'Europe' },
    { country: 'Austria', code: '+43', iso: 'AT', flag: '🇦🇹', region: 'Europe' },
    { country: 'Poland', code: '+48', iso: 'PL', flag: '🇵🇱', region: 'Europe' },
    { country: 'Czech Republic', code: '+420', iso: 'CZ', flag: '🇨🇿', region: 'Europe' },
    { country: 'Hungary', code: '+36', iso: 'HU', flag: '🇭🇺', region: 'Europe' },
    { country: 'Romania', code: '+40', iso: 'RO', flag: '🇷🇴', region: 'Europe' },
    { country: 'Bulgaria', code: '+359', iso: 'BG', flag: '🇧🇬', region: 'Europe' },
    { country: 'Greece', code: '+30', iso: 'GR', flag: '🇬🇷', region: 'Europe' },
    { country: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹', region: 'Europe' },
    { country: 'Sweden', code: '+46', iso: 'SE', flag: '🇸🇪', region: 'Europe' },
    { country: 'Norway', code: '+47', iso: 'NO', flag: '🇳🇴', region: 'Europe' },
    { country: 'Denmark', code: '+45', iso: 'DK', flag: '🇩🇰', region: 'Europe' },
    { country: 'Finland', code: '+358', iso: 'FI', flag: '🇫🇮', region: 'Europe' },
    { country: 'Russia', code: '+7', iso: 'RU', flag: '🇷🇺', region: 'Europe' },
    { country: 'Ukraine', code: '+380', iso: 'UA', flag: '🇺🇦', region: 'Europe' },
    { country: 'Ireland', code: '+353', iso: 'IE', flag: '🇮🇪', region: 'Europe' },
    { country: 'Iceland', code: '+354', iso: 'IS', flag: '🇮🇸', region: 'Europe' },
    { country: 'Croatia', code: '+385', iso: 'HR', flag: '🇭🇷', region: 'Europe' },
    { country: 'Serbia', code: '+381', iso: 'RS', flag: '🇷🇸', region: 'Europe' },
    { country: 'Slovenia', code: '+386', iso: 'SI', flag: '🇸🇮', region: 'Europe' },
    { country: 'Slovakia', code: '+421', iso: 'SK', flag: '🇸🇰', region: 'Europe' },
    
    // Asia
    { country: 'China', code: '+86', iso: 'CN', flag: '🇨🇳', region: 'Asia' },
    { country: 'Japan', code: '+81', iso: 'JP', flag: '🇯🇵', region: 'Asia' },
    { country: 'South Korea', code: '+82', iso: 'KR', flag: '🇰🇷', region: 'Asia' },
    { country: 'India', code: '+91', iso: 'IN', flag: '🇮🇳', region: 'Asia' },
    { country: 'Singapore', code: '+65', iso: 'SG', flag: '🇸🇬', region: 'Asia' },
    { country: 'Hong Kong', code: '+852', iso: 'HK', flag: '🇭🇰', region: 'Asia' },
    { country: 'Taiwan', code: '+886', iso: 'TW', flag: '🇹🇼', region: 'Asia' },
    { country: 'Thailand', code: '+66', iso: 'TH', flag: '🇹🇭', region: 'Asia' },
    { country: 'Malaysia', code: '+60', iso: 'MY', flag: '🇲🇾', region: 'Asia' },
    { country: 'Indonesia', code: '+62', iso: 'ID', flag: '🇮🇩', region: 'Asia' },
    { country: 'Philippines', code: '+63', iso: 'PH', flag: '🇵🇭', region: 'Asia' },
    { country: 'Vietnam', code: '+84', iso: 'VN', flag: '🇻🇳', region: 'Asia' },
    { country: 'Pakistan', code: '+92', iso: 'PK', flag: '🇵🇰', region: 'Asia' },
    { country: 'Bangladesh', code: '+880', iso: 'BD', flag: '🇧🇩', region: 'Asia' },
    { country: 'Sri Lanka', code: '+94', iso: 'LK', flag: '🇱🇰', region: 'Asia' },
    { country: 'Nepal', code: '+977', iso: 'NP', flag: '🇳🇵', region: 'Asia' },
    { country: 'Myanmar', code: '+95', iso: 'MM', flag: '🇲🇲', region: 'Asia' },
    { country: 'Cambodia', code: '+855', iso: 'KH', flag: '🇰🇭', region: 'Asia' },
    { country: 'Laos', code: '+856', iso: 'LA', flag: '🇱🇦', region: 'Asia' },
    { country: 'Mongolia', code: '+976', iso: 'MN', flag: '🇲🇳', region: 'Asia' },
    { country: 'Kazakhstan', code: '+7', iso: 'KZ', flag: '🇰🇿', region: 'Asia' },
    { country: 'Uzbekistan', code: '+998', iso: 'UZ', flag: '🇺🇿', region: 'Asia' },
    
    // Middle East
    { country: 'Saudi Arabia', code: '+966', iso: 'SA', flag: '🇸🇦', region: 'Middle East' },
    { country: 'United Arab Emirates', code: '+971', iso: 'AE', flag: '🇦🇪', region: 'Middle East' },
    { country: 'Israel', code: '+972', iso: 'IL', flag: '🇮🇱', region: 'Middle East' },
    { country: 'Turkey', code: '+90', iso: 'TR', flag: '🇹🇷', region: 'Middle East' },
    { country: 'Iran', code: '+98', iso: 'IR', flag: '🇮🇷', region: 'Middle East' },
    { country: 'Iraq', code: '+964', iso: 'IQ', flag: '🇮🇶', region: 'Middle East' },
    { country: 'Jordan', code: '+962', iso: 'JO', flag: '🇯🇴', region: 'Middle East' },
    { country: 'Lebanon', code: '+961', iso: 'LB', flag: '🇱🇧', region: 'Middle East' },
    { country: 'Syria', code: '+963', iso: 'SY', flag: '🇸🇾', region: 'Middle East' },
    { country: 'Kuwait', code: '+965', iso: 'KW', flag: '🇰🇼', region: 'Middle East' },
    { country: 'Qatar', code: '+974', iso: 'QA', flag: '🇶🇦', region: 'Middle East' },
    { country: 'Bahrain', code: '+973', iso: 'BH', flag: '🇧🇭', region: 'Middle East' },
    { country: 'Oman', code: '+968', iso: 'OM', flag: '🇴🇲', region: 'Middle East' },
    { country: 'Yemen', code: '+967', iso: 'YE', flag: '🇾🇪', region: 'Middle East' },
    
    // Africa
    { country: 'South Africa', code: '+27', iso: 'ZA', flag: '🇿🇦', region: 'Africa' },
    { country: 'Egypt', code: '+20', iso: 'EG', flag: '🇪🇬', region: 'Africa' },
    { country: 'Nigeria', code: '+234', iso: 'NG', flag: '🇳🇬', region: 'Africa' },
    { country: 'Kenya', code: '+254', iso: 'KE', flag: '🇰🇪', region: 'Africa' },
    { country: 'Ghana', code: '+233', iso: 'GH', flag: '🇬🇭', region: 'Africa' },
    { country: 'Ethiopia', code: '+251', iso: 'ET', flag: '🇪🇹', region: 'Africa' },
    { country: 'Morocco', code: '+212', iso: 'MA', flag: '🇲🇦', region: 'Africa' },
    { country: 'Algeria', code: '+213', iso: 'DZ', flag: '🇩🇿', region: 'Africa' },
    { country: 'Tunisia', code: '+216', iso: 'TN', flag: '🇹🇳', region: 'Africa' },
    { country: 'Libya', code: '+218', iso: 'LY', flag: '🇱🇾', region: 'Africa' },
    { country: 'Tanzania', code: '+255', iso: 'TZ', flag: '🇹🇿', region: 'Africa' },
    { country: 'Uganda', code: '+256', iso: 'UG', flag: '🇺🇬', region: 'Africa' },
    { country: 'Zimbabwe', code: '+263', iso: 'ZW', flag: '🇿🇼', region: 'Africa' },
    { country: 'Zambia', code: '+260', iso: 'ZM', flag: '🇿🇲', region: 'Africa' },
    
    // Oceania
    { country: 'Australia', code: '+61', iso: 'AU', flag: '🇦🇺', region: 'Oceania' },
    { country: 'New Zealand', code: '+64', iso: 'NZ', flag: '🇳🇿', region: 'Oceania' },
    { country: 'Fiji', code: '+679', iso: 'FJ', flag: '🇫🇯', region: 'Oceania' },
    { country: 'Papua New Guinea', code: '+675', iso: 'PG', flag: '🇵🇬', region: 'Oceania' },
    { country: 'Samoa', code: '+685', iso: 'WS', flag: '🇼🇸', region: 'Oceania' },
    { country: 'Tonga', code: '+676', iso: 'TO', flag: '🇹🇴', region: 'Oceania' },
    { country: 'Vanuatu', code: '+678', iso: 'VU', flag: '🇻🇺', region: 'Oceania' }
  ];

  useEffect(() => {
    filterAndSortCountries();
  }, [searchTerm, selectedRegion, sortBy]);

  const filterAndSortCountries = () => {
    let filtered = countries;

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(country => country.region === selectedRegion);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.country.toLowerCase().includes(term) ||
        country.code.includes(term) ||
        country.iso.toLowerCase().includes(term)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'country':
          return a.country.localeCompare(b.country);
        case 'code':
          return parseInt(a.code.replace('+', '')) - parseInt(b.code.replace('+', ''));
        case 'region':
          return a.region.localeCompare(b.region) || a.country.localeCompare(b.country);
        default:
          return 0;
      }
    });

    setFilteredCountries(filtered);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const regions = [...new Set(countries.map(country => country.region))].sort();

  const getPopularCodes = () => {
    const popular = ['+1', '+44', '+49', '+33', '+86', '+81', '+91', '+61', '+55', '+7'];
    return countries.filter(country => popular.includes(country.code))
      .reduce((unique, country) => {
        if (!unique.find(c => c.code === country.code)) {
          unique.push(country);
        }
        return unique;
      }, [])
      .sort((a, b) => popular.indexOf(a.code) - popular.indexOf(b.code));
  };

  return (
    <div className="tool-container">
        {/* Popular Calling Codes */}
        <div className="popular-codes-section">
          <h3>🌟 Most Popular Codes</h3>
          <div className="popular-codes-grid">
            {getPopularCodes().map((country) => (
              <div key={`popular-${country.iso}-${country.code}`} className="popular-code-item">
                <span className="popular-flag">{country.flag}</span>
                <span className="popular-code">{country.code}</span>
                <span className="popular-country">{country.country}</span>
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => copyToClipboard(country.code, `popular-${country.iso}`)}
                >
                  {copied === `popular-${country.iso}` ? '✓' : '📋'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          <div className="search-controls">
            <div className="input-group">
              <label className="input-label">Search by country name, calling code, or ISO code</label>
              <input
                type="text"
                className="text-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., United States, +44, GB"
              />
            </div>

            <div className="filter-controls">
              <div className="input-group">
                <label className="input-label">Filter by Region</label>
                <select
                  className="text-input"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Sort by</label>
                <select
                  className="text-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="country">Country Name</option>
                  <option value="code">Calling Code</option>
                  <option value="region">Region</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          <h3>🌍 Results ({filteredCountries.length} countries)</h3>
          
          {filteredCountries.length === 0 ? (
            <div className="no-results">
              <p>No countries found matching your search criteria.</p>
              <p>Try searching for a country name, calling code (like +44), or ISO code (like US).</p>
            </div>
          ) : (
            <div className="calling-codes-grid">
              {filteredCountries.map((country) => (
                <div key={`${country.iso}-${country.code}-${country.country}`} className="calling-code-card">
                  <div className="card-header">
                    <span className="country-flag">{country.flag}</span>
                    <div className="country-info">
                      <h4 className="country-name">{country.country}</h4>
                      <span className="country-region">{country.region}</span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="code-display">
                      <span className="calling-code">{country.code}</span>
                      <span className="iso-code">({country.iso})</span>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => copyToClipboard(country.code, country.iso)}
                        title={`Copy ${country.code} to clipboard`}
                      >
                        {copied === country.iso ? '✓ Copied!' : '📋 Copy Code'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Information */}
        <div className="usage-info">
          <h3>📖 How to Use International Calling Codes</h3>
          <div className="usage-examples">
            <div className="usage-item">
              <h4>📱 From Mobile Phone:</h4>
              <p>Dial: <code>{filteredCountries.length > 0 ? filteredCountries[0].code : '+XX'} + Area Code + Local Number</code></p>
              <p>Example: <code>+1 555 123-4567</code> (US number)</p>
            </div>
            
            <div className="usage-item">
              <h4>🏠 From Landline:</h4>
              <p>Dial: <code>00 + Country Code + Area Code + Local Number</code></p>
              <p>Example: <code>00 1 555 123-4567</code> (calling US from most countries)</p>
            </div>
            
            <div className="usage-item">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Always include the &apos;+&apos; symbol when saving international numbers</li>
                <li>Remove leading zeros from area codes when dialing internationally</li>
                <li>Some countries share the same calling code (like +1 for US & Canada)</li>
                <li>Mobile apps usually handle the &apos;+&apos; symbol automatically</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
};

export default CallingCodesLookup;
