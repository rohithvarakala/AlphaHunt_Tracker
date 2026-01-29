import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import { searchStocks } from '../data/stockDatabase';

const StockSearch = ({
  onSelect,
  placeholder = 'Search stocks (e.g., AAPL, Apple)...',
  value = '',
  className = '',
  showSector = true,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length >= 1) {
      const matches = searchStocks(query);
      setResults(matches);
      setIsOpen(matches.length > 0);
      setHighlightIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock) => {
    setQuery(stock.symbol);
    setIsOpen(false);
    setHighlightIndex(-1);
    if (onSelect) onSelect(stock);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const sectorColors = {
    'Technology': 'text-blue-400',
    'Healthcare': 'text-pink-400',
    'Finance': 'text-emerald-400',
    'Consumer Cyclical': 'text-orange-400',
    'Consumer Defensive': 'text-yellow-400',
    'Energy': 'text-red-400',
    'Industrial': 'text-gray-400',
    'Communication': 'text-purple-400',
    'Real Estate': 'text-teal-400',
    'Utilities': 'text-cyan-400',
    'Basic Materials': 'text-amber-400',
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-72 overflow-y-auto"
        >
          {results.map((stock, idx) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className={`w-full px-4 py-3 text-left transition flex items-center justify-between border-b border-gray-700/50 last:border-b-0 ${
                idx === highlightIndex ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">{stock.symbol.slice(0, 3)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{stock.symbol}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">{stock.marketCap}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">{stock.name}</div>
                </div>
              </div>
              {showSector && (
                <span className={`text-xs font-medium ${sectorColors[stock.sector] || 'text-gray-400'}`}>
                  {stock.sector}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
