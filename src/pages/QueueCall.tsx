import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { QueueItem } from '../components/features/QueueItem';
import { Modal } from '../components/ui/Modal';
import { useQueueStore } from '../stores/queueStore';
import { useBillingStore } from '../stores/billingStore';
import { useMemberStore } from '../stores/memberStore';
import { QueueEntry, TableType, QueueTableType } from '../types';
import { UserPlus, Users, Crown, Bell, History, X, Check, Phone, User, Table2, AlertTriangle } from 'lucide-react';
import { formatTime } from '../utils/time';

export const QueueCall: React.FC = () => {
  const { getSortedQueue, addToQueue, callNext, callSpecific, cancelEntry, markArrived, currentCall, init: initQueue, refreshPriorities } = useQueueStore();
  const { tables, init: initBilling } = useBillingStore();
  const { findMemberByPhone, init: initMember } = useMemberStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<QueueEntry[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    tableType: 'any' as QueueTableType,
    isVip: false,
    memberLevel: 0,
  });

  const [memberFound, setMemberFound] = useState<any>(null);

  useEffect(() => {
    initQueue();
    initBilling();
    initMember();
    
    const interval = setInterval(() => {
      refreshPriorities();
    }, 60000);

    return () => clearInterval(interval);
  }, [initQueue, initBilling, initMember, refreshPriorities]);

  const sortedQueue = getSortedQueue();
  const waitingQueue = sortedQueue.filter(e => e.status === 'waiting');
  const calledQueue = sortedQueue.filter(e => e.status === 'called');

  const availableTables = (type?: QueueTableType) => {
    return tables.filter(t => {
      if (t.status !== 'available') return false;
      if (type && type !== 'any' && t.type !== type) return false;
      return true;
    }).length;
  };

  const handlePhoneSearch = (phone: string) => {
    setFormData({ ...formData, phone });
    if (phone.length >= 11) {
      const member = findMemberByPhone(phone);
      if (member) {
        setMemberFound(member);
        setFormData(prev => ({
          ...prev,
          customerName: member.name,
          isVip: true,
          memberLevel: member.level,
        }));
      } else {
        setMemberFound(null);
      }
    } else {
      setMemberFound(null);
    }
  };

  const handleAddToQueue = () => {
    if (!formData.customerName || !formData.phone) return;

    addToQueue({
      customerName: formData.customerName,
      phone: formData.phone,
      customerPhone: formData.phone,
      tableType: formData.tableType,
      isVip: formData.isVip,
      memberLevel: formData.memberLevel,
    });

    setShowAddModal(false);
    setFormData({
      customerName: '',
      phone: '',
      tableType: 'any' as QueueTableType,
      isVip: false,
      memberLevel: 0,
    });
    setMemberFound(null);
  };

  const playNotificationSound = () => {
    try {
      if (!audioRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (e) {
      // 静默失败
    }
  };

  const handleCallNext = () => {
    const entry = callNext();
    if (entry) {
      playNotificationSound();
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
    }
  };

  const handleCallSpecific = (entryId: string) => {
    const entry = callSpecific(entryId);
    if (entry) {
      playNotificationSound();
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
    }
  };

  const vipCount = waitingQueue.filter(e => e.isVip).length;
  const tableTypeOptions = [
    { id: 'any' as const, label: '不限类型', count: availableTables('any') },
    { id: 'american' as const, label: '美式', count: availableTables('american') },
    { id: 'snooker' as const, label: '斯诺克', count: availableTables('snooker') },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Header title="排队叫台" />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 card p-4 text-center">
            <p className="text-xs text-dark-300 mb-1">等待中</p>
            <p className="text-3xl font-bold text-primary-400 font-mono">{waitingQueue.length}</p>
            {vipCount > 0 && (
              <p className="text-xs text-gold-400 flex items-center justify-center gap-1 mt-1">
                <Crown className="w-3 h-3" />
                {vipCount}位VIP
              </p>
            )}
          </div>
          <div className="flex-1 card p-4 text-center">
            <p className="text-xs text-dark-300 mb-1">已叫号</p>
            <p className="text-3xl font-bold text-gold-400 font-mono">{calledQueue.length}</p>
          </div>
          <div className="flex-1 card p-4 text-center">
            <p className="text-xs text-dark-300 mb-1">空球台</p>
            <p className="text-3xl font-bold text-accent-400 font-mono">{availableTables('any')}</p>
          </div>
        </div>

        {currentCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/50 rounded-2xl p-4 mb-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-gold-400 animate-bounce-slow" />
                <span className="text-gold-400 font-bold">当前叫号</span>
                <span className="text-xs text-dark-400 ml-auto">
                  {currentCall.calledTime && formatTime(currentCall.calledTime)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gold-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-dark-900 font-mono">
                    {currentCall.queueNumber}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">{currentCall.customerName}</span>
                    {currentCall.isVip && (
                      <Crown className="w-5 h-5 text-gold-400" />
                    )}
                  </div>
                  <p className="text-sm text-dark-300">
                    {currentCall.tableType === 'american' ? '美式' : currentCall.tableType === 'snooker' ? '斯诺克' : '不限'}球台
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleAddToQueue}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
          >
            <UserPlus className="w-5 h-5" />
            取号排队
          </button>
          <button
            onClick={handleCallNext}
            disabled={waitingQueue.length === 0 || availableTables('any') === 0}
            className="btn-gold flex-1 flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Bell className="w-5 h-5" />
            叫下一位
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="btn-secondary w-12 py-3 flex items-center justify-center"
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        {waitingQueue.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-400" />
              等待队列
              <span className="text-xs text-dark-400 font-normal">
                (按优先级排序)
              </span>
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {waitingQueue.map((entry, index) => (
                  <QueueItem
                    key={entry.id}
                    entry={entry}
                    position={index + 1}
                    onCall={() => handleCallSpecific(entry.id)}
                    onCancel={() => cancelEntry(entry.id)}
                    onArrive={() => markArrived(entry.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {calledQueue.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gold-400" />
              已叫号待确认
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {calledQueue.map((entry, index) => (
                  <QueueItem
                    key={entry.id}
                    entry={entry}
                    position={0}
                    showCalledTime
                    onCall={() => markArrived(entry.id)}
                    onCancel={() => cancelEntry(entry.id)}
                    onArrive={() => markArrived(entry.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {waitingQueue.length === 0 && calledQueue.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-500/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">暂无排队</h3>
            <p className="text-dark-400 text-sm mb-6">当前无需排队，可直接开台消费</p>
            <button
              onClick={handleAddToQueue}
              className="btn-primary inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              取号排队
            </button>
          </motion.div>
        )}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="取号排队"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              手机号
            </label>
            <input
              type="tel"
              maxLength={11}
              value={formData.phone}
              onChange={e => handlePhoneSearch(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入手机号查询会员"
              className="input"
            />
            {memberFound && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-dark-900" />
                </div>
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    {memberFound.name}
                    <span className="text-xs text-gold-400">
                      {memberFound.levelName}
                    </span>
                  </p>
                  <p className="text-xs text-dark-400">VIP会员，可享受优先插队</p>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" />
              顾客姓名
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="请输入顾客姓名"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1.5">
              <Table2 className="w-3.5 h-3.5 inline mr-1" />
              球台类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tableTypeOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setFormData({ ...formData, tableType: option.id })}
                  className={`p-3 rounded-xl text-sm transition-all ${
                    formData.tableType === option.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs ${
                    formData.tableType === option.id ? 'text-white/70' : 'text-dark-400'
                  }`}>
                    余{option.count}台
                  </div>
                </button>
              ))}
            </div>
          </div>

          {formData.isVip && (
            <div className="flex items-center gap-2 text-sm text-gold-400 bg-gold-500/10 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>VIP会员将按优先级自动插队到合适位置</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={handleAddToQueue}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={!formData.customerName || !formData.phone}
            >
              <Check className="w-4 h-4" />
              确认取号
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="叫号历史"
      >
        {history.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={`${entry.id}-${index}`}
                className="flex items-center gap-3 p-3 bg-dark-600/50 rounded-xl"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  entry.isVip ? 'bg-gold-500 text-dark-900' : 'bg-dark-500 text-white'
                }`}>
                  {entry.queueNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">
                      {entry.customerName}
                    </span>
                    {entry.isVip && <Crown className="w-3 h-3 text-gold-400 flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-dark-400">
                    {entry.tableType === 'american' ? '美式' : entry.tableType === 'snooker' ? '斯诺克' : '不限'}
                  </div>
                </div>
                <div className="text-xs text-dark-400">
                  {entry.calledTime && formatTime(entry.calledTime)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-dark-500 mx-auto mb-2" />
            <p className="text-dark-400">暂无叫号记录</p>
          </div>
        )}
      </Modal>

      <BottomNav />
    </div>
  );
};
