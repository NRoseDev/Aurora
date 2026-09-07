import { useState } from 'react';
import Navigation from './components/Navigation';
import StoreDashboard from './components/StoreDashboard';
import OrdersTab from './components/OrdersTab';
import Scrapbook from './components/Scrapbook';

type Page = 'dashboard' | 'orders' | 'analytics' | 'scrapbook';

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Aurora Unified Command
          </h1>
          <p className="text-sm text-slate-400">
            Multi-platform creator management system
          </p>
        </header>

        <Navigation
          activeTab={page}
          setActiveTab={setPage}
        />

        <main>
          {page === 'dashboard' && <StoreDashboard />}
          {page === 'orders' && <OrdersTab />}
          {page === 'scrapbook' && <Scrapbook />}
          {page === 'analytics' && (
            <div className="p-6 text-slate-400">
              Analytics coming online.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
