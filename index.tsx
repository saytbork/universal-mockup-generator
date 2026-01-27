import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './src/contexts/AuthContext';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import { TooltipProvider } from './src/components/ui/tooltip';
import LandingPage from './LandingPage';
import PricingPage from './PricingPage';
import BlogPage from './BlogPage';
import BlogArticlePage from './BlogArticlePage';
import GuidesPage from './GuidesPage';
import GuideArticlePage from './GuideArticlePage';
import FAQPage from './FAQPage';
import UseCases from './UseCases';
import Comparisons from './Comparisons';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import SiteLayout from './src/components/SiteLayout';

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
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-8 space-y-4 shadow-md shadow-md shadow-indigo-500/20">
          <div className="text-xs uppercase tracking-[0.35em] text-indigo-600">Perfect Mockup</div>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-600">
            Try refreshing the page. If you have browser extensions enabled, try an incognito window.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 text-white transition"
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
            {/* Marketing site */}
              <Route element={<SiteLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/comparisons" element={<Comparisons />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/guides/:slug" element={<GuideArticlePage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>

            <Route path="/app" element={<AppWithTooltips />} />
            <Route path="/app/generator" element={<AppWithTooltips />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);
