import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { CommandPalette } from '../common/CommandPalette.js';

export function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text cyber-grid">
      <Navbar onOpenSearch={() => setCommandPaletteOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
