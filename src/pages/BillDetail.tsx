import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Modal } from '../components/ui/Modal';
import { useBillingStore } from '../stores/billingStore';
import { Bill } from '../types';
import { FileText, Clock, Table2, Crown, DollarSign, Calendar, ChevronDown, Search, Filter, ArrowLeft, ArrowRight, Receipt, Percent, Download, Share2, User } from 'lucide-react';
import { formatDateTime, formatDuration } from '../utils/time';
import { memberLevelNames, memberLevelDiscounts } from '../data/mockData';

export const BillDetail: React.FC = () => {
  const { bills, init } = useBillingStore();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filteredBills = bills
    .filter(bill => {
      if (filter === 'today' && bill.createdAt < todayStart) return false;
      if (filter === 'week' && bill.createdAt < weekStart) return false;
      return true;
    })
    .filter(bill =>
      bill.customerName.includes(searchQuery) ||
      bill.billNo.includes(searchQuery) ||
      bill.tableName.includes(searchQuery)
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const totalRevenue = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTableFee = filteredBills.reduce((sum, b) => sum + b.tableFee, 0);
  const totalCueFee = filteredBills.reduce((sum, b) => sum + b.cueRentalFee, 0);
  const totalDiscount = filteredBills.reduce((sum, b) => sum + b.discountAmount, 0);

  const filterOptions = [
    { id: 'all' as const, label: '全部', count: bills.length },
    { id: 'today' as const, label: '今日', count: bills.filter(b => b.createdAt >= todayStart).length },
    { id: 'week' as const, label: '本周', count: bills.filter(b => b.createdAt >= weekStart).length },
  ];

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

  const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      wechat: '微信支付',
      alipay: '支付宝',
      cash: '现金',
      card: '银行卡',
    };
    return map[method] || method;
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="账单管理" />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="text-xs text-dark-300 mb-1">订单总数</p>
              <p className="text-2xl font-bold text-white font-mono">{filteredBills.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-300 mb-1">总营收</p>
              <p className="text-2xl font-bold text-gold-400 font-mono">¥{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-300 mb-1">台费收入</p>
              <p className="text-lg font-bold text-primary-400 font-mono">¥{totalTableFee.toFixed(2)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-dark-300 mb-1">优惠减免</p>
              <p className="text-lg font-bold text-accent-400 font-mono">-¥{totalDiscount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {filterOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  filter === option.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {option.label}
                <span className={`text-xs ${
                  filter === option.id ? 'text-white/70' : 'text-dark-400'
                }`}>
                  ({option.count})
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索账单号、姓名、球台号"
              className="input pl-9"
            />
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredBills.map(bill => (
                <motion.div
                  key={bill.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  onClick={() => {
                    setSelectedBill(bill);
                    setShowDetail(true);
                  }}
                  className="card p-4 cursor-pointer hover:bg-dark-600/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-6 h-6 text-primary-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-dark-300">
                            {bill.billNo}
                          </span>
                          {bill.isVip && (
                            <Crown className="w-3.5 h-3.5 text-gold-400" />
                          )}
                        </div>
                        <span className="text-lg font-bold text-gold-400 font-mono">
                          ¥{bill.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{bill.customerName}</span>
                        <span className="text-dark-500">·</span>
                        <span className="text-dark-300 text-sm flex items-center gap-1">
                          <Table2 className="w-3 h-3" />
                          {bill.tableName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-dark-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(bill.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(bill.durationMinutes * 60 * 1000)}
                        </span>
                      </div>
                    </div>

                    <ChevronDown className={`w-5 h-5 text-dark-500 transition-transform flex-shrink-0 ${
                      selectedBill?.id === bill.id && showDetail ? 'rotate-180' : ''
                    }`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredBills.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-dark-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {searchQuery ? '未找到账单' : '暂无账单记录'}
                </h3>
                <p className="text-dark-400 text-sm">
                  {searchQuery ? '请尝试其他搜索关键词' : '完成消费后账单将显示在这里'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="账单详情"
      >
        {selectedBill && (
          <div className="space-y-4 pb-4">
            <div className="text-center py-4 bg-gradient-to-b from-primary-700/30 to-transparent rounded-2xl -mx-4 -mt-4 mb-4 border-b border-dark-600">
              <div className="text-sm text-dark-400 mb-1">应付金额</div>
              <div className="text-5xl font-bold text-gold-400 font-mono mb-2">
                ¥{selectedBill.totalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-dark-400">
                订单号：{selectedBill.billNo}
              </div>
            </div>

            <div className="card p-4">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-400" />
                顾客信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-300">姓名</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {selectedBill.customerName}
                    {selectedBill.isVip && (
                      <>
                        <Crown className="w-3 h-3 text-gold-400" />
                        <span className="text-gold-400 text-xs">
                          {memberLevelNames[selectedBill.memberLevel || 0]}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">球台</span>
                  <span className="text-white">{selectedBill.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">开台时间</span>
                  <span className="text-white font-mono">
                    {formatDateTime(selectedBill.startTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">结账时间</span>
                  <span className="text-white font-mono">
                    {formatDateTime(selectedBill.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">消费时长</span>
                  <span className="text-white font-mono">
                    {formatDuration(selectedBill.durationMinutes * 60 * 1000)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                分段计费明细
              </h4>
              <div className="space-y-2">
                {selectedBill.segments.map((segment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${
                        segment.isPeak ? 'bg-accent-500' : 'bg-primary-500'
                      }`} />
                      <div>
                        <div className="text-white font-medium text-sm">
                          {segment.rateName}
                          {segment.isPeak && (
                            <span className="ml-1 text-xs text-accent-400">(高峰)</span>
                          )}
                        </div>
                        <div className="text-xs text-dark-400 font-mono">
                          {segment.startTime} - {segment.endTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-mono font-bold">
                        ¥{segment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-dark-400">
                        {segment.durationMinutes}分钟 × ¥{segment.ratePerHour}/时
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedBill.cueRentals.length > 0 && (
              <div className="card p-4">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">🏑</span>
                  球杆租借
                </h4>
                <div className="space-y-2">
                  {selectedBill.cueRentals.map((rental, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-dark-600/30 rounded-lg">
                      <span className="text-white text-sm">{rental.typeName} × {rental.quantity}</span>
                      <span className="text-gold-400 font-mono">¥{rental.totalFee.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-4 bg-gradient-to-br from-dark-600/50 to-dark-700/50">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gold-400" />
                费用合计
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-300">台费小计</span>
                  <span className="text-white font-mono">¥{selectedBill.tableFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">球杆租借费</span>
                  <span className="text-white font-mono">¥{selectedBill.cueRentalFee.toFixed(2)}</span>
                </div>
                {selectedBill.discountAmount > 0 && (
                  <div className="flex justify-between text-accent-400">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      VIP折扣 ({(memberLevelDiscounts[selectedBill.memberLevel || 0] * 100).toFixed(0)}%)
                    </span>
                    <span className="font-mono">-¥{selectedBill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-dark-600 flex justify-between">
                  <span className="text-white font-bold">应付金额</span>
                  <span className="text-2xl text-gold-400 font-bold font-mono">
                    ¥{selectedBill.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex justify-between items-center">
                <span className="text-dark-300">支付方式</span>
                <span className="text-white font-medium">
                  {getPaymentMethodLabel(selectedBill.paymentMethod)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDetail(false)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </button>
            </div>
          </div>
        )}
      </Modal>

      <BottomNav />
    </div>
  );
};
