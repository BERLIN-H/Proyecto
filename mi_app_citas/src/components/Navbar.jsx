// components/Navbar.jsx
import React from 'react';
import { Brain, LogOut, User } from 'lucide-react';

const Navbar = ({ user, logout }) => (
  <nav className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-slate-200/50 shadow-sm">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-blue-800 bg-clip-text text-transparent">
            MindCare
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/50 rounded-xl px-4 py-2">
            <User className="w-5 h-5 text-slate-600" />
            <span className="text-slate-700 font-medium">{user.name}</span>
            {user.role === 'admin' && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                ADMIN
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
          >
            <LogOut className="w-5 h-5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
