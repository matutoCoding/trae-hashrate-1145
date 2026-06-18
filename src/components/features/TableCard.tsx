import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, BillingSession } from '../../types';
import { useBillingStore } from '../../stores/billingStore';
import { useTimer } from '../../hooks/useTimer';
import { formatTime, formatDurationShort } from '../../utils/time';
import { estimateCurrentCost, getCurrentRate } from '../../utils/billing';
import { Crown, Club, User, Play, Square } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onOpen?: () => void;
  onClose?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onOpen, onClose }) => {
  const { rates } = useBillingStore();
  const session = useBillingStore(state => state.getActiveSessionByTableId(table.id));
  const [cost, setCost] = useState({ total: 0, duration: 0 });

  const { formattedTime, elapsedMinutes } = useTimer({
    startTime: session?.startTime,
    onTick: () => {
      if (session) {
        const estimated = estimateCurrentCost(session, rates);
        setCost({ total: estimated.total, duration: estimated.duration });
      }
    }
  });

  useEffect(() => {
    if (session) {
      const estimated = estimateCurrentCost(session, rates);
      setCost({ total: estimated.total, duration: estimated.duration });
    }
  }, [session, rates]);

  const currentRate = getCurrentRate(rates);

  const statusConfig = {
    available: {
      dot: 'status-available',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
      text: '空闲',
      textColor: 'text-primary-400',
      hoverBg: 'hover:bg-primary-500/20',
    },
    occupied: {
      dot: 'status-occupied',
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/30',
      text: '使用中',
      textColor: 'text-accent-400',
      hoverBg: 'hover:bg-accent-500/20',
    },
    maintenance: {
      dot: 'status-maintenance',
      bg: 'bg-dark-500/30',
      border: 'border-dark-400/30',
      text: '维护中',
      textColor: 'text-dark-300',
      hoverBg: '',
    },
  };

  const config = statusConfig[table.status];
  const typeIcon = table.type === 'american' ? <Play className="w-4 h-4" /> : <Club className="w-4 h-4" />;
  const typeName = table.type === 'american' ? '美式' : '斯诺克';

  const handleClick = () => {
    if (table.status === 'available') {
      onOpen?.();
    } else if (table.status === 'occupied') {
      onClose?.();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: table.status !== 'maintenance' ? 1.02 : 1 }}
      whileTap={{ scale: table.status !== 'maintenance' ? 0.98 : 1 }}
      onClick={handleClick}
      className={`card-hover p-4 cursor-pointer ${config.bg} ${config.border} border ${config.hoverBg} ${
        table.status === 'maintenance' ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg bg-pool-table flex items-center justify-center text-white font-bold`}>
            {table.name}
          </div>
          <div>
            <h3 className="font-bold text-white">{typeName}球台</h3>
            <div className="flex items-center gap-1.5">
              <div className={config.dot} />
              <span className={`text-xs ${config.textColor}`}>{config.text}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-dark-300">
          {typeIcon}
          <span className="text-xs">{typeName}</span>
        </div>
      </div>

      {session ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-dark-300" />
            <span className="text-dark-200">{session.customerName}</span>
            {session.isVip && (
              <span className="flex items-center gap-0.5 text-gold-400 text-xs">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
          </div>

          <div className="flex items-center justify-between bg-dark-600/50 rounded-lg px-3 py-2">
            <div className="text-center">
              <p className="text-xs text-dark-400">已用时</p>
              <p className="font-mono font-bold text-white text-lg">{formattedTime}</p>
            </div>
            <div className="w-px h-8 bg-dark-500" />
            <div className="text-center">
              <p className="text-xs text-dark-400">当前费率</p>
              <p className="font-mono font-bold text-primary-400">
                ¥{currentRate?.ratePerHour || 0}/时
              </p>
            </div>
            <div className="w-px h-8 bg-dark-500" />
            <div className="text-center">
              <p className="text-xs text-dark-400">预计费用</p>
              <p className="font-mono font-bold text-gold-400 text-lg animate-number-change">
                ¥{cost.total.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 flex items-center gap-1.5 text-xs text-dark-300">
              <Square className="w-3 h-3" />
              <span>开台: {formatTime(session.startTime)}</span>
            </div>
            <span className="text-xs text-dark-400">
              {formatDurationShort(cost.duration)}
            </span>
          </div>
        </div>
      ) : table.status === 'available' ? (
        <div className="flex items-center justify-center h-24 border-2 border-dashed border-dark-500 rounded-xl">
          <div className="text-center">
            <Play className="w-8 h-8 text-primary-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-dark-400">点击开台</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 bg-dark-600/30 rounded-xl">
          <p className="text-sm text-dark-400">维护中</p>
        </div>
      )}
    </motion.div>
  );
};
