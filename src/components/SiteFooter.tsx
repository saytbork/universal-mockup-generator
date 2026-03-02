import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600 dark:bg-black dark:border-white/10 dark:text-white/70">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <Logo className="text-gray-900" />
          <p className="text-sm text-gray-600 max-w-3xl">
            Perfect Mockup helps ecommerce brands create product mockups, lifestyle visuals and UGC-style content without photoshoots. Designed for product pages, ads, social media and launches.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Product</p>
            <ul className="space-y-1">
              <li><Link to="/app" className="hover:text-gray-900">Start creating</Link></li>
              <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
              <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Resources</p>
            <ul className="space-y-1">
              <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-gray-900">Blog</Link></li>
              <li><Link to="/use-cases" className="hover:text-gray-900">Use Cases</Link></li>
              <li><Link to="/comparisons" className="hover:text-gray-900">Comparisons</Link></li>
              <li><a className="hover:text-gray-900" href="mailto:support@perfectmockup.com">Support</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Company</p>
            <ul className="space-y-1">
              <li><Link to="/terms" className="hover:text-gray-900">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li><a className="hover:text-gray-900" href="mailto:support@perfectmockup.com">support@perfectmockup.com</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
          <p>© 2025 Perfect Mockup. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
