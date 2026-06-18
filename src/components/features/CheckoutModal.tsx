import React, { useState, useEffect } from 'react';
import { Modal, ModalActions } from '../ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { useBillingStore } from '../../stores/billingStore';
import { useMemberStore } from '../../stores/memberStore';
import { Bill, BillingSession } from '../../types';
import { formatDateTime, formatDuration, formatTime, generateId } from '../../utils/time';
import { Crown, Clock, Receipt, CreditCard, Smartphone, Banknote, CheckCircle, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: BillingSession | null;
  onComplete?: (bill: Bill) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  session,
  onComplete,
}) => {
  const { generateBill, endSession } = useBillingStore();
  const { updateMemberSpending } = useMemberStore();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wechat' | 'alipay' | 'card'>('wechat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isOpen && session) {
      const generatedBill = generateBill(session, new Date());
      setBill(generatedBill);
      setIsComplete(false);
      setIsProcessing(false);
    }
  }, [isOpen, session, generateBill]);

  const handlePayment = async () => {
    if (!session || !bill) return;
    
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedBill = {
      ...bill,
      paymentMethod,
      paymentStatus: 'paid' as const,
    };
    
    endSession(session.id);
    
    if (session.isVip && session.customerId) {
      updateMemberSpending(session.customerId, bill.totalAmount);
    }
    
    setIsProcessing(false);
    setIsComplete(true);
    
    setTimeout(() => {
      onComplete?.(updatedBill);
      onClose();
    }, 2000);
  };

  const paymentMethods = [
    { id: 'wechat' as const, name: '微信支付', icon: Smartphone, color: 'text-green-400' },
    { id: 'alipay' as const, name: '支付宝', icon: CreditCard, color: 'text-blue-400' },
    { id: 'cash' as const, name: '现金', icon: Banknote, color: 'text-gold-400' },
    { id: 'card' as const, name: '银行卡', icon: CreditCard, color: 'text-purple-400' },
  ];

  if (!bill) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="结账详情" maxWidth="max-w-lg">
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div className="bg-pool-table rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{bill.tableName}</h3>
                    <p className="text-xs text-primary-200">{bill.customerName}</p>
                  </div>
                  {session?.isVip && (
                    <div className="flex items-center gap-1 bg-gold-500/20 px-2 py-1 rounded-lg">
                      <Crown className="w-3 h-3 text-gold-400" />
                      <span className="text-xs text-gold-400 font-medium">VIP</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-primary-200">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(bill.startTime)} - {formatTime(bill.endTime)}</span>
                  </div>
                  <span>{formatDuration(bill.durationMinutes * 60 * 1000)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary-400" />
                  分段计费明细
                </h4>
                <div className="space-y-2">
                  {bill.segments.map((segment, index) => (
                    <motion.div
                      key={segment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{segment.rateName}</p>
                        <p className="text-xs text-dark-300">
                          {segment.startTime} - {segment.endTime}
                          <span className="ml-2">({formatDuration(segment.durationMinutes * 60 * 1000)})</span>
                        </p>
                        <p className="text-xs text-dark-400">
                          ¥{segment.ratePerHour}/小时 × {(segment.durationMinutes / 60).toFixed(1)}小时
                        </p>
                      </div>
                      <span className="font-mono font-bold text-white">
                        ¥{segment.amount.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {bill.cueRentalFee > 0 && (
                <div className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg">
                  <div>
                    <p className="text-sm text-white font-medium">球杆租借</p>
                    <p className="text-xs text-dark-400">{session?.cueRentals.length} 件</p>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ¥{bill.cueRentalFee.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="divider" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-300">台费小计</span>
                  <span className="text-white font-mono">¥{bill.tableFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-300">球杆租借</span>
                  <span className="text-white font-mono">¥{bill.cueRentalFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-300">合计</span>
                  <span className="text-white font-mono">¥{(bill.tableFee + bill.cueRentalFee).toFixed(2)}</span>
                </div>
                {bill.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gold-400 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      VIP折扣
                    </span>
                    <span className="text-gold-400 font-mono">-¥{bill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-dark-500">
                  <span className="text-lg font-bold text-white">应付金额</span>
                  <span className="text-2xl font-bold text-gold-400 font-mono">
                    ¥{bill.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">选择支付方式</h4>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border transition-all ${
                        paymentMethod === method.id
                          ? 'bg-primary-500/10 border-primary-500'
                          : 'bg-dark-600/50 border-dark-500 hover:border-dark-400'
                      }`}
                    >
                      <method.icon className={`w-5 h-5 mx-auto mb-1 ${method.color}`} />
                      <p className="text-[10px] text-dark-200 text-center">{method.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-primary-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">支付成功</h3>
              <p className="text-dark-300 mb-4">
                {paymentMethods.find(m => m.id === paymentMethod)?.name}
              </p>
              <div className="text-3xl font-bold text-gold-400 font-mono">
                ¥{bill.totalAmount.toFixed(2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isComplete && (
        <ModalActions>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="btn-gold"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                处理中...
              </>
            ) : (
              <>
                确认支付
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </ModalActions>
      )}
    </Modal>
  );
};
