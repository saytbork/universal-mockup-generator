import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';
import { AuthProvider } from './src/contexts/AuthContext';
import { FirebaseAuthGate } from './src/components/FirebaseAuthGate';
import UseCases from './UseCases';
import Comparisons from './Comparisons';
import BlogPage from './BlogPage';
import GuidesPage from './GuidesPage';
import FAQPage from './FAQPage';
import SiteNav from './src/components/SiteNav';
import SiteFooter from './src/components/SiteFooter';
import PrivacyPage from './PrivacyPage';
import TermsPage from './TermsPage';

const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gray-950 text-white min-h-screen flex flex-col">
    <SiteNav />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingLayout><LandingPage /></MarketingLayout>} />
          <Route path="/use-cases" element={<MarketingLayout><UseCases /></MarketingLayout>} />
          <Route path="/comparisons" element={<MarketingLayout><Comparisons /></MarketingLayout>} />
          <Route path="/blog" element={<MarketingLayout><BlogPage /></MarketingLayout>} />
          <Route path="/guides" element={<MarketingLayout><GuidesPage /></MarketingLayout>} />
          <Route path="/faq" element={<MarketingLayout><FAQPage /></MarketingLayout>} />
          <Route path="/privacy" element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
          <Route path="/terms" element={<MarketingLayout><TermsPage /></MarketingLayout>} />
          <Route
            path="/app"
            element={
              <FirebaseAuthGate>
                <App />
              </FirebaseAuthGate>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
