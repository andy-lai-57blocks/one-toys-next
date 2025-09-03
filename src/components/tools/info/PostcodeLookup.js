'use client';

import React, { useState, useEffect } from 'react';

const PostcodeLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [copied, setCopied] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  // Comprehensive postal code database
  const postalCodes = {
    'US': {
      country: 'United States',
      flag: '🇺🇸',
      format: 'NNNNN or NNNNN-NNNN',
      example: '10001 or 10001-1234',
      description: '5-digit ZIP code, optionally followed by 4-digit extension',
      codes: [
        // Major Cities
        { city: 'New York', state: 'New York', code: '10001-10299', region: 'Northeast', type: 'Manhattan' },
        { city: 'Los Angeles', state: 'California', code: '90001-90899', region: 'West', type: 'Metropolitan' },
        { city: 'Chicago', state: 'Illinois', code: '60601-60661', region: 'Midwest', type: 'Downtown' },
        { city: 'Houston', state: 'Texas', code: '77001-77099', region: 'South', type: 'Metropolitan' },
        { city: 'Phoenix', state: 'Arizona', code: '85001-85099', region: 'West', type: 'Metropolitan' },
        { city: 'Philadelphia', state: 'Pennsylvania', code: '19019-19197', region: 'Northeast', type: 'Metropolitan' },
        { city: 'San Antonio', state: 'Texas', code: '78201-78299', region: 'South', type: 'Metropolitan' },
        { city: 'San Diego', state: 'California', code: '92101-92199', region: 'West', type: 'Metropolitan' },
        { city: 'Dallas', state: 'Texas', code: '75201-75399', region: 'South', type: 'Metropolitan' },
        { city: 'San Jose', state: 'California', code: '95101-95199', region: 'West', type: 'Silicon Valley' },
        { city: 'Austin', state: 'Texas', code: '78701-78799', region: 'South', type: 'Metropolitan' },
        { city: 'Jacksonville', state: 'Florida', code: '32099-32299', region: 'South', type: 'Metropolitan' },
        { city: 'San Francisco', state: 'California', code: '94101-94199', region: 'West', type: 'Metropolitan' },
        { city: 'Columbus', state: 'Ohio', code: '43085-43299', region: 'Midwest', type: 'Metropolitan' },
        { city: 'Fort Worth', state: 'Texas', code: '76101-76199', region: 'South', type: 'Metropolitan' },
        { city: 'Indianapolis', state: 'Indiana', code: '46201-46299', region: 'Midwest', type: 'Metropolitan' },
        { city: 'Charlotte', state: 'North Carolina', code: '28201-28299', region: 'South', type: 'Metropolitan' },
        { city: 'Seattle', state: 'Washington', code: '98101-98199', region: 'West', type: 'Metropolitan' },
        { city: 'Denver', state: 'Colorado', code: '80201-80299', region: 'West', type: 'Metropolitan' },
        { city: 'Boston', state: 'Massachusetts', code: '02101-02299', region: 'Northeast', type: 'Metropolitan' }
      ]
    },
    'GB': {
      country: 'United Kingdom',
      flag: '🇬🇧',
      format: 'AA9A 9AA or A9A 9AA or A9 9AA or A99 9AA or AA9 9AA or AA99 9AA',
      example: 'SW1A 1AA or M1 1AA',
      description: 'UK postcodes have 1-2 letters, 1-2 numbers, space, 1 number, 2 letters',
      codes: [
        { city: 'London', state: 'England', code: 'SW1A 1AA', region: 'Central London', type: 'Westminster' },
        { city: 'London', state: 'England', code: 'EC1A 1BB', region: 'Central London', type: 'City of London' },
        { city: 'London', state: 'England', code: 'W1A 0AX', region: 'Central London', type: 'Oxford Street' },
        { city: 'Manchester', state: 'England', code: 'M1 1AA', region: 'Northwest England', type: 'City Centre' },
        { city: 'Birmingham', state: 'England', code: 'B1 1AA', region: 'West Midlands', type: 'City Centre' },
        { city: 'Leeds', state: 'England', code: 'LS1 1AA', region: 'Yorkshire', type: 'City Centre' },
        { city: 'Glasgow', state: 'Scotland', code: 'G1 1AA', region: 'Central Scotland', type: 'City Centre' },
        { city: 'Sheffield', state: 'England', code: 'S1 1AA', region: 'Yorkshire', type: 'City Centre' },
        { city: 'Bradford', state: 'England', code: 'BD1 1AA', region: 'Yorkshire', type: 'City Centre' },
        { city: 'Edinburgh', state: 'Scotland', code: 'EH1 1AA', region: 'Central Scotland', type: 'City Centre' },
        { city: 'Liverpool', state: 'England', code: 'L1 1AA', region: 'Northwest England', type: 'City Centre' },
        { city: 'Cardiff', state: 'Wales', code: 'CF1 1AA', region: 'South Wales', type: 'City Centre' },
        { city: 'Belfast', state: 'Northern Ireland', code: 'BT1 1AA', region: 'Northern Ireland', type: 'City Centre' },
        { city: 'Leicester', state: 'England', code: 'LE1 1AA', region: 'East Midlands', type: 'City Centre' },
        { city: 'Coventry', state: 'England', code: 'CV1 1AA', region: 'West Midlands', type: 'City Centre' }
      ]
    },
    'CA': {
      country: 'Canada',
      flag: '🇨🇦',
      format: 'A9A 9A9',
      example: 'K1A 0A6',
      description: '6-character postal code: letter-number-letter space number-letter-number',
      codes: [
        { city: 'Toronto', state: 'Ontario', code: 'M5H 2N2', region: 'Central Canada', type: 'Downtown' },
        { city: 'Montreal', state: 'Quebec', code: 'H3A 0G1', region: 'Central Canada', type: 'Downtown' },
        { city: 'Vancouver', state: 'British Columbia', code: 'V6B 1A1', region: 'Western Canada', type: 'Downtown' },
        { city: 'Calgary', state: 'Alberta', code: 'T2P 1J9', region: 'Western Canada', type: 'Downtown' },
        { city: 'Ottawa', state: 'Ontario', code: 'K1A 0A6', region: 'Central Canada', type: 'Federal District' },
        { city: 'Edmonton', state: 'Alberta', code: 'T5J 2R7', region: 'Western Canada', type: 'Downtown' },
        { city: 'Mississauga', state: 'Ontario', code: 'L5B 1M2', region: 'Central Canada', type: 'Suburban' },
        { city: 'Winnipeg', state: 'Manitoba', code: 'R3C 4A5', region: 'Central Canada', type: 'Downtown' },
        { city: 'Quebec City', state: 'Quebec', code: 'G1R 2J6', region: 'Central Canada', type: 'Old City' },
        { city: 'Hamilton', state: 'Ontario', code: 'L8P 4R3', region: 'Central Canada', type: 'Metropolitan' }
      ]
    },
    'DE': {
      country: 'Germany',
      flag: '🇩🇪',
      format: 'NNNNN',
      example: '10115',
      description: '5-digit postal code (Postleitzahl)',
      codes: [
        { city: 'Berlin', state: 'Berlin', code: '10115', region: 'Eastern Germany', type: 'Mitte' },
        { city: 'Hamburg', state: 'Hamburg', code: '20095', region: 'Northern Germany', type: 'City Centre' },
        { city: 'Munich', state: 'Bavaria', code: '80331', region: 'Southern Germany', type: 'City Centre' },
        { city: 'Cologne', state: 'North Rhine-Westphalia', code: '50667', region: 'Western Germany', type: 'City Centre' },
        { city: 'Frankfurt', state: 'Hesse', code: '60311', region: 'Central Germany', type: 'City Centre' },
        { city: 'Stuttgart', state: 'Baden-Württemberg', code: '70173', region: 'Southern Germany', type: 'City Centre' },
        { city: 'Düsseldorf', state: 'North Rhine-Westphalia', code: '40213', region: 'Western Germany', type: 'City Centre' },
        { city: 'Dortmund', state: 'North Rhine-Westphalia', code: '44135', region: 'Western Germany', type: 'City Centre' },
        { city: 'Essen', state: 'North Rhine-Westphalia', code: '45127', region: 'Western Germany', type: 'City Centre' },
        { city: 'Bremen', state: 'Bremen', code: '28195', region: 'Northern Germany', type: 'City Centre' }
      ]
    },
    'FR': {
      country: 'France',
      flag: '🇫🇷',
      format: 'NNNNN',
      example: '75001',
      description: '5-digit postal code (Code postal)',
      codes: [
        { city: 'Paris', state: 'Île-de-France', code: '75001', region: 'Central France', type: '1st Arrondissement' },
        { city: 'Lyon', state: 'Auvergne-Rhône-Alpes', code: '69001', region: 'Eastern France', type: '1st Arrondissement' },
        { city: 'Marseille', state: 'Provence-Alpes-Côte d\'Azur', code: '13001', region: 'Southern France', type: '1st Arrondissement' },
        { city: 'Toulouse', state: 'Occitanie', code: '31000', region: 'Southern France', type: 'City Centre' },
        { city: 'Nice', state: 'Provence-Alpes-Côte d\'Azur', code: '06000', region: 'Southern France', type: 'City Centre' },
        { city: 'Nantes', state: 'Pays de la Loire', code: '44000', region: 'Western France', type: 'City Centre' },
        { city: 'Strasbourg', state: 'Grand Est', code: '67000', region: 'Eastern France', type: 'City Centre' },
        { city: 'Montpellier', state: 'Occitanie', code: '34000', region: 'Southern France', type: 'City Centre' },
        { city: 'Bordeaux', state: 'Nouvelle-Aquitaine', code: '33000', region: 'Western France', type: 'City Centre' },
        { city: 'Lille', state: 'Hauts-de-France', code: '59000', region: 'Northern France', type: 'City Centre' }
      ]
    },
    'JP': {
      country: 'Japan',
      flag: '🇯🇵',
      format: 'NNN-NNNN',
      example: '100-0001',
      description: '7-digit postal code with hyphen (Yūbin-bangō)',
      codes: [
        { city: 'Tokyo', state: 'Tokyo', code: '100-0001', region: 'Kanto', type: 'Chiyoda (Imperial Palace)' },
        { city: 'Yokohama', state: 'Kanagawa', code: '220-0011', region: 'Kanto', type: 'Nishi-ku' },
        { city: 'Osaka', state: 'Osaka', code: '530-0001', region: 'Kansai', type: 'Kita-ku' },
        { city: 'Nagoya', state: 'Aichi', code: '450-0001', region: 'Chubu', type: 'Nakamura-ku' },
        { city: 'Sapporo', state: 'Hokkaido', code: '060-0001', region: 'Hokkaido', type: 'Chuo-ku' },
        { city: 'Fukuoka', state: 'Fukuoka', code: '810-0001', region: 'Kyushu', type: 'Chuo-ku' },
        { city: 'Kyoto', state: 'Kyoto', code: '600-0001', region: 'Kansai', type: 'Shimogyo-ku' },
        { city: 'Kobe', state: 'Hyogo', code: '650-0001', region: 'Kansai', type: 'Chuo-ku' },
        { city: 'Sendai', state: 'Miyagi', code: '980-0001', region: 'Tohoku', type: 'Aoba-ku' },
        { city: 'Hiroshima', state: 'Hiroshima', code: '730-0001', region: 'Chugoku', type: 'Naka-ku' }
      ]
    },
    'CN': {
      country: 'China',
      flag: '🇨🇳',
      format: 'NNNNNN',
      example: '100000',
      description: '6-digit postal code (邮政编码)',
      codes: [
        { city: 'Beijing', state: 'Beijing', code: '100000', region: 'North China', type: 'City Centre' },
        { city: 'Shanghai', state: 'Shanghai', code: '200000', region: 'East China', type: 'City Centre' },
        { city: 'Guangzhou', state: 'Guangdong', code: '510000', region: 'South China', type: 'City Centre' },
        { city: 'Shenzhen', state: 'Guangdong', code: '518000', region: 'South China', type: 'City Centre' },
        { city: 'Tianjin', state: 'Tianjin', code: '300000', region: 'North China', type: 'City Centre' },
        { city: 'Wuhan', state: 'Hubei', code: '430000', region: 'Central China', type: 'City Centre' },
        { city: 'Xi\'an', state: 'Shaanxi', code: '710000', region: 'Northwest China', type: 'City Centre' },
        { city: 'Chengdu', state: 'Sichuan', code: '610000', region: 'Southwest China', type: 'City Centre' },
        { city: 'Nanjing', state: 'Jiangsu', code: '210000', region: 'East China', type: 'City Centre' },
        { city: 'Hangzhou', state: 'Zhejiang', code: '310000', region: 'East China', type: 'City Centre' }
      ]
    },
    'IN': {
      country: 'India',
      flag: '🇮🇳',
      format: 'NNNNNN',
      example: '110001',
      description: '6-digit PIN (Postal Index Number)',
      codes: [
        { city: 'New Delhi', state: 'Delhi', code: '110001', region: 'Northern India', type: 'Central Delhi' },
        { city: 'Mumbai', state: 'Maharashtra', code: '400001', region: 'Western India', type: 'South Mumbai' },
        { city: 'Kolkata', state: 'West Bengal', code: '700001', region: 'Eastern India', type: 'Central Kolkata' },
        { city: 'Chennai', state: 'Tamil Nadu', code: '600001', region: 'Southern India', type: 'Central Chennai' },
        { city: 'Bangalore', state: 'Karnataka', code: '560001', region: 'Southern India', type: 'Central Bangalore' },
        { city: 'Hyderabad', state: 'Telangana', code: '500001', region: 'Southern India', type: 'Central Hyderabad' },
        { city: 'Pune', state: 'Maharashtra', code: '411001', region: 'Western India', type: 'Central Pune' },
        { city: 'Ahmedabad', state: 'Gujarat', code: '380001', region: 'Western India', type: 'Central Ahmedabad' },
        { city: 'Jaipur', state: 'Rajasthan', code: '302001', region: 'Northern India', type: 'Central Jaipur' },
        { city: 'Lucknow', state: 'Uttar Pradesh', code: '226001', region: 'Northern India', type: 'Central Lucknow' }
      ]
    },
    'AU': {
      country: 'Australia',
      flag: '🇦🇺',
      format: 'NNNN',
      example: '2000',
      description: '4-digit postcode',
      codes: [
        { city: 'Sydney', state: 'New South Wales', code: '2000', region: 'Eastern Australia', type: 'CBD' },
        { city: 'Melbourne', state: 'Victoria', code: '3000', region: 'Southeastern Australia', type: 'CBD' },
        { city: 'Brisbane', state: 'Queensland', code: '4000', region: 'Eastern Australia', type: 'CBD' },
        { city: 'Perth', state: 'Western Australia', code: '6000', region: 'Western Australia', type: 'CBD' },
        { city: 'Adelaide', state: 'South Australia', code: '5000', region: 'Southern Australia', type: 'CBD' },
        { city: 'Canberra', state: 'ACT', code: '2600', region: 'Southeastern Australia', type: 'City Centre' },
        { city: 'Darwin', state: 'Northern Territory', code: '0800', region: 'Northern Australia', type: 'CBD' },
        { city: 'Hobart', state: 'Tasmania', code: '7000', region: 'Tasmania', type: 'CBD' },
        { city: 'Gold Coast', state: 'Queensland', code: '4217', region: 'Eastern Australia', type: 'Surfers Paradise' },
        { city: 'Newcastle', state: 'New South Wales', code: '2300', region: 'Eastern Australia', type: 'City Centre' }
      ]
    },
    'BR': {
      country: 'Brazil',
      flag: '🇧🇷',
      format: 'NNNNN-NNN',
      example: '01310-100',
      description: '8-digit postal code with hyphen (CEP - Código de Endereçamento Postal)',
      codes: [
        { city: 'São Paulo', state: 'São Paulo', code: '01310-100', region: 'Southeast', type: 'Centro' },
        { city: 'Rio de Janeiro', state: 'Rio de Janeiro', code: '20040-020', region: 'Southeast', type: 'Centro' },
        { city: 'Brasília', state: 'Distrito Federal', code: '70040-010', region: 'Central-West', type: 'Plano Piloto' },
        { city: 'Salvador', state: 'Bahia', code: '40070-110', region: 'Northeast', type: 'Centro' },
        { city: 'Fortaleza', state: 'Ceará', code: '60160-230', region: 'Northeast', type: 'Centro' },
        { city: 'Belo Horizonte', state: 'Minas Gerais', code: '30112-000', region: 'Southeast', type: 'Centro' },
        { city: 'Manaus', state: 'Amazonas', code: '69010-060', region: 'North', type: 'Centro' },
        { city: 'Curitiba', state: 'Paraná', code: '80020-320', region: 'South', type: 'Centro' },
        { city: 'Recife', state: 'Pernambuco', code: '50030-230', region: 'Northeast', type: 'Centro' },
        { city: 'Porto Alegre', state: 'Rio Grande do Sul', code: '90010-150', region: 'South', type: 'Centro' }
      ]
    }
  };

  useEffect(() => {
    filterCodes();
    generateSuggestions();
  }, [searchTerm, selectedCountry]);

  const filterCodes = () => {
    const countryData = postalCodes[selectedCountry];
    if (!countryData) return;

    let filtered = countryData.codes;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.city.toLowerCase().includes(term) ||
        item.state.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term) ||
        item.region.toLowerCase().includes(term)
      );
    }

    setFilteredCodes(filtered);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const countries = Object.keys(postalCodes).sort((a, b) => {
    const order = ['US', 'GB', 'CA', 'DE', 'FR', 'JP', 'CN', 'IN', 'AU', 'BR'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const currentCountryData = postalCodes[selectedCountry];
  const regions = currentCountryData ? [...new Set(currentCountryData.codes.map(item => item.region))].sort() : [];
  const cities = currentCountryData ? [...new Set(currentCountryData.codes.map(item => item.city))].sort() : [];

  const getFormatExamples = () => {
    if (!currentCountryData) return [];
    return currentCountryData.codes.slice(0, 3);
  };

  const getRegionStats = () => {
    const stats = {};
    if (currentCountryData) {
      currentCountryData.codes.forEach(item => {
        stats[item.region] = (stats[item.region] || 0) + 1;
      });
    }
    return stats;
  };

  const generateSuggestions = () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const allSuggestions = [];

    if (!currentCountryData) return;

    // City suggestions
    const matchingCities = cities.filter(city => 
      city.toLowerCase().includes(term)
    ).slice(0, 4);

    matchingCities.forEach(city => {
      const cityCount = currentCountryData.codes.filter(item => item.city === city).length;
      const sampleCode = currentCountryData.codes.find(item => item.city === city);
      allSuggestions.push({
        type: 'city',
        text: city,
        subtitle: `${sampleCode?.state || ''}, ${currentCountryData.country}`,
        count: cityCount,
        icon: '🏙️',
        data: { city, country: selectedCountry }
      });
    });

    // Postal code suggestions  
    const matchingCodes = currentCountryData.codes.filter(item =>
      item.code.toLowerCase().includes(term)
    ).slice(0, 4);

    matchingCodes.forEach(item => {
      allSuggestions.push({
        type: 'code',
        text: item.code,
        subtitle: `${item.city}, ${item.state}`,
        count: 1,
        icon: '📮',
        data: item
      });
    });

    // Region suggestions
    const matchingRegions = regions.filter(region =>
      region.toLowerCase().includes(term)
    ).slice(0, 3);

    matchingRegions.forEach(region => {
      const regionCount = currentCountryData.codes.filter(item => item.region === region).length;
      allSuggestions.push({
        type: 'region',
        text: region,
        subtitle: `${currentCountryData.country} region`,
        count: regionCount,
        icon: '🗺️',
        data: { region, country: selectedCountry }
      });
    });

    // State suggestions
    const states = [...new Set(currentCountryData.codes.map(item => item.state))];
    const matchingStates = states.filter(state =>
      state.toLowerCase().includes(term)
    ).slice(0, 3);

    matchingStates.forEach(state => {
      const stateCount = currentCountryData.codes.filter(item => item.state === state).length;
      allSuggestions.push({
        type: 'state',
        text: state,
        subtitle: `State/Province in ${currentCountryData.country}`,
        count: stateCount,
        icon: '📍',
        data: { state, country: selectedCountry }
      });
    });

    // Sort suggestions by relevance (exact matches first, then by count)
    allSuggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === term;
      const bExact = b.text.toLowerCase() === term;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return b.count - a.count;
    });

    setSuggestions(allSuggestions.slice(0, 8));
    setShowSuggestions(allSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    
    // Focus search based on suggestion type
    if (suggestion.type === 'city') {
      // Search will automatically filter by the city name
    } else if (suggestion.type === 'region') {
      // Search will show all items in that region
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0) {
        handleSuggestionClick(suggestions[selectedSuggestion]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const getPopularCities = () => {
    if (!currentCountryData) return [];
    const cityStats = getRegionStats();
    return cities
      .map(city => {
        const cityCount = currentCountryData.codes.filter(item => item.city === city).length;
        const sample = currentCountryData.codes.find(item => item.city === city);
        return {
          city,
          count: cityCount,
          sample
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Show top 6 cities for quick access
  };

  const quickSelectCity = (cityName) => {
    setSearchTerm(cityName);
    setShowSuggestions(false);
  };

  return (
    <div className="tool-container">
        {/* Country Selection */}
        <div className="country-selection-section">
          <h3>🌍 Select Country</h3>
          <div className="country-selector">
            {countries.map(countryCode => {
              const country = postalCodes[countryCode];
              return (
                <button
                  key={countryCode}
                  type="button"
                  className={`country-button ${selectedCountry === countryCode ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCountry(countryCode);
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }}
                >
                  <span className="country-flag-large">{country.flag}</span>
                  <span className="country-name">{country.country}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Information */}
        <div className="format-info-section">
          <h3>📋 Format Information - {currentCountryData?.country}</h3>
          <div className="format-card">
            <div className="format-details">
              <div className="format-item">
                <h4>Format Pattern</h4>
                <code className="format-pattern">{currentCountryData?.format}</code>
              </div>
              <div className="format-item">
                <h4>Example</h4>
                <code className="format-example">{currentCountryData?.example}</code>
              </div>
            </div>
            <div className="format-description">
              <p>{currentCountryData?.description}</p>
            </div>
            <div className="format-examples">
              <h4>Sample Codes:</h4>
              <div className="sample-codes">
                {getFormatExamples().map((item, index) => (
                  <div key={index} className="sample-code">
                    <span className="sample-city">{item.city}</span>
                    <span className="sample-postal-code">{item.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Search Section */}
        <div className="smart-search-section">
          <h3>🔍 Search Postal Codes - {currentCountryData?.country}</h3>
          <div className="search-container">
            <div className="smart-search-input">
              <div className="input-group">
                <label className="input-label">Type city name, postal code, region, or state</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="text-input smart-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="e.g., London, 10001, Manhattan, West Coast..."
                  />
                  <div className="search-icon">🔍</div>
                </div>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.type}-${suggestion.text}`}
                      className={`suggestion-item ${index === selectedSuggestion ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedSuggestion(index)}
                    >
                      <div className="suggestion-icon">{suggestion.icon}</div>
                      <div className="suggestion-content">
                        <div className="suggestion-text">{suggestion.text}</div>
                        <div className="suggestion-subtitle">{suggestion.subtitle}</div>
                      </div>
                      <div className="suggestion-count">{suggestion.count} code{suggestion.count !== 1 ? 's' : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {searchTerm && (
              <button
                className="btn btn-outline btn-small clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  setShowSuggestions(false);
                }}
              >
                ✕ Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Quick Access Cities */}
        {!searchTerm && (
          <div className="quick-access-section">
            <h3>⚡ Quick Access - Popular Cities</h3>
            <div className="quick-cities-grid">
              {getPopularCities().map((cityData) => (
                <button
                  key={cityData.city}
                  className="quick-city-button"
                  onClick={() => quickSelectCity(cityData.city)}
                >
                  <div className="quick-city-info">
                    <span className="quick-city-name">{cityData.city}</span>
                    <span className="quick-city-meta">{cityData.count} codes</span>
                  </div>
                  <span className="quick-city-code">{cityData.sample?.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="results-section">
          <h3>🗺️ Postal Codes ({filteredCodes.length} found)</h3>
          
          {filteredCodes.length === 0 ? (
            <div className="no-results">
              <p>No postal codes found matching your criteria.</p>
              <p>Try searching with different terms or select a different region.</p>
            </div>
          ) : (
            <div className="postcodes-grid">
              {filteredCodes.map((item, index) => (
                <div key={`${item.code}-${index}`} className="postcode-card">
                  <div className="postcode-header">
                    <div className="location-info">
                      <h4 className="city-name">{item.city}</h4>
                      <span className="state-name">{item.state}</span>
                      <span className="region-badge">{item.region}</span>
                    </div>
                  </div>
                  
                  <div className="postcode-content">
                    <div className="postcode-display">
                      <span className="postcode-label">Postal Code</span>
                      <span className="postcode-value">{item.code}</span>
                    </div>
                    
                    <div className="area-type">
                      <span className="type-label">Area Type</span>
                      <span className="type-value">{item.type}</span>
                    </div>
                    
                    <div className="postcode-actions">
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => copyToClipboard(item.code, `postcode-${index}`)}
                        title={`Copy ${item.code} to clipboard`}
                      >
                        {copied === `postcode-${index}` ? '✓ Copied!' : '📋 Copy Code'}
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
          <h3>📖 Postal Code Usage Guide</h3>
          <div className="usage-grid">
            <div className="usage-item">
              <h4>📦 International Shipping</h4>
              <p>Always include the correct postal code when shipping internationally. It&apos;s essential for accurate delivery and customs processing.</p>
            </div>
            
            <div className="usage-item">
              <h4>🏠 Address Formatting</h4>
              <p>Different countries have different address formats. Always place the postal code in the correct position according to local conventions.</p>
            </div>
            
            <div className="usage-item">
              <h4>🌍 Country Variations</h4>
              <ul>
                <li><strong>US:</strong> ZIP codes (5 or 9 digits)</li>
                <li><strong>UK:</strong> Postcodes (alphanumeric)</li>
                <li><strong>Canada:</strong> Postal codes (A9A 9A9)</li>
                <li><strong>Germany:</strong> Postleitzahl (5 digits)</li>
                <li><strong>Japan:</strong> Yūbin-bangō (7 digits)</li>
              </ul>
            </div>
            
            <div className="usage-item">
              <h4>💡 Pro Tips</h4>
              <ul>
                <li>Always verify postal codes with official sources</li>
                <li>Some countries have mandatory postal codes</li>
                <li>Use correct spacing and formatting</li>
                <li>Check for recent postal code changes</li>
                <li>Include postal codes in all official documents</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PostcodeLookup;
