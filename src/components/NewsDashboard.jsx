import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Search, RefreshCw, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

const CACHE_KEY = 'news_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 mins

const NewsDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [expandedIdx, setExpandedIdx] = useState(0);

  const fetchNews = async (force = false) => {
    setLoading(true);
    setError('');
    
    try {
      if (!force) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TIME) {
            setArticles(data);
            setLoading(false);
            return;
          }
        }
      }

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) throw new Error("VITE_NEWS_API_KEY missing");

      const res = await fetch(`https://gnews.io/api/v4/search?q=ISS+OR+Space+OR+NASA&lang=en&max=10&apikey=${apiKey}`);
      const data = await res.json();

      if (data.articles) {
        const fetchedArticles = data.articles.map(a => ({ 
          ...a, 
          urlToImage: a.image,
          publishedAt: a.publishedAt,
          source: a.source
        }));
        setArticles(fetchedArticles);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: fetchedArticles, timestamp: Date.now() }));
        
        const categoriesCount = fetchedArticles.reduce((acc, article) => {
          const source = article.source?.name || 'Unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});
        window.dispatchEvent(new CustomEvent('news-update', { detail: categoriesCount }));
      } else {
        throw new Error(data.errors?.[0] || 'Failed to fetch news');
      }
    } catch (err) {
      console.error("News Fetch Error:", err);
      setError(err.message);
      
      const fallback = [
        {
          title: "ISS Astronauts Conduct Spacewalk for Station Upgrades",
          source: { name: "NASA" },
          publishedAt: new Date().toISOString(),
          image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800",
          description: "Astronauts aboard the International Space Station successfully completed a 6-hour spacewalk to install new solar arrays and perform maintenance on the robotic arm.",
          url: "https://nasa.gov"
        },
        {
          title: "New Mars Rover Findings Suggest Ancient Water Flow",
          source: { name: "Science Daily" },
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800",
          description: "Data collected from the Jezero Crater reveals sedimentary patterns consistent with long-term water presence, hinting at the planet's habitable past.",
          url: "https://sciencedaily.com"
        },
        {
          title: "James Webb Telescope Captures Distant Galaxy Cluster",
          source: { name: "ESA" },
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800",
          description: "The most powerful space telescope ever built has provided a stunning new look at a cluster of galaxies billions of light-years away.",
          url: "https://esa.int"
        },
        {
          title: "SpaceX Launches Next Generation Starlink Satellites",
          source: { name: "Tech Report" },
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800",
          description: "A Falcon 9 rocket successfully delivered 22 new Starlink satellites to low Earth orbit, further expanding the global broadband network.",
          url: "https://spacex.com"
        },
        {
          title: "Lunar Gateway: Building the First Moon-Orbiting Station",
          source: { name: "International News" },
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800",
          description: "Global space agencies are collaborating on the Gateway, a vital component of the Artemis program that will orbit the Moon.",
          url: "https://nasa.gov"
        },
        {
          title: "Mystery of Fast Radio Bursts Deepens with New Signal",
          source: { name: "Astronomy Today" },
          publishedAt: new Date(Date.now() - 432000000).toISOString(),
          image: "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=800",
          description: "Researchers have detected a repeating fast radio burst from a nearby galaxy, challenging existing theories about their origin.",
          url: "https://astronomy.com"
        },
        {
          title: "Commercial Space Travel: The Next Frontier for Tourism",
          source: { name: "Business Insider" },
          publishedAt: new Date(Date.now() - 518400000).toISOString(),
          image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800",
          description: "As launch costs decrease, several companies are preparing to offer regular suborbital flights to private citizens.",
          url: "https://businessinsider.com"
        },
        {
          title: "Solar Flare Impact: Earth's Magnetic Field Braces",
          source: { name: "Weather Service" },
          publishedAt: new Date(Date.now() - 604800000).toISOString(),
          image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bcc0?w=800",
          description: "A significant solar flare is expected to cause beautiful auroras but may also interfere with satellite communications.",
          url: "https://noaa.gov"
        },
        {
          title: "Giant Asteroid Tracking: 2024 Project Update",
          source: { name: "Planetary Defense" },
          publishedAt: new Date(Date.now() - 691200000).toISOString(),
          image: "https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=800",
          description: "NASA's latest tracking data shows no immediate threats from large asteroids, but monitoring remains a top priority.",
          url: "https://nasa.gov"
        },
        {
          title: "Black Hole Discovery: First Image of Sgr A* Jet",
          source: { name: "Cosmos" },
          publishedAt: new Date(Date.now() - 777600000).toISOString(),
          image: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800",
          description: "The Event Horizon Telescope has captured a high-energy jet emanating from the center of our Milky Way galaxy.",
          url: "https://eventhorizontelescope.org"
        }
      ].map(a => ({ ...a, urlToImage: a.image }));
      setArticles(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredArticles = articles
    .filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sortBy === 'source') return (a.source?.name || '').localeCompare(b.source?.name || '');
      return 0;
    })
    .slice(0, 10);

  return (
    <div className="bg-[#fff9f5] dark:bg-gray-800 rounded-2xl border border-[#eee4da] dark:border-gray-700 p-4 md:p-6 shadow-sm mb-20 transition-all">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#2c3e50] dark:text-white">Breaking News</h2>
        <button 
          onClick={() => fetchNews(true)}
          className="px-4 py-2 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 rounded-full text-xs font-bold text-gray-700 dark:text-white hover:bg-gray-50 transition shadow-sm active:scale-95"
        >
          {loading ? 'Fetching...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search news intelligence..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition text-gray-700 dark:text-white"
          />
        </div>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition text-gray-700 dark:text-white font-medium"
        >
          <option value="date">Latest First</option>
          <option value="source">By Agency</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading && articles.length === 0 ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 animate-pulse rounded-xl" />
          ))
        ) : (
          filteredArticles.map((article, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <div key={idx} className={`bg-[#fdfbf7] dark:bg-gray-700 border transition-all duration-300 rounded-xl overflow-hidden ${isExpanded ? 'border-red-400 shadow-md ring-1 ring-red-400/20' : 'border-[#f3ebdf] dark:border-gray-600'}`}>
                <div 
                  onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
                  className="flex items-center gap-3 md:gap-4 p-3 cursor-pointer hover:bg-[#fffcf9] dark:hover:bg-gray-600/50 transition"
                >
                  <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                    <img 
                      src={article.urlToImage || 'https://via.placeholder.com/150'} 
                      alt="" 
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 border-2 border-[#fdfbf7] dark:border-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-[8px] md:text-[10px] text-white font-bold">{idx + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-tight truncate max-w-[80px] md:max-w-[120px]">
                        {article.source?.name || 'News'}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className={`text-xs md:text-sm font-bold text-gray-800 dark:text-white truncate ${isExpanded ? 'whitespace-normal line-clamp-2' : ''}`}>
                      {article.title}
                    </h3>
                  </div>

                  <button className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-red-500 text-white shadow-lg' : 'bg-white dark:bg-gray-600 border border-[#eee4da] dark:border-gray-500 text-red-500 hover:bg-red-50'}`}>
                    {isExpanded ? <ChevronUp className="w-3 h-3 md:w-4 md:h-4" /> : <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 md:px-16 pb-4 pt-1 animate-fadeIn">
                    <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {article.description}
                    </p>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-800 border border-[#eee4da] dark:border-gray-600 rounded-full text-[10px] font-bold text-gray-500 hover:text-blue-500 hover:border-blue-500 transition shadow-sm active:scale-95"
                    >
                      VISIT SOURCE <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400 mb-2">No matching reports found in database.</p>
            <button onClick={() => setSearch('')} className="text-xs text-blue-500 font-bold hover:underline">Clear Search</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDashboard;
