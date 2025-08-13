import { memo } from 'react';
import { Outlet } from 'react-router-dom';

// Memoized Layout component for better performance
const Layout = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
