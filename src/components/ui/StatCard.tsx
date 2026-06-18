import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'gold' | 'accent' | 'info';
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'primary',
  delay = 0,
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
      text: 'text-primary-400',
      iconBg: 'bg-primary-600/20',
    },
    gold: {
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/30',
      text: 'text-gold-400',
      iconBg: 'bg-gold-500/20',
    },
    accent: {
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/30',
      text: 'text-accent-400',
      iconBg: 'bg-accent-500/20',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      className={`card p-4 ${colors.bg} ${colors.border} border`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-dark-300 mb-1">{title}</p>
          <p className={`text-2xl font-bold number-mono ${colors.text}`}>
            {value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend >= 0 ? 'text-primary-400' : 'text-accent-400'
            }`}>
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-dark-400 ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`${colors.iconBg} p-2.5 rounded-xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};
