import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import ISSDashboard from './components/ISSDashboard';
import NewsDashboard from './components/NewsDashboard';
import Chatbot from './components/Chatbot';
import ChartsOverview from './components/ChartsOverview';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <header className="bg-[#fff9f5] dark:bg-gray-800 border border-[#eee4da] dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div>
            <p className="text-[#0088cc] font-bold text-xs tracking-widest uppercase mb-1">Mission Control Dashboard</p>
            <h1 className="text-3xl font-extrabold text-[#2c3e50] dark:text-white">
              Real-Time ISS and News Intelligence
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-6 py-2 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 rounded-full text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-50 transition shadow-sm"
          >
            Switch to {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>
      
      <main className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <div className="xl:col-span-8 h-full">
            <ISSDashboard />
          </div>
          <div className="xl:col-span-4 h-full">
            <ChartsOverview />
          </div>
        </div>
        <NewsDashboard />
      </main>

      <Chatbot />
    </div>
  );
}

export default App;
