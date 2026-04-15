import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HiOutlineMenu } from 'react-icons/hi';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex justify-center p-4 min-[980px]:p-5">
      <div className="w-full max-w-295 grid grid-cols-1 min-[980px]:grid-cols-[288px_1fr] gap-4 items-start">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 min-[980px]:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="bg-surface border border-line rounded-panel shadow-panel p-5 max-[640px]:rounded-section max-[640px]:p-4">
          {/* Mobile top bar */}
          <div className="min-[980px]:hidden flex items-center justify-between mb-4 pb-3 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-logo bg-primary text-white grid place-items-center font-extrabold text-sm">
                V
              </div>
              <span className="font-bold text-heading text-[15px]">Visitador</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-control bg-input-bg text-muted hover:text-heading hover:bg-line transition-colors border-none cursor-pointer"
            >
              <HiOutlineMenu className="w-5 h-5" />
              <span className="text-sm font-medium">Menú</span>
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
