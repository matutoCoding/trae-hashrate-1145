import React from 'react';
import { motion } from 'framer-motion';
import { QueueEntry } from '../../types';
import { useQueueStore } from '../../stores/queueStore';
import { formatTime, formatDuration } from '../../utils/time';
import { Crown, Clock, Phone, User, X, Check, Bell } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

interface QueueItemProps {
  entry: QueueEntry;
  position: number;
  onCall?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onArrive?: () => void;
  showActions?: boolean;
  showCalledTime?: boolean;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  entry,
  position,
  onCall,
  onCancel,
  onComplete,
  onArrive,
  showActions = true,
  showCalledTime = false,
}) => {
  const { getEstimatedWaitTime } = useQueueStore();
  const waitMinutes = differenceInMinutes(new Date(), entry.joinTime);
  const estimatedMinutes = getEstimatedWaitTime(entry);

  const statusConfig = {
    waiting: {
      bg: 'bg-dark-700/80',
      border: 'border-dark-500/50',
      text: '等待中',
      badge: 'badge-info',
      glow: '',
    },
    called: {
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/50',
      text: '已叫号',
      badge: 'badge-warning',
      glow: 'animate-vip-pulse',
    },
    completed: {
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
      text: '已完成',
      badge: 'badge-success',
      glow: '',
    },
    cancelled: {
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/30',
      text: '已取消',
      badge: 'badge-danger',
      glow: '',
    },
  };

  const config = statusConfig[entry.status];
  const tableTypeNames = {
    american: '美式',
    snooker: '斯诺克',
    any: '不限',
  };

  const tableTypeColors = {
    american: 'text-primary-400',
    snooker: 'text-blue-400',
    any: 'text-dark-300',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`card p-4 ${config.bg} ${config.border} border ${config.glow || ''} ${
        entry.isVip && entry.memberLevel >= 3 ? 'vip-glow' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
          entry.isVip
            ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-dark-900'
            : 'bg-dark-600 text-white'
        }`}>
          <span className="text-[10px] font-medium opacity-80">号码</span>
          <span className="text-xl font-bold font-mono">{entry.queueNumber}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-white truncate">{entry.customerName}</h4>
            {entry.isVip && (
              <span className="flex items-center gap-0.5 text-gold-400 text-xs">
                <Crown className="w-3 h-3" />
                Lv.{entry.memberLevel}
              </span>
            )}
            <span className={`text-xs ${tableTypeColors[entry.tableType]}`}>
              {tableTypeNames[entry.tableType]}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-dark-300 mb-2">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{entry.customerPhone.slice(-4)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(waitMinutes)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={config.badge}>{config.text}</span>
            {entry.status === 'waiting' && position > 0 && (
              <div className="text-xs text-dark-300">
                预计等待: <span className="text-gold-400 font-medium">{formatDuration(estimatedMinutes)}</span>
              </div>
            )}
            {showCalledTime && entry.calledTime && (
              <div className="text-xs text-dark-300">
                叫号时间: <span className="text-gold-400 font-mono">{formatTime(entry.calledTime)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {entry.status === 'waiting' && (
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                entry.isVip ? 'text-gold-400' : 'text-white'
              } number-mono`}>
                #{position}
              </div>
              <div className="text-[10px] text-dark-400">当前排队</div>
            </div>
          )}
        </div>
      </div>

      {entry.note && (
        <div className="mt-2 pt-2 border-t border-dark-500/50 text-xs text-dark-300">
          备注: {entry.note}
        </div>
      )}

      {showActions && entry.status === 'waiting' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-500/50">
          <button
            onClick={onCall}
            className="flex-1 btn-gold py-2 text-sm"
          >
            <Bell className="w-4 h-4" />
            叫号
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary py-2 text-sm px-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showActions && entry.status === 'called' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-500/50">
          <button
            onClick={onArrive || onComplete}
            className="flex-1 btn-primary py-2 text-sm"
          >
            <Check className="w-4 h-4" />
            确认到店
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary py-2 text-sm px-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};
