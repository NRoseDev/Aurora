import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Studio } from './pages/Studio';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Store } from './pages/Store';
import { Pricing } from './pages/Pricing';
import { Security } from './pages/Security';
import { Constellation } from './pages/Constellation';
import { LegalHub } from './pages/LegalHub';
import { Community } from './pages/Community';
import type { Page, SubscriptionTier } from './types';

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [language, setLanguage] = useState('en');

  const navigate = (p: Page) => setPage(p);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard tier={tier} onNavigate={navigate} />;
      case 'studio': return <Studio tier={tier} onNavigate={navigate} />;
      case 'products': return <Products onNavigate={navigate} />;
      case 'orders': return <Orders />;
      case 'store': return <Store tier={tier} onNavigate={navigate} />;
      case 'pricing': return <Pricing currentTier={tier} onUpgrade={setTier} />;
      case 'security': return <Security />;
      case 'constellation': return <Constellation />;
      case 'legal': return <LegalHub />;
      case 'community': return <Community />;
      default: return <Dashboard tier={tier} onNavigate={navigate} />;
    }
  };

  return (
    <Layout
      currentPage={page}
      onNavigate={navigate}
      tier={tier}
      language={language}
      onLanguageChange={setLanguage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
