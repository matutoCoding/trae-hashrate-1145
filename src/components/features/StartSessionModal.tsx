import React, { useState, useEffect } from 'react';
import { Modal, ModalActions } from '../ui/Modal';
import { useBillingStore } from '../../stores/billingStore';
import { useMemberStore } from '../../stores/memberStore';
import { cueTypes } from '../../data/mockData';
import { generateId } from '../../utils/time';
import { CueRental, Table, Member } from '../../types';
import { User, Phone, Crown, Plus, Minus, X, Search } from 'lucide-react';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onStart?: () => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  table,
  onStart,
}) => {
  const { startSession } = useBillingStore();
  const { findMemberByPhone } = useMemberStore();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [memberLevel, setMemberLevel] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [foundMember, setFoundMember] = useState<Member | null>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCues, setSelectedCues] = useState<CueRental[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCustomerName('');
      setCustomerPhone('');
      setIsVip(false);
      setMemberLevel(0);
      setCustomerId('');
      setFoundMember(null);
      setSearchPhone('');
      setSelectedCues([]);
      setIsSearching(false);
    }
  }, [isOpen]);

  const handleSearchMember = () => {
    if (!searchPhone) return;
    const member = findMemberByPhone(searchPhone);
    if (member) {
      setFoundMember(member);
      setCustomerName(member.name);
      setCustomerPhone(member.phone);
      setIsVip(true);
      setMemberLevel(member.level);
      setCustomerId(member.id);
    } else {
      setFoundMember(null);
      setIsVip(false);
      setMemberLevel(0);
    }
    setIsSearching(true);
  };

  const handleAddCue = (type: 'standard' | 'professional' | 'carbon') => {
    const existing = selectedCues.find(c => c.type === type);
    if (existing) {
      setSelectedCues(selectedCues.map(c =>
        c.type === type ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      const cueTypeInfo = cueTypes.find(c => c.type === type)!;
      setSelectedCues([...selectedCues, {
        id: generateId(),
        type,
        typeName: cueTypeInfo.name,
        quantity: 1,
        feePerHour: cueTypeInfo.feePerHour,
        totalFee: 0,
      }]);
    }
  };

  const handleRemoveCue = (type: 'standard' | 'professional' | 'carbon') => {
    const existing = selectedCues.find(c => c.type === type);
    if (!existing) return;
    
    if (existing.quantity > 1) {
      setSelectedCues(selectedCues.map(c =>
        c.type === type ? { ...c, quantity: c.quantity - 1 } : c
      ));
    } else {
      setSelectedCues(selectedCues.filter(c => c.type !== type));
    }
  };

  const handleStart = () => {
    if (!table || !customerName || !customerPhone) return;
    
    const session = startSession(
      table.id,
      {
        customerName,
        customerPhone,
        isVip,
        memberLevel,
        customerId: customerId || generateId(),
      },
      selectedCues
    );
    
    if (session) {
      onStart?.();
      onClose();
    }
  };

  const isValid = customerName.trim() && customerPhone.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`开台 - ${table?.name || ''}`}>
      <div className="space-y-5">
        {table && (
          <div className="flex items-center gap-3 p-3 bg-pool-table rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-dark-800/50 flex items-center justify-center text-white font-bold text-lg">
              {table.name}
            </div>
            <div>
              <p className="font-bold text-white">
                {table.type === 'american' ? '美式' : '斯诺克'}球台
              </p>
              <p className="text-xs text-primary-200">准备开台</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-gold-400" />
            会员查询
          </h4>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="输入手机号查询会员"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
              className="flex-1 input"
            />
            <button onClick={handleSearchMember} className="btn-gold px-4">
              查询
            </button>
          </div>
          {isSearching && !foundMember && searchPhone && (
            <p className="text-xs text-accent-400">未找到该会员，将按普通顾客开台</p>
          )}
          {foundMember && (
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 font-bold">{foundMember.levelName}</span>
                <span className="text-xs text-gold-300">
                  折扣 {(1 - foundMember.discountRate) * 100}% OFF
                </span>
              </div>
              <p className="text-sm text-white">
                {foundMember.name} · {foundMember.phone}
              </p>
              <p className="text-xs text-dark-300 mt-1">
                累计消费 ¥{foundMember.totalSpent} · 到店 {foundMember.visits} 次
              </p>
            </div>
          )}
        </div>

        <div className="divider" />

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              顾客姓名 *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="请输入姓名"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">
              联系电话 *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="tel"
                placeholder="请输入手机号"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">球杆租借</h4>
          <div className="grid grid-cols-3 gap-2">
            {cueTypes.map((cue) => {
              const selected = selectedCues.find(c => c.type === cue.type);
              return (
                <div
                  key={cue.type}
                  className={`p-3 rounded-xl border transition-all ${
                    selected
                      ? 'bg-primary-500/10 border-primary-500/50'
                      : 'bg-dark-600/50 border-dark-500/50 hover:border-dark-400'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">{cue.name}</p>
                    <p className="text-xs text-dark-300">¥{cue.feePerHour}/小时</p>
                    {selected ? (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <button
                          onClick={() => handleRemoveCue(cue.type)}
                          className="w-6 h-6 rounded-full bg-dark-500 text-white flex items-center justify-center hover:bg-accent-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-bold w-6 text-center">
                          {selected.quantity}
                        </span>
                        <button
                          onClick={() => handleAddCue(cue.type)}
                          className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddCue(cue.type)}
                        className="mt-2 w-full py-1.5 text-xs bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                      >
                        添加
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedCues.length > 0 && (
          <div className="p-3 bg-dark-600/50 rounded-xl">
            <p className="text-xs text-dark-300 mb-2">已选球杆:</p>
            {selectedCues.map(cue => (
              <div key={cue.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-white">
                  {cue.typeName} × {cue.quantity}
                </span>
                <span className="text-sm text-dark-300">
                  ¥{cue.feePerHour * cue.quantity}/小时
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalActions>
        <button onClick={onClose} className="btn-secondary">
          取消
        </button>
        <button
          onClick={handleStart}
          disabled={!isValid}
          className="btn-primary"
        >
          确认开台
        </button>
      </ModalActions>
    </Modal>
  );
};
