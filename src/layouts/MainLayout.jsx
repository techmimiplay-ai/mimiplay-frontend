import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Settings, LogOut, User } from 'lucide-react';
import { Avatar } from '../components/shared';

const MainLayout = ({ 
  children, 
  user = { name: 'User', role: 'Teacher', avatar: null },
  sidebar,
  showNotifications = true,
  onLogout
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      
      {/* Top Header */}
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          
          {/* Left: Logo + Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="text-2xl font-display font-bold text-gradient">
              Alexi
            </h1>
          </div>
          
          {/* Right: Notifications + User */}
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            {showNotifications && (
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={24} className="text-text" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Avatar src={user.avatar} alt={user.name} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-text">{user.name}</p>
                  <p className="text-xs text-text/60">{user.role}</p>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-2 border border-gray-100"
                  >
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text">
                      <User size={18} />
                      <span>Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-text">
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-100" />
                    <button 
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-white shadow-xl z-20 overflow-y-auto"
            >
              <div className="p-4">
                {sidebar}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;