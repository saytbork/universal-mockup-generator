import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SiteNav: React.FC = () => {
  const [showResources, setShowResources] = useState(false);
  const [isSticky, setIsSticky] = useState(true);

  useEffect(() => {
    setIsSticky(true);
  }, []);

  return (
    <div className={`w-full ${isSticky ? 'sticky top-0 z-40' : ''} bg-gray-950/90 backdrop-blur border-b border-white/10`}> 
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-gray-300">
        <Link to="/" className="flex items-center gap-2 text-white font-semibold">
          <span className="px-3 py-1 rounded-full bg-indigo-600/80 text-xs">BoostUGC</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/use-cases" className="hover:text-white transition">Use Cases</Link>
          <Link to="/comparisons" className="hover:text-white transition">Comparisons</Link>
          <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
          <div className="relative">
            <button
              onClick={() => setShowResources(prev => !prev)}
              className="hover:text-white transition flex items-center gap-1"
            >
              Resources <span className="text-xs">▾</span>
            </button>
            {showResources && (
              <div className="absolute right-0 mt-2 bg-white text-gray-900 shadow-xl rounded-lg p-4 flex-col gap-2 min-w-[180px]">
                <Link to="/blog" className="block hover:text-black" onClick={() => setShowResources(false)}>Blog</Link>
                <Link to="/guides" className="block hover:text-black" onClick={() => setShowResources(false)}>Guides</Link>
                <Link to="/faq" className="block hover:text-black" onClick={() => setShowResources(false)}>FAQ</Link>
              </div>
            )}
          </div>
          <Link
            to="/signup?plan=free"
            className="rounded-full bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
          >
            Launch App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SiteNav;
