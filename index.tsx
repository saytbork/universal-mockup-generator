import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';
import { AuthProvider } from './src/contexts/AuthContext';
import UseCases from './UseCases';
import Comparisons from './Comparisons';
import BlogPage from './BlogPage';
import GuidesPage from './GuidesPage';
import FAQPage from './FAQPage';
import SiteNav from './src/components/SiteNav';
import SiteFooter from './src/components/SiteFooter';
import PrivacyPage from './PrivacyPage';
import TermsPage from './TermsPage';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import BlogArticlePage from './BlogArticlePage';
import { TooltipProvider } from '@/components/ui/tooltip';

class RootErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('[ROOT ERROR]', error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-bg text-gray-900 flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 space-y-4 shadow-md shadow-md shadow-indigo-500/20">
          <div className="text-xs uppercase tracking-[0.35em] text-indigo-600">Perfect Mockup</div>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-600">
            Try refreshing the page. If you have browser extensions enabled, try an incognito window.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition"
          >
            Reload
          </button>
          <details className="pt-2">
            <summary className="cursor-pointer text-xs text-gray-600">Details</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600">
              {this.state.error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-bg text-gray-900 min-h-screen flex flex-col">
    <SiteNav />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const AppWithTooltips = () => (
  <TooltipProvider delayDuration={150}>
    <App />
  </TooltipProvider>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MarketingLayout><LandingPage /></MarketingLayout>} />
            <Route path="/use-cases" element={<MarketingLayout><UseCases /></MarketingLayout>} />
            <Route path="/comparisons" element={<MarketingLayout><Comparisons /></MarketingLayout>} />
            <Route path="/blog" element={<MarketingLayout><BlogPage /></MarketingLayout>} />
            <Route path="/blog/:slug" element={<MarketingLayout><BlogArticlePage /></MarketingLayout>} />
            <Route path="/guides" element={<MarketingLayout><GuidesPage /></MarketingLayout>} />
            <Route path="/faq" element={<MarketingLayout><FAQPage /></MarketingLayout>} />
            <Route path="/privacy" element={<MarketingLayout><PrivacyPage /></MarketingLayout>} />
            <Route path="/terms" element={<MarketingLayout><TermsPage /></MarketingLayout>} />
            <Route path="/app" element={<AppWithTooltips />} />
            <Route path="/app/generator" element={<AppWithTooltips />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);
