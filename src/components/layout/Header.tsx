import React from 'react';
import { Menu, X, Clock, CircleUser } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateTime } from '../../utils/time';
import { useState, useEffect } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false, onBack, rightAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/tables', label: '球台管理', icon: '🎱' },
    { path: '/rates', label: '费率配置', icon: '💰' },
    { path: '/queue', label: '排队叫台', icon: '📋' },
    { path: '/members', label: '会员管理', icon: '👑' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-md border-b border-dark-600/50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-dark-200 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 -ml-2 text-dark-200 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-dark-300">
              <Clock className="w-3 h-3" />
              <span>{formatDateTime(currentTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightAction}
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center">
            <CircleUser className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-dark-800 z-50 border-r border-dark-600"
            >
              <div className="p-4 border-b border-dark-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-pool-table flex items-center justify-center text-2xl">
                    🎱
                  </div>
                  <div>
                    <h2 className="font-bold text-white">台球俱乐部</h2>
                    <p className="text-xs text-dark-300">智能管理系统</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      navigate(item.path);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === item.path
                        ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                        : 'text-dark-200 hover:bg-dark-600/50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-600">
                <div className="text-xs text-dark-400 text-center">
                  版本 v1.0.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
