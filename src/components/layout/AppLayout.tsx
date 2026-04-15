import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HiOutlineMenu } from 'react-icons/hi';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex justify-center p-6 max-[640px]:p-3.5">
      <div className="w-full max-w-295 grid grid-cols-1 min-[980px]:grid-cols-[320px_1fr] gap-5.5 items-start">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 min-[980px]:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="bg-surface border border-line rounded-panel shadow-panel p-6.5 max-[640px]:rounded-[22px] max-[640px]:p-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="min-[980px]:hidden flex items-center gap-2 mb-4 text-muted hover:text-heading transition-colors"
          >
            <HiOutlineMenu className="w-6 h-6" />
            <span className="text-sm font-medium">Menú</span>
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
