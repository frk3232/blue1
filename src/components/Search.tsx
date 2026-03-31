import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Navigation } from 'lucide-react';

interface SearchProps {
  onSearch: (destination: string) => void;
}

export const Search: React.FC<SearchProps> = ({ onSearch }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Where are you going in Kerala?"
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
