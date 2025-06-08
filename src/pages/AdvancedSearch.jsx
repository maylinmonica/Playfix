import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, SortAsc, SortDesc, Heart, Music, ChevronDown, RotateCcw } from 'lucide-react';

const AdvancedSearch = ({ 
  playlists = [], 
  onFilteredResults, 
  favorites = [],
  initialFilters = {} 
}) => {
  // State untuk advanced search filters
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    genre: 'all',
    dateFilter: 'any',
    isFavoriteOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters
  });

  // Get unique genres from playlists
  const genres = ['all', ...new Set(playlists.map(p => p.play_genre).filter(Boolean))];

  // Date filter options
  const dateOptions = [
    { value: 'any', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date created' },
    { value: 'genre', label: 'Genre' }
  ];

  // Filter playlists based on current filters
  const getFilteredPlaylists = () => {
    let filtered = [...playlists];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(playlist => 
        playlist.play_name?.toLowerCase().includes(searchLower) ||
        playlist.play_genre?.toLowerCase().includes(searchLower) ||
        playlist.play_description?.toLowerCase().includes(searchLower)
      );
    }

    // Genre filter
    if (filters.genre !== 'all') {
      filtered = filtered.filter(playlist => playlist.play_genre === filters.genre);
    }

    // Favorite filter
    if (filters.isFavoriteOnly) {
      filtered = filtered.filter(playlist => favorites.includes(playlist.id_play));
    }

    // Date filter (simulated - in real app you'd have actual creation dates)
    if (filters.dateFilter !== 'any') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(playlist => {
        // Simulate creation date based on playlist ID (for demo purposes)
        const simulatedDate = new Date(now.getTime() - (playlist.id_play * 86400000));
        
        switch (filters.dateFilter) {
          case 'today':
            return simulatedDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - (7 * 86400000));
            return simulatedDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - (30 * 86400000));
            return simulatedDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(today.getTime() - (365 * 86400000));
            return simulatedDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = (a.play_name || '').localeCompare(b.play_name || '');
          break;
        case 'genre':
          comparison = (a.play_genre || '').localeCompare(b.play_genre || '');
          break;
        case 'date':
          // Simulate date comparison
          comparison = a.id_play - b.id_play;
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  // Update filters
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      genre: 'all',
      dateFilter: 'any',
      isFavoriteOnly: false,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.searchTerm !== '' ||
           filters.genre !== 'all' ||
           filters.dateFilter !== 'any' ||
           filters.isFavoriteOnly ||
           filters.sortBy !== 'name' ||
           filters.sortOrder !== 'asc';
  };

  // Apply filters whenever they change
  useEffect(() => {
    const filteredPlaylists = getFilteredPlaylists();
    onFilteredResults(filteredPlaylists, filters);
  }, [filters, playlists, favorites]);

  return (
    <div className="advanced-search-container">
      {/* Main Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search playlists by name, genre, or description..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="search-input-advanced"
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`filter-toggle ${isExpanded ? 'active' : ''}`}
            title="Advanced filters"
          >
            <Filter size={16} />
            {hasActiveFilters() && <span className="active-indicator"></span>}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className={`advanced-filters ${isExpanded ? 'expanded' : ''}`}>
        <div className="filters-grid">
          {/* Genre Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Music size={14} />
              Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => updateFilter('genre', e.target.value)}
              className="filter-select"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="filter-group">
            <label className="filter-label">
              <Calendar size={14} />
              Date Added
            </label>
            <select
              value={filters.dateFilter}
              onChange={(e) => updateFilter('dateFilter', e.target.value)}
              className="filter-select"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label className="filter-label">
              {filters.sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
              Sort By
            </label>
            <div className="sort-controls">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="filter-select sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
                title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {filters.sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toggles */}
        <div className="filter-toggles">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.isFavoriteOnly}
              onChange={(e) => updateFilter('isFavoriteOnly', e.target.checked)}
            />
            <Heart size={14} fill={filters.isFavoriteOnly ? '#ff0000' : 'none'} />
            Favorites only ({favorites.length})
          </label>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <button
            onClick={clearFilters}
            className="clear-filters-btn"
            disabled={!hasActiveFilters()}
          >
            <RotateCcw size={14} />
            Clear Filters
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="close-filters-btn"
          >
            <X size={14} />
            Close
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="active-filters-summary">
          <span className="summary-text">Active filters:</span>
          <div className="filter-tags">
            {filters.searchTerm && (
              <span className="filter-tag">
                Search: "{filters.searchTerm}"
                <button onClick={() => updateFilter('searchTerm', '')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.genre !== 'all' && (
              <span className="filter-tag">
                Genre: {filters.genre}
                <button onClick={() => updateFilter('genre', 'all')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.dateFilter !== 'any' && (
              <span className="filter-tag">
                Date: {dateOptions.find(d => d.value === filters.dateFilter)?.label}
                <button onClick={() => updateFilter('dateFilter', 'any')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.isFavoriteOnly && (
              <span className="filter-tag">
                Favorites only
                <button onClick={() => updateFilter('isFavoriteOnly', false)}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .advanced-search-container {
          margin-bottom: 24px;
        }

        .search-bar-wrapper {
          margin-bottom: 12px;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0 16px;
          transition: all 0.2s;
        }

        .search-input-container:focus-within {
          border-color: #ff0000;
          box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }

        .search-icon {
          color: rgba(255, 255, 255, 0.6);
          margin-right: 12px;
        }

        .search-input-advanced {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
          padding: 14px 0;
        }

        .search-input-advanced::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .filter-toggle {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 12px;
        }

        .filter-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .filter-toggle.active {
          background: rgba(255, 0, 0, 0.2);
          border-color: #ff0000;
        }

        .active-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ff0000;
          border-radius: 50%;
        }

        .advanced-filters {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .advanced-filters.expanded {
          max-height: 400px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #ff0000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #ff0000;
          box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
        }

        .filter-select option {
          background: #1f1f1f;
          color: #fff;
        }

        .sort-controls {
          display: flex;
          gap: 8px;
        }

        .sort-select {
          flex: 1;
        }

        .sort-order-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sort-order-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .filter-toggles {
          margin-bottom: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #fff;
        }

        .filter-checkbox input[type="checkbox"] {
          margin: 0;
        }

        .filter-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .clear-filters-btn,
        .close-filters-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover:not(:disabled),
        .close-filters-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .clear-filters-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .active-filters-summary {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .summary-text {
          font-size: 12px;
          color: #ff0000;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          color: #fff;
        }

        .filter-tag button {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .filter-tag button:hover {
          color: #ff0000;
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .filter-actions {
            flex-direction: column;
            gap: 8px;
          }
          
          .clear-filters-btn,
          .close-filters-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;