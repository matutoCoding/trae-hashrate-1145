import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Table2, Bell, Users, Receipt } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Home, color: 'text-primary-400' },
    { path: '/tables', label: '球台', icon: Table2, color: 'text-primary-400' },
    { path: '/queue', label: '叫台', icon: Bell, color: 'text-gold-400' },
    { path: '/bills', label: '账单', icon: Receipt, color: 'text-accent-400' },
    { path: '/members', label: '会员', icon: Users, color: 'text-gold-400' },
  ];

  const currentIndex = navItems.findIndex(item => item.path === location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-800/95 backdrop-blur-md border-t border-dark-600/50 safe-bottom">
      <div className="relative max-w-lg mx-auto px-2">
        {currentIndex >= 0 && (
          <motion.div
            className="absolute bottom-0 top-0 w-1/5"
            initial={false}
            animate={{
              x: `${currentIndex * 100}%`,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full" />
          </motion.div>
        )}
        
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors relative ${
                  isActive ? item.color : 'text-dark-400 hover:text-dark-200'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  className="flex flex-col items-center gap-0.5"
                  animate={isActive ? { y: -2 } : { y: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
