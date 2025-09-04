'use client';

import React, { useState, useEffect, useMemo } from 'react';

const CountdownTool = () => {
  const [countdowns, setCountdowns] = useState([]);
  const [newCountdown, setNewCountdown] = useState({
    title: '',
    date: '',
    category: 'personal',
    description: ''
  });
  const [currentTime, setCurrentTime] = useState(() => new Date(0)); // Start with epoch to prevent hydration mismatch
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshPresets, setRefreshPresets] = useState(0);

  // Set actual current time after hydration
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  // Initialize countdowns on mount
  useEffect(() => {
    const initializeCountdowns = () => {
      console.log('Initializing countdown tool...');
      
      try {
        const savedCountdowns = localStorage.getItem('one-toys-countdowns');
        console.log('Raw localStorage data:', savedCountdowns);
        
        if (savedCountdowns && savedCountdowns !== 'null' && savedCountdowns !== 'undefined') {
          const parsed = JSON.parse(savedCountdowns);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCountdowns(parsed);
            console.log('✅ Loaded', parsed.length, 'countdowns from localStorage');
            setIsInitialized(true);
            return;
          }
        }
        
        // No valid saved data, start with empty array
        console.log('No saved data found, starting with empty countdowns...');
        setCountdowns([]);
        
        // Initialize empty array in localStorage
        const dataToSave = JSON.stringify([]);
        localStorage.setItem('one-toys-countdowns', dataToSave);
        console.log('✅ Saved default countdowns to localStorage');
        
        setIsInitialized(true);
        
      } catch (error) {
        console.error('❌ Error initializing countdowns:', error);
        localStorage.removeItem('one-toys-countdowns');
        setCountdowns([]);
        setIsInitialized(true);
      }
    };

    // Set initial date for new countdown (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewCountdown(prev => ({
      ...prev,
      date: tomorrow.toISOString().slice(0, 16)
    }));

    initializeCountdowns();
  }, []);

  // Save countdowns to localStorage whenever countdowns change (after initialization)
  useEffect(() => {
    if (!isInitialized) {
      console.log('⏳ Skipping save - not initialized yet');
      return;
    }
    
    try {
      const dataToSave = JSON.stringify(countdowns);
      localStorage.setItem('one-toys-countdowns', dataToSave);
      console.log('✅ Saved', countdowns.length, 'countdowns to localStorage');
      
      // Verify the save
      const verification = localStorage.getItem('one-toys-countdowns');
      const verifyParsed = JSON.parse(verification || '[]');
      
      if (verifyParsed.length !== countdowns.length) {
        console.error('❌ Save verification failed - length mismatch');
        console.log('Expected:', countdowns.length, 'Got:', verifyParsed.length);
      } else {
        console.log('✅ Save verification successful');
      }
      
    } catch (error) {
      console.error('❌ Error saving countdowns:', error);
    }
  }, [countdowns, isInitialized]);

  // Update current time every second and refresh presets every hour
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Refresh presets every hour (at minute 0) to keep them current
      if (now.getMinutes() === 0 && now.getSeconds() < 5) {
        setRefreshPresets(prev => prev + 1);
        console.log('🔄 Refreshing dynamic presets...');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const now = currentTime;
    const diff = target.getTime() - now.getTime();
    
    const isExpired = diff < 0;
    const absDiff = Math.abs(diff);
    
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
    
    const totalSeconds = Math.floor(absDiff / 1000);
    const totalMinutes = Math.floor(absDiff / (1000 * 60));
    const totalHours = Math.floor(absDiff / (1000 * 60 * 60));
    
    // Calculate percentage for progress bar (assuming max 1 year = 365 days)
    const maxDays = 365;
    const progressPercentage = isExpired ? 100 : Math.min((maxDays - days) / maxDays * 100, 100);
    
    return {
      isExpired,
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      totalMinutes,
      totalHours,
      totalDays: days,
      progressPercentage: Math.max(progressPercentage, 0),
      formatted: {
        short: isExpired ? 'Expired' : `${days}d ${hours}h ${minutes}m ${seconds}s`,
        long: isExpired ? 
          `Ended ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds ago` :
          `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`,
        compact: isExpired ? 'Expired' : `${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      }
    };
  };

  const addCountdown = () => {
    if (!newCountdown.title || !newCountdown.date) {
      console.warn('Cannot add countdown: missing title or date');
      return;
    }
    
    const countdown = {
      id: `countdown-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Use string ID to avoid hydration issues
      title: newCountdown.title.trim(),
      date: newCountdown.date,
      category: newCountdown.category,
      description: newCountdown.description.trim(),
      createdAt: Date.now()
    };
    
    console.log('Adding new countdown:', countdown);
    
    setCountdowns(prev => {
      const updated = [...prev, countdown];
      console.log('Updated countdowns array:', updated);
      return updated;
    });
    
    // Reset form
    setNewCountdown({
      title: '',
      date: '',
      category: 'personal',
      description: ''
    });
    setShowAddForm(false);
  };

  const removeCountdown = (id) => {
    setCountdowns(prev => prev.filter(c => c.id !== id));
  };

  const addPresetCountdown = (preset) => {
    // Check if this preset already exists
    const exists = countdowns.some(c => c.title === preset.title);
    if (exists) {
      console.log('Preset countdown already exists:', preset.title);
      return;
    }
    
    const countdown = {
      id: `preset-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Use string ID to avoid hydration issues
      ...preset,
      createdAt: Date.now()
    };
    
    console.log('Adding preset countdown:', countdown);
    setCountdowns(prev => {
      const updated = [...prev, countdown];
      console.log('Updated countdowns with preset:', updated);
      return updated;
    });
  };

  const categories = {
    personal: { icon: '👤', color: '#3b82f6', name: 'Personal' },
    work: { icon: '💼', color: '#059669', name: 'Work' },
    holiday: { icon: '🎉', color: '#dc2626', name: 'Holiday' },
    birthday: { icon: '🎂', color: '#d97706', name: 'Birthday' },
    anniversary: { icon: '💕', color: '#be185d', name: 'Anniversary' },
    deadline: { icon: '⏰', color: '#7c2d12', name: 'Deadline' },
    event: { icon: '📅', color: '#6b21a8', name: 'Event' }
  };

  // Generate dynamic preset countdowns based on current date
  const getDynamicPresets = () => {
    // Only generate presets on client side to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return [];
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;
    const presets = [];

    // Helper function to create date
    const createDate = (month, day, year = currentYear) => {
      const date = new Date(year, month - 1, day, 0, 0, 0);
      // If date has passed this year, use next year
      if (date < now) {
        date.setFullYear(nextYear);
      }
      return date;
    };

    // Helper function to get next occurrence of a weekday in a month
    const getNthWeekdayOfMonth = (year, month, weekday, n) => {
      const firstDay = new Date(year, month - 1, 1);
      const firstWeekday = firstDay.getDay();
      const offset = (weekday - firstWeekday + 7) % 7;
      const date = new Date(year, month - 1, 1 + offset + (n - 1) * 7);
      return date;
    };

    // Major Holidays
    const holidays = [
      // New Year's Day
      {
        title: `New Year ${currentYear === now.getFullYear() && now.getMonth() === 0 && now.getDate() <= 1 ? currentYear : nextYear}`,
        date: createDate(1, 1).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'Welcome the new year!'
      },
      // Valentine's Day
      {
        title: `Valentine's Day ${createDate(2, 14).getFullYear()}`,
        date: createDate(2, 14).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'Day of love and romance 💕'
      },
      // Easter (approximate - first Sunday after March 21)
      {
        title: `Easter ${createDate(3, 21).getFullYear()}`,
        date: createDate(4, 12).toISOString().slice(0, 19), // Approximation
        category: 'holiday',
        description: 'Easter celebration 🐰'
      },
      // Mother's Day (2nd Sunday in May)
      {
        title: `Mother's Day ${currentYear}`,
        date: getNthWeekdayOfMonth(createDate(5, 1).getFullYear(), 5, 0, 2).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'Celebrate mothers 👩‍👧‍👦'
      },
      // Father's Day (3rd Sunday in June)  
      {
        title: `Father's Day ${currentYear}`,
        date: getNthWeekdayOfMonth(createDate(6, 1).getFullYear(), 6, 0, 3).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'Celebrate fathers 👨‍👧‍👦'
      },
      // Independence Day (US)
      {
        title: `Independence Day ${createDate(7, 4).getFullYear()}`,
        date: createDate(7, 4).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'USA Independence Day 🎆'
      },
      // Halloween
      {
        title: `Halloween ${createDate(10, 31).getFullYear()}`,
        date: createDate(10, 31).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'Spooky season! 🎃'
      },
      // Thanksgiving (4th Thursday in November)
      {
        title: `Thanksgiving ${currentYear}`,
        date: getNthWeekdayOfMonth(createDate(11, 1).getFullYear(), 11, 4, 4).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'American Thanksgiving 🦃'
      },
      // Christmas
      {
        title: `Christmas ${createDate(12, 25).getFullYear()}`,
        date: createDate(12, 25).toISOString().slice(0, 19),
        category: 'holiday',
        description: 'Merry Christmas! 🎄'
      }
    ];

    // Seasonal Events
    const seasons = [
      {
        title: `Spring Equinox ${currentYear}`,
        date: createDate(3, 20).toISOString().slice(0, 19),
        category: 'event',
        description: 'First day of spring 🌸'
      },
      {
        title: `Summer Solstice ${currentYear}`,
        date: createDate(6, 21).toISOString().slice(0, 19),
        category: 'event',
        description: 'Longest day of the year ☀️'
      },
      {
        title: `Autumn Equinox ${currentYear}`,
        date: createDate(9, 22).toISOString().slice(0, 19),
        category: 'event',
        description: 'First day of fall 🍂'
      },
      {
        title: `Winter Solstice ${currentYear}`,
        date: createDate(12, 21).toISOString().slice(0, 19),
        category: 'event',
        description: 'Shortest day of the year ❄️'
      }
    ];

    // Personal Milestones
    const milestones = [
      {
        title: 'Weekend',
        date: (() => {
          const nextFriday = new Date(now);
          nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
          nextFriday.setHours(17, 0, 0, 0); // 5 PM Friday
          return nextFriday.toISOString().slice(0, 19);
        })(),
        category: 'personal',
        description: 'Weekend begins! 🎉'
      },
      {
        title: 'Next Monday',
        date: (() => {
          const nextMonday = new Date(now);
          const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
          nextMonday.setDate(now.getDate() + daysUntilMonday);
          nextMonday.setHours(9, 0, 0, 0); // 9 AM Monday
          return nextMonday.toISOString().slice(0, 19);
        })(),
        category: 'work',
        description: 'Start of new work week 💼'
      },
      {
        title: 'End of Month',
        date: (() => {
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 0);
          return endOfMonth.toISOString().slice(0, 19);
        })(),
        category: 'deadline',
        description: 'Month ends ⏰'
      },
      {
        title: 'Next Month',
        date: (() => {
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          nextMonth.setHours(0, 0, 0, 0);
          return nextMonth.toISOString().slice(0, 19);
        })(),
        category: 'personal',
        description: 'New month begins 📅'
      }
    ];

    // Combine all presets
    const allPresets = [...holidays, ...seasons, ...milestones];

    // Filter to only upcoming events (within next 365 days)
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const upcomingPresets = allPresets
      .filter(preset => {
        const presetDate = new Date(preset.date);
        return presetDate > now && presetDate <= oneYearFromNow;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 12); // Show max 12 presets

    return upcomingPresets;
  };

  // Generate presets and refresh them when needed
  const presetCountdowns = useMemo(() => {
    return getDynamicPresets();
  }, [currentTime.getDate(), currentTime.getMonth(), currentTime.getFullYear(), refreshPresets]);

  const sortedCountdowns = [...countdowns].sort((a, b) => {
    const timeA = calculateTimeRemaining(a.date);
    const timeB = calculateTimeRemaining(b.date);
    
    // Expired items go to bottom
    if (timeA.isExpired && !timeB.isExpired) return 1;
    if (!timeA.isExpired && timeB.isExpired) return -1;
    
    // Among non-expired, sort by time remaining (ascending)
    if (!timeA.isExpired && !timeB.isExpired) {
      return timeA.totalSeconds - timeB.totalSeconds;
    }
    
    // Among expired, sort by how long expired (descending)
    return timeB.totalSeconds - timeA.totalSeconds;
  });

  const CountdownCard = ({ countdown }) => {
    const timeData = calculateTimeRemaining(countdown.date);
    const category = categories[countdown.category] || categories.personal;
    
    return (
      <div className={`countdown-card ${timeData.isExpired ? 'expired' : ''}`}>
        <div className="countdown-header">
          <div className="countdown-category">
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </div>
          <button 
            className="remove-countdown"
            onClick={() => removeCountdown(countdown.id)}
            title="Remove countdown"
          >
            ×
          </button>
        </div>
        
        <div className="countdown-content">
          <h3 className="countdown-title">{countdown.title}</h3>
          {countdown.description && (
            <p className="countdown-description">{countdown.description}</p>
          )}
          
          <div className="countdown-display">
            <div className="time-units">
              <div className="time-unit">
                <span className="time-number">{timeData.days}</span>
                <span className="time-label">Days</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <span className="time-number">{String(timeData.hours).padStart(2, '0')}</span>
                <span className="time-label">Hours</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <span className="time-number">{String(timeData.minutes).padStart(2, '0')}</span>
                <span className="time-label">Minutes</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-unit">
                <span className="time-number">{String(timeData.seconds).padStart(2, '0')}</span>
                <span className="time-label">Seconds</span>
              </div>
            </div>
            
            <div className="countdown-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${timeData.progressPercentage}%`,
                  backgroundColor: category.color
                }}
              ></div>
            </div>
            
            <div className="countdown-meta">
              <div className="target-date">
                {new Date(countdown.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className={`status-text ${timeData.isExpired ? 'expired' : 'active'}`}>
                {timeData.formatted.long}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tool-container">
        <div className="countdown-controls">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '❌ Cancel' : '➕ Add Countdown'}
          </button>
          
          {countdowns.length === 0 && (
            <div className="empty-state">
              <h3>🎯 No Countdowns Yet</h3>
              <p>Add your first countdown to start tracking important dates!</p>
            </div>
          )}
        </div>

        {showAddForm && (
          <div className="add-countdown-form">
            <h3>📝 Create New Countdown</h3>
            
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Title *</label>
                <input
                  type="text"
                  className="text-input"
                  value={newCountdown.title}
                  onChange={(e) => setNewCountdown(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="My Important Date"
                  maxLength={50}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Target Date & Time *</label>
                <input
                  type="datetime-local"
                  className="text-input"
                  value={newCountdown.date}
                  onChange={(e) => setNewCountdown(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  className="text-input"
                  value={newCountdown.category}
                  onChange={(e) => setNewCountdown(prev => ({ ...prev, category: e.target.value }))}
                >
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="input-group full-width">
                <label className="input-label">Description (Optional)</label>
                <input
                  type="text"
                  className="text-input"
                  value={newCountdown.description}
                  onChange={(e) => setNewCountdown(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this countdown"
                  maxLength={100}
                />
              </div>
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary"
                onClick={addCountdown}
                disabled={!newCountdown.title || !newCountdown.date}
              >
                ✅ Create Countdown
              </button>
            </div>
          </div>
        )}

        {presetCountdowns.length > 0 && (
          <div className="preset-countdowns">
            <div className="preset-header">
              <h3>⚡ Dynamic Quick Add Presets</h3>
              <p className="preset-subtitle">Upcoming important dates based on current time</p>
            </div>
            <div className="preset-grid">
              {presetCountdowns.map((preset, index) => {
                const presetDate = new Date(preset.date);
                const now = new Date();
                const daysUntil = Math.ceil((presetDate - now) / (1000 * 60 * 60 * 24));
                
                return (
                  <button
                    key={`${preset.title}-${preset.date}`}
                    className="preset-countdown-btn"
                    onClick={() => addPresetCountdown(preset)}
                    disabled={countdowns.some(c => c.title === preset.title)}
                  >
                    <span className="preset-icon">{categories[preset.category].icon}</span>
                    <span className="preset-title">{preset.title}</span>
                    <span className="preset-date">
                      {presetDate.toLocaleDateString()}
                    </span>
                    <span className="preset-days">
                      {daysUntil === 1 ? 'Tomorrow' : 
                       daysUntil <= 7 ? `${daysUntil} days` : 
                       daysUntil <= 30 ? `${Math.ceil(daysUntil/7)} weeks` :
                       `${Math.ceil(daysUntil/30)} months`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sortedCountdowns.length > 0 && (
          <div className="countdowns-section">
            <h3>🕐 Your Countdowns ({sortedCountdowns.length})</h3>
            <div className="countdowns-grid">
              {sortedCountdowns.map(countdown => (
                <CountdownCard key={countdown.id} countdown={countdown} />
              ))}
            </div>
          </div>
        )}

        <div className="countdown-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{countdowns.filter(c => !calculateTimeRemaining(c.date).isExpired).length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{countdowns.filter(c => calculateTimeRemaining(c.date).isExpired).length}</span>
              <span className="stat-label">Expired</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{countdowns.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>


        <div className="countdown-info">
          <h3>ℹ️ How to Use</h3>
          <ul>
            <li><strong>Add Countdowns:</strong> Click &quot;Add Countdown&quot; to create custom countdowns</li>
            <li><strong>Quick Presets:</strong> Use preset buttons for common holidays and events</li>
            <li><strong>Live Updates:</strong> All countdowns update automatically every second</li>
            <li><strong>Categories:</strong> Organize countdowns by type with color coding</li>
            <li><strong>Auto-Save:</strong> Your countdowns are saved locally in your browser</li>
            <li><strong>Expired Events:</strong> Past events show &quot;time since&quot; information</li>
          </ul>
        </div>
    </div>
  );
};

export default CountdownTool;
