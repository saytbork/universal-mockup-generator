import React from 'react';
import { Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-bg border-t border-gray-200 text-gray-600">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-xl font-semibold text-gray-900">Perfect Mockup</p>
          <p className="text-sm text-gray-600 max-w-3xl">
            Perfect Mockup helps ecommerce brands create product mockups, lifestyle visuals and UGC-style content without photoshoots. Designed for product pages, ads, social media and launches.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 text-sm">
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
              <li><a className="hover:text-gray-900" href="mailto:support@boostugc.app">Support</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 font-semibold">Company</p>
            <ul className="space-y-1">
              <li><Link to="/terms" className="hover:text-gray-900">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li><a className="hover:text-gray-900" href="mailto:support@boostugc.app">support@boostugc.app</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
          <p>© 2025 Perfect Mockup. All rights reserved.</p>
          <div className="flex items-center gap-3 text-gray-600">
            <a href="#" aria-label="Instagram" className="hover:text-gray-900"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gray-900"><Twitter className="w-4 h-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gray-900"><Youtube className="w-4 h-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-gray-900"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
