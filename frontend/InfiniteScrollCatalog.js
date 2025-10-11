import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InfiniteScrollCatalog.css';

function InfiniteScrollCatalog() {
  const [outfits, setOutfits] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const loader = useRef(null);

  // Fetch styles for filter
  useEffect(() => {
    fetch('/api/styles')
      .then(res => res.json())
      .then(data => setStyles(data))
      .catch(err => console.error('Error fetching styles:', err));
  }, []);

  // Fetch outfits
  const fetchOutfits = useCallback(async (pageNum, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });
      
      if (selectedStyle) params.append('style', selectedStyle);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await fetch(`/api/outfits?${params}`);
      const data = await response.json();
      
      if (reset) {
        setOutfits(data.data);
      } else {
        setOutfits(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.data.length === 20);
    } catch (err) {
      console.error('Error fetching outfits:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStyle, minPrice, maxPrice, loading]);

  // Initial load and filter changes
  useEffect(() => {
    setPage(1);
    fetchOutfits(1, true);
  }, [selectedStyle, minPrice, maxPrice]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchOutfits(nextPage);
        }
      },
      { threshold: 0.9 }
    );
    
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading, fetchOutfits]);

  const handleStyleChange = (e) => {
    setSelectedStyle(e.target.value);
  };

  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const clearFilters = () => {
    setSelectedStyle('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <h1>FreshLook Catalogus</h1>
        <p>Ontdek eindeloze outfit inspiratie</p>
      </header>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="style-select">Stijl:</label>
          <select 
            id="style-select"
            value={selectedStyle} 
            onChange={handleStyleChange}
            aria-label="Filter op stijl"
          >
            <option value="">Alle stijlen</option>
            {styles.map(style => (
              <option key={style.id} value={style.name}>{style.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="min-price">Min prijs:</label>
          <input
            id="min-price"
            type="number"
            value={minPrice}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            placeholder="€0"
            aria-label="Minimum prijs"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="max-price">Max prijs:</label>
          <input
            id="max-price"
            type="number"
            value={maxPrice}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            placeholder="€500"
            aria-label="Maximum prijs"
          />
        </div>

        <button onClick={clearFilters} className="clear-filters">
          Filters wissen
        </button>
      </div>

      <div className="outfits-grid" role="feed" aria-label="Outfit catalogus">
        {outfits.map((outfit, index) => (
          <div key={`${outfit.id}-${index}`} className="outfit-card">
            <img 
              src={outfit.image_url} 
              alt={outfit.title}
              loading="lazy"
              className="outfit-image"
            />
            <div className="outfit-info">
              <h3>{outfit.title}</h3>
              <p className="outfit-style">{outfit.style_name}</p>
              <p className="outfit-price">€{outfit.price}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-indicator" aria-busy="true" aria-live="polite">
          <div className="spinner"></div>
          <span>Outfits laden...</span>
        </div>
      )}

      {!hasMore && outfits.length > 0 && (
        <div className="end-message">
          <p>Je hebt alle outfits bekeken!</p>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            Terug naar boven
          </button>
        </div>
      )}

      <div ref={loader} className="scroll-trigger" />
    </div>
  );
}

export default InfiniteScrollCatalog;
