import React from 'react';
import { Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-white/10 text-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-xl font-semibold text-white">The fastest AI generator for product mockups & lifestyle UGC.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 text-sm">
          <div className="space-y-2">
            <p className="text-white font-semibold">Product</p>
            <ul className="space-y-1">
              <li><Link to="/" className="hover:text-white">Generate UGC</Link></li>
              <li><a className="hover:text-white" href="#">Lifestyle Mode</a></li>
              <li><a className="hover:text-white" href="#">Studio Mode</a></li>
              <li><a className="hover:text-white" href="#">Aesthetic Mode</a></li>
              <li><a className="hover:text-white" href="#">Background Replace</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Resources</p>
            <ul className="space-y-1">
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/use-cases" className="hover:text-white">Use Cases</Link></li>
              <li><Link to="/comparisons" className="hover:text-white">Comparisons</Link></li>
              <li><a className="hover:text-white" href="mailto:support@boostugc.app">Support</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Company</p>
            <ul className="space-y-1">
              <li><a className="hover:text-white" href="#">About</a></li>
              <li><a className="hover:text-white" href="#">Affiliates</a></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><a className="hover:text-white" href="mailto:support@boostugc.app">support@boostugc.app</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-gray-500">
          <p>© 2025 BoostUGC. All rights reserved.</p>
          <div className="flex items-center gap-3 text-gray-400">
            <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><Twitter className="w-4 h-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-white"><Youtube className="w-4 h-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
