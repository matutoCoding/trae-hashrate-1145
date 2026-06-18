import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { useBillingStore } from '../stores/billingStore';
import { useQueueStore } from '../stores/queueStore';
import { useMemberStore } from '../stores/memberStore';
import { QueueTableType } from '../types';
import { DollarSign, Table2, Users, Clock, TrendingUp, Crown, AlertTriangle, UserPlus, Phone, User, Check, X } from 'lucide-react';
import { getCurrentRate } from '../utils/billing';
import { formatTime, formatDurationMs } from '../utils/time';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { init: initBilling, rates, tables, todayStats, sessions } = useBillingStore();
  const { init: initQueue, getSortedQueue, currentCall, refreshPriorities, addToQueue } = useQueueStore();
  const { init: initMember, members, findMemberByPhone } = useMemberStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    tableType: 'any' as QueueTableType,
    isVip: false,
    memberLevel: 0,
  });
  const [memberFound, setMemberFound] = useState<any>(null);

  useEffect(() => {
    initBilling();
    initQueue();
    initMember();
    
    const interval = setInterval(() => {
      refreshPriorities();
    }, 60000);

    return () => clearInterval(interval);
  }, [initBilling, initQueue, initMember, refreshPriorities]);

  const currentRate = getCurrentRate(rates);
  const sortedQueue = getSortedQueue();
  const waitingCount = sortedQueue.filter(e => e.status === 'waiting').length;
  const vipCount = sortedQueue.filter(e => e.status === 'waiting' && e.isVip).length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const activeSessions = sessions.filter(s => s.status === 'active');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="首页概览" />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div
            variants={containerVariants}
            className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-5 text-white relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">当前时段</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {currentRate?.name || '未知时段'}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold font-mono">
                  ¥{currentRate?.ratePerHour || 0}
                  <span className="text-sm font-normal opacity-70">/小时</span>
                </span>
                {currentRate?.isPeak && (
                  <span className="flex items-center gap-1 bg-accent-500/30 px-2 py-0.5 rounded-full text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    高峰时段
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="今日营收"
              value={`¥${todayStats.revenue.toFixed(2)}`}
              icon={<DollarSign className="w-5 h-5 text-primary-400" />}
              color="primary"
              delay={0.1}
            />
            <StatCard
              title="今日订单"
              value={todayStats.billsCount}
              icon={<TrendingUp className="w-5 h-5 text-gold-400" />}
              color="gold"
              delay={0.15}
            />
            <StatCard
              title="使用中球台"
              value={`${occupiedTables}/${tables.length}`}
              icon={<Table2 className="w-5 h-5 text-accent-400" />}
              color="accent"
              delay={0.2}
            />
            <StatCard
              title="排队人数"
              value={waitingCount}
              icon={<Users className="w-5 h-5 text-blue-400" />}
              color="info"
              delay={0.25}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">球台状态</h3>
              <button
                onClick={() => navigate('/tables')}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                查看全部 →
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {tables.slice(0, 8).map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                    table.status === 'available'
                      ? 'bg-primary-500/10 border border-primary-500/30'
                      : table.status === 'occupied'
                      ? 'bg-accent-500/10 border border-accent-500/30'
                      : 'bg-dark-600 border border-dark-500'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mb-1 ${
                    table.status === 'available' ? 'bg-primary-500' :
                    table.status === 'occupied' ? 'bg-accent-500' : 'bg-dark-400'
                  }`} />
                  <span className="text-sm font-bold text-white">{table.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {currentCall && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/50 rounded-2xl p-4 animate-pulse-slow"
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-gold-400" />
                <span className="text-gold-400 font-bold">当前叫号</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-gold-400 font-mono">
                    {currentCall.queueNumber}
                  </div>
                  <div className="text-sm text-white">
                    {currentCall.customerName} · {currentCall.tableType === 'american' ? '美式' : currentCall.tableType === 'snooker' ? '斯诺克' : '不限'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-dark-300">叫号时间</div>
                  <div className="text-white font-mono">
                    {currentCall.calledTime && formatTime(currentCall.calledTime)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {sortedQueue.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold-400" />
                  排队队列
                  {vipCount > 0 && (
                    <span className="badge-warning">{vipCount} 位VIP</span>
                  )}
                </h3>
                <button
                  onClick={() => navigate('/queue')}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  叫台管理 →
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {sortedQueue.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      entry.status === 'called' ? 'bg-gold-500/10' : 'bg-dark-600/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      entry.isVip
                        ? 'bg-gold-500 text-dark-900'
                        : 'bg-dark-500 text-white'
                    }`}>
                      {entry.queueNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">
                          {entry.customerName}
                        </span>
                        {entry.isVip && (
                          <Crown className="w-3 h-3 text-gold-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-dark-400">
                        {entry.tableType === 'american' ? '美式' : entry.tableType === 'snooker' ? '斯诺克' : '不限'}
                      </div>
                    </div>
                    <span className={`text-xs ${
                      entry.status === 'waiting' ? 'text-primary-400' :
                      entry.status === 'called' ? 'text-gold-400' : 'text-dark-400'
                    }`}>
                      {entry.status === 'waiting' ? `#${index + 1}` :
                       entry.status === 'called' ? '已叫号' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="card p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary-500/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">暂无排队</h3>
              <p className="text-dark-400 text-sm mb-4">当前无需排队，可直接开台消费</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                取号排队
              </button>
            </motion.div>
          )}

          {activeSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-4"
            >
              <h3 className="font-bold text-white mb-3">进行中的消费</h3>
              <div className="space-y-2">
                {activeSessions.slice(0, 3).map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-dark-600/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pool-table flex items-center justify-center text-white font-bold">
                        {session.tableName}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">
                            {session.customerName}
                          </span>
                          {session.isVip && (
                            <Crown className="w-3 h-3 text-gold-400" />
                          )}
                        </div>
                        <div className="text-xs text-dark-400">
                          开台 {formatTime(session.startTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-mono font-bold">
                        {formatDurationMs(Date.now() - session.startTime.getTime())}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
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
              <div className="mt-2 p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center gap-3">
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
              </div>
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
              {[
                { id: 'any' as const, label: '不限类型' },
                { id: 'american' as const, label: '美式' },
                { id: 'snooker' as const, label: '斯诺克' },
              ].map(option => (
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

      <BottomNav />
    </div>
  );
};
