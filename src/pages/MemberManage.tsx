import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Modal } from '../components/ui/Modal';
import { useMemberStore } from '../stores/memberStore';
import { Member } from '../types';
import { Plus, Search, Crown, Phone, User, Trash2, Edit2, Save, X, Calendar, TrendingUp, Percent, AlertTriangle, Check } from 'lucide-react';
import { generateId, formatDateTime } from '../utils/time';
import { memberLevelNames, memberLevelDiscounts } from '../data/mockData';

const defaultMember: Partial<Member> = {
  name: '',
  phone: '',
  level: 0,
  totalSpent: 0,
  visitCount: 0,
};

export const MemberManage: React.FC = () => {
  const { members, addMember, updateMember, removeMember, findMemberByPhone, init } = useMemberStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member>>(defaultMember);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const filteredMembers = members.filter(m =>
    m.name.includes(searchQuery) || m.phone.includes(searchQuery)
  );

  const handleAdd = () => {
    setEditingMember({ ...defaultMember, id: generateId(), createdAt: new Date() });
    setIsNew(true);
    setShowModal(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember({ ...member });
    setIsNew(false);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    removeMember(id);
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (!editingMember.name || !editingMember.phone) return;

    if (isNew) {
      addMember(editingMember as Member);
    } else {
      updateMember(editingMember.id!, editingMember as Partial<Member>);
    }

    setShowModal(false);
    setEditingMember(defaultMember);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      case 3: return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 2: return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-400';
      default: return 'bg-gradient-to-r from-amber-500 to-yellow-500';
    }
  };

  const getLevelBorderColor = (level: number) => {
    switch (level) {
      case 4: return 'border-blue-400/50';
      case 3: return 'border-purple-400/50';
      case 2: return 'border-yellow-400/50';
      case 1: return 'border-gray-400/50';
      default: return 'border-amber-500/50';
    }
  };

  const sortedMembers = [...filteredMembers].sort((a, b) => b.level - a.level || b.totalSpent - a.totalSpent);
  const vipCount = members.filter(m => m.level > 0).length;

  const levelOptions = [0, 1, 2, 3, 4].map(level => ({
    value: level,
    label: memberLevelNames[level],
    discount: memberLevelDiscounts[level],
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="会员管理" />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-300 mb-1">会员总数</p>
              <p className="text-2xl font-bold text-white font-mono">{members.length}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-300 mb-1">VIP会员</p>
              <p className="text-2xl font-bold text-gold-400 font-mono">{vipCount}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs text-dark-300 mb-1">总消费</p>
              <p className="text-2xl font-bold text-primary-400 font-mono">
                ¥{members.reduce((sum, m) => sum + m.totalSpent, 0).toFixed(0)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索姓名或手机号"
                className="input pl-9"
              />
            </div>
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center gap-1.5 px-4"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedMembers.map(member => (
                <motion.div
                  key={member.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  className={`card p-4 border-2 ${getLevelBorderColor(member.level)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-xl ${getLevelColor(member.level)} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                      {member.level > 0 && (
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      )}
                      <Crown className={`w-7 h-7 relative z-10 ${
                        member.level >= 3 ? 'text-white drop-shadow-lg' :
                        member.level >= 1 ? 'text-white/90' :
                        'text-dark-900'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-base truncate">
                          {member.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelColor(member.level)} text-white`}>
                          {memberLevelNames[member.level]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-dark-300 mb-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-mono">{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-dark-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          消费 ¥{member.totalSpent.toFixed(0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {member.visitCount} 次
                        </span>
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {(memberLevelDiscounts[member.level] * 100).toFixed(0)}% 折扣
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="w-8 h-8 rounded-lg bg-dark-500 text-white hover:bg-dark-400 flex items-center justify-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(member.id)}
                        className="w-8 h-8 rounded-lg bg-dark-500 text-accent-400 hover:bg-accent-500/20 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {member.createdAt && (
                    <div className="mt-2 pt-2 border-t border-dark-600 text-xs text-dark-500">
                      注册时间：{formatDateTime(member.createdAt)}
                    </div>
                  )}

                  {deleteConfirm === member.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-dark-600 flex items-center justify-between"
                    >
                      <span className="text-sm text-dark-300">确认删除该会员？</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn-secondary py-1.5 px-3 text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
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

            {sortedMembers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-gold-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {searchQuery ? '未找到会员' : '暂无会员'}
                </h3>
                <p className="text-dark-400 text-sm mb-6">
                  {searchQuery ? '请尝试其他搜索关键词' : '添加第一位会员开始享受VIP服务'}
                </p>
                <button
                  onClick={handleAdd}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加会员
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isNew ? '添加会员' : '编辑会员'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" />
              姓名
            </label>
            <input
              type="text"
              value={editingMember.name || ''}
              onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
              placeholder="请输入会员姓名"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              手机号
            </label>
            <input
              type="tel"
              maxLength={11}
              value={editingMember.phone || ''}
              onChange={e => setEditingMember({ ...editingMember, phone: e.target.value.replace(/\D/g, '') })}
              placeholder="请输入11位手机号"
              className="input"
            />
            {editingMember.phone && editingMember.phone.length >= 11 && (
              <div className="mt-2">
                {(() => {
                  const existing = findMemberByPhone(editingMember.phone);
                  if (existing && existing.id !== editingMember.id) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-accent-400 bg-accent-500/10 p-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>该手机号已注册（{existing.name}）</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1.5">
              <Crown className="w-3.5 h-3.5 inline mr-1" />
              会员等级
            </label>
            <div className="grid grid-cols-2 gap-2">
              {levelOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setEditingMember({ ...editingMember, level: option.value })}
                  className={`p-3 rounded-xl text-sm transition-all ${
                    editingMember.level === option.value
                      ? `${getLevelColor(option.value)} text-white shadow-lg`
                      : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs ${
                    editingMember.level === option.value ? 'text-white/80' : 'text-dark-400'
                  }`}>
                    {(option.discount * 100).toFixed(0)}% 折扣
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isNew && (
            <div className="flex items-center gap-2 text-sm text-gold-400 bg-gold-500/10 p-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>新会员注册后可享受对应等级的折扣优惠和优先排队特权</span>
            </div>
          )}

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
              disabled={!editingMember.name || !editingMember.phone || editingMember.phone.length < 11}
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
