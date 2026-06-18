import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Modal } from '../components/ui/Modal';
import { useBillingStore } from '../stores/billingStore';
import { RateSchedule } from '../types';
import { Plus, Clock, DollarSign, Trash2, Edit2, Save, X, AlertTriangle, Check, Moon, Sun, Sunset, Sunrise } from 'lucide-react';
import { generateId } from '../utils/time';
import { getCurrentRate } from '../utils/billing';

const defaultRate: Partial<RateSchedule> = {
  name: '',
  startTime: '09:00',
  endTime: '12:00',
  ratePerHour: 38,
  isPeak: false,
  enabled: true,
};

const timeIconMap: Record<string, React.ReactNode> = {
  '早间': <Sunrise className="w-4 h-4" />,
  '午间': <Sun className="w-4 h-4" />,
  '晚间': <Sunset className="w-4 h-4" />,
  '夜间': <Moon className="w-4 h-4" />,
};

export const RateConfig: React.FC = () => {
  const { rates, updateRates, init } = useBillingStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<Partial<RateSchedule>>(defaultRate);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const currentRate = getCurrentRate(rates);

  const getTimeIcon = (name: string) => {
    for (const [key, icon] of Object.entries(timeIconMap)) {
      if (name.includes(key)) return icon;
    }
    return <Clock className="w-4 h-4" />;
  };

  const handleAdd = () => {
    setEditingRate({ ...defaultRate, id: generateId() });
    setIsNew(true);
    setShowModal(true);
  };

  const handleEdit = (rate: RateSchedule) => {
    setEditingRate({ ...rate });
    setIsNew(false);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const newRates = rates.filter(r => r.id !== id);
    updateRates(newRates);
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (!editingRate.name || !editingRate.startTime || !editingRate.endTime || !editingRate.ratePerHour) {
      return;
    }

    let newRates;
    if (isNew) {
      newRates = [...rates, editingRate as RateSchedule];
    } else {
      newRates = rates.map(r => r.id === editingRate.id ? (editingRate as RateSchedule) : r);
    }
    
    updateRates(newRates);
    setShowModal(false);
    setEditingRate(defaultRate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleEnabled = (id: string) => {
    const newRates = rates.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    updateRates(newRates);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const sortedRates = [...rates].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen pb-24">
      <Header title="费率配置" />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 opacity-80" />
              <span className="text-sm opacity-80">当前生效费率</span>
            </div>
            {currentRate && (
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-bold">{currentRate.name}</h3>
                  <p className="text-sm opacity-80">
                    {currentRate.startTime} - {currentRate.endTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold font-mono">¥{currentRate.ratePerHour}</p>
                  <p className="text-xs opacity-70">每小时</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">时段费率列表</h2>
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center gap-1.5 py-2"
            >
              <Plus className="w-4 h-4" />
              添加时段
            </button>
          </motion.div>

          <div className="space-y-3">
            <AnimatePresence>
              {sortedRates.map((rate, index) => (
                <motion.div
                  key={rate.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  className={`card p-4 ${!rate.enabled ? 'opacity-50' : ''} ${
                    currentRate?.id === rate.id ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-dark-800' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      rate.isPeak ? 'bg-accent-500/20 text-accent-400' : 'bg-primary-500/20 text-primary-400'
                    }`}>
                      {getTimeIcon(rate.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white">{rate.name}</h4>
                        {rate.isPeak && (
                          <span className="badge-accent text-xs">高峰</span>
                        )}
                        {currentRate?.id === rate.id && (
                          <span className="badge-warning text-xs">当前</span>
                        )}
                        {!rate.enabled && (
                          <span className="text-xs text-dark-400">已停用</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-dark-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {rate.startTime} - {rate.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span className="text-gold-400 font-mono font-bold">¥{rate.ratePerHour}/时</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleEnabled(rate.id)}
                        className={`w-10 h-6 rounded-full transition-all relative ${
                          rate.enabled ? 'bg-primary-500' : 'bg-dark-500'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          rate.enabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                      <button
                        onClick={() => handleEdit(rate)}
                        className="w-8 h-8 rounded-lg bg-dark-500 text-white hover:bg-dark-400 flex items-center justify-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(rate.id)}
                        className="w-8 h-8 rounded-lg bg-dark-500 text-accent-400 hover:bg-accent-500/20 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {deleteConfirm === rate.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-dark-600 flex items-center justify-between"
                    >
                      <span className="text-sm text-dark-300">确认删除该时段费率？</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn-secondary py-1.5 px-3 text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="btn-danger py-1.5 px-3 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {sortedRates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-dark-400" />
                </div>
                <p className="text-dark-400">暂无费率配置</p>
                <button
                  onClick={handleAdd}
                  className="btn-primary mt-4"
                >
                  添加第一个时段
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isNew ? '添加时段费率' : '编辑时段费率'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1.5">时段名称</label>
            <input
              type="text"
              value={editingRate.name || ''}
              onChange={e => setEditingRate({ ...editingRate, name: e.target.value })}
              placeholder="如：早间特惠、午间平峰"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">开始时间</label>
              <input
                type="time"
                value={editingRate.startTime || ''}
                onChange={e => setEditingRate({ ...editingRate, startTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">结束时间</label>
              <input
                type="time"
                value={editingRate.endTime || ''}
                onChange={e => setEditingRate({ ...editingRate, endTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1.5">每小时费率（元）</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">¥</span>
              <input
                type="number"
                min="0"
                step="1"
                value={editingRate.ratePerHour || ''}
                onChange={e => setEditingRate({ ...editingRate, ratePerHour: Number(e.target.value) })}
                placeholder="38"
                className="input pl-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-dark-600/50 rounded-xl">
            <button
              onClick={() => setEditingRate({ ...editingRate, isPeak: !editingRate.isPeak })}
              className={`w-12 h-6 rounded-full transition-all relative ${
                editingRate.isPeak ? 'bg-accent-500' : 'bg-dark-500'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                editingRate.isPeak ? 'right-1' : 'left-1'
              }`} />
            </button>
            <div>
              <p className="text-white text-sm font-medium">高峰时段</p>
              <p className="text-xs text-dark-400">启用后排位优先级提升</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={!editingRate.name || !editingRate.startTime || !editingRate.endTime || !editingRate.ratePerHour}
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </Modal>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50"
        >
          <Check className="w-5 h-5" />
          <span className="font-medium">保存成功</span>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};
