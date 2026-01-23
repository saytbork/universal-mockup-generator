import React from 'react';
import { Outlet } from 'react-router-dom';
import SiteFooter from './SiteFooter';
import SiteNav from './SiteNav';

export default function SiteLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <SiteNav />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

