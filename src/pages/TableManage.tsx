import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { TableCard } from '../components/features/TableCard';
import { StartSessionModal } from '../components/features/StartSessionModal';
import { CheckoutModal } from '../components/features/CheckoutModal';
import { useBillingStore } from '../stores/billingStore';
import { Table, BillingSession, Bill } from '../types';
import { Filter, Table2, Club, Play, Settings } from 'lucide-react';

type TableFilter = 'all' | 'available' | 'occupied' | 'american' | 'snooker';

export const TableManage: React.FC = () => {
  const { tables, sessions, getActiveSessionByTableId, init } = useBillingStore();
  const [filter, setFilter] = useState<TableFilter>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedSession, setSelectedSession] = useState<BillingSession | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const filteredTables = tables.filter(table => {
    switch (filter) {
      case 'available':
        return table.status === 'available';
      case 'occupied':
        return table.status === 'occupied';
      case 'american':
        return table.type === 'american';
      case 'snooker':
        return table.type === 'snooker';
      default:
        return true;
    }
  });

  const filters = [
    { id: 'all' as const, label: '全部', icon: Filter },
    { id: 'available' as const, label: '空闲', icon: Play },
    { id: 'occupied' as const, label: '使用中', icon: Settings },
    { id: 'american' as const, label: '美式', icon: Table2 },
    { id: 'snooker' as const, label: '斯诺克', icon: Club },
  ];

  const handleOpenTable = (table: Table) => {
    setSelectedTable(table);
    setShowStartModal(true);
  };

  const handleCloseTable = (table: Table) => {
    const session = getActiveSessionByTableId(table.id);
    if (session) {
      setSelectedSession(session);
      setShowCheckoutModal(true);
    }
  };

  const handleCheckoutComplete = (bill: Bill) => {
    setShowCheckoutModal(false);
    setSelectedSession(null);
  };

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="min-h-screen pb-24">
      <Header title="球台管理" />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-dark-300">空闲球台</p>
              <p className="text-xl font-bold text-primary-400 font-mono">{availableCount}</p>
            </div>
          </div>
          <div className="flex-1 card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-xs text-dark-300">使用中</p>
              <p className="text-xl font-bold text-accent-400 font-mono">{occupiedCount}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTables.map((table, index) => (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <TableCard
                  table={table}
                  onOpen={() => handleOpenTable(table)}
                  onClose={() => handleCloseTable(table)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTables.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
                <Table2 className="w-8 h-8 text-dark-400" />
              </div>
              <p className="text-dark-400">暂无符合条件的球台</p>
            </motion.div>
          )}
        </div>
      </main>

      <StartSessionModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        table={selectedTable}
        onStart={() => {
          setSelectedTable(null);
        }}
      />

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onComplete={handleCheckoutComplete}
      />

      <BottomNav />
    </div>
  );
};
