import { create } from 'zustand';
import { RateSchedule, Table, BillingSession, Bill, CueRental, BillSegment } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { defaultRateSchedules, defaultTables, generateMockSessions, generateMockBills, memberDiscountRates, cueTypes } from '../data/mockData';
import { generateId, calculateDuration } from '../utils/time';
import { calculateBillingSegments, calculateTotalCueRental, roundUpToNearestMinute } from '../utils/billing';

interface BillingState {
  rates: RateSchedule[];
  tables: Table[];
  sessions: BillingSession[];
  bills: Bill[];
  isInitialized: boolean;
  
  init: () => void;
  
  addRate: (rate: Omit<RateSchedule, 'id'>) => void;
  updateRate: (id: string, updates: Partial<RateSchedule>) => void;
  deleteRate: (id: string) => void;
  updateRates: (newRates: RateSchedule[]) => void;
  
  updateTable: (id: string, updates: Partial<Table>) => void;
  getTableById: (id: string) => Table | undefined;
  getAvailableTables: (type?: 'american' | 'snooker') => Table[];
  
  startSession: (tableId: string, customerInfo: {
    customerName: string;
    customerPhone: string;
    isVip: boolean;
    memberLevel: number;
    customerId: string;
  }, cueRentals?: CueRental[]) => BillingSession | null;
  
  endSession: (sessionId: string) => Bill | null;
  
  addCueRental: (sessionId: string, cueType: 'standard' | 'professional' | 'carbon', quantity: number) => void;
  removeCueRental: (sessionId: string, rentalId: string) => void;
  
  getActiveSessionByTableId: (tableId: string) => BillingSession | undefined;
  getSessionById: (sessionId: string) => BillingSession | undefined;
  getBillById: (billId: string) => Bill | undefined;
  
  generateBill: (session: BillingSession, endTime: Date) => Bill;
  
  todayStats: {
    revenue: number;
    billsCount: number;
    occupiedTables: number;
    availableTables: number;
  };
}

export const useBillingStore = create<BillingState>((set, get) => ({
  rates: [],
  tables: [],
  sessions: [],
  bills: [],
  isInitialized: false,
  
  init: () => {
    if (get().isInitialized) return;
    
    const storedRates = loadFromStorage<RateSchedule[]>(STORAGE_KEYS.RATES, []);
    const storedTables = loadFromStorage<Table[]>(STORAGE_KEYS.TABLES, []);
    const storedSessions = loadFromStorage<BillingSession[]>(STORAGE_KEYS.SESSIONS, []);
    const storedBills = loadFromStorage<Bill[]>(STORAGE_KEYS.BILLS, []);
    
    const rates = storedRates.length > 0 ? storedRates : defaultRateSchedules;
    const tables = storedTables.length > 0 ? storedTables : defaultTables;
    const sessions = storedSessions.length > 0 ? storedSessions : generateMockSessions();
    const bills = storedBills.length > 0 ? storedBills : generateMockBills();
    
    const activeSessionIds = sessions.filter(s => s.status === 'active').map(s => s.id);
    const updatedTables = tables.map(table => {
      const activeSession = sessions.find(s => s.status === 'active' && s.tableId === table.id);
      return {
        ...table,
        status: activeSession ? 'occupied' as const : table.status === 'occupied' ? 'available' as const : table.status,
        currentSessionId: activeSession?.id
      };
    });
    
    set({
      rates,
      tables: updatedTables,
      sessions,
      bills,
      isInitialized: true
    });
    
    saveToStorage(STORAGE_KEYS.RATES, rates);
    saveToStorage(STORAGE_KEYS.TABLES, updatedTables);
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    saveToStorage(STORAGE_KEYS.BILLS, bills);
  },
  
  addRate: (rate) => {
    const newRate = { ...rate, id: generateId() };
    const rates = [...get().rates, newRate];
    set({ rates });
    saveToStorage(STORAGE_KEYS.RATES, rates);
  },
  
  updateRate: (id, updates) => {
    const rates = get().rates.map(r => r.id === id ? { ...r, ...updates } : r);
    set({ rates });
    saveToStorage(STORAGE_KEYS.RATES, rates);
  },
  
  deleteRate: (id) => {
    const rates = get().rates.filter(r => r.id !== id);
    set({ rates });
    saveToStorage(STORAGE_KEYS.RATES, rates);
  },
  
  updateRates: (newRates) => {
    set({ rates: newRates });
    saveToStorage(STORAGE_KEYS.RATES, newRates);
  },
  
  updateTable: (id, updates) => {
    const tables = get().tables.map(t => t.id === id ? { ...t, ...updates } : t);
    set({ tables });
    saveToStorage(STORAGE_KEYS.TABLES, tables);
  },
  
  getTableById: (id) => get().tables.find(t => t.id === id),
  
  getAvailableTables: (type) => {
    return get().tables.filter(t => 
      t.status === 'available' && (!type || t.type === type)
    );
  },
  
  startSession: (tableId, customerInfo, cueRentals = []) => {
    const table = get().getTableById(tableId);
    if (!table || table.status !== 'available') return null;
    
    const session: BillingSession = {
      id: generateId(),
      tableId,
      tableName: table.name,
      ...customerInfo,
      startTime: roundUpToNearestMinute(new Date()),
      status: 'active',
      cueRentals: cueRentals.map(cr => ({ ...cr, id: generateId() }))
    };
    
    const sessions = [...get().sessions, session];
    const tables = get().tables.map(t => 
      t.id === tableId 
        ? { ...t, status: 'occupied' as const, currentSessionId: session.id }
        : t
    );
    
    set({ sessions, tables });
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    saveToStorage(STORAGE_KEYS.TABLES, tables);
    
    return session;
  },
  
  endSession: (sessionId) => {
    const session = get().getSessionById(sessionId);
    if (!session || session.status !== 'active') return null;
    
    const endTime = roundUpToNearestMinute(new Date());
    const bill = get().generateBill(session, endTime);
    
    const sessions = get().sessions.map(s =>
      s.id === sessionId
        ? { ...s, status: 'completed' as const, endTime }
        : s
    );
    
    const tables = get().tables.map(t =>
      t.currentSessionId === sessionId
        ? { ...t, status: 'available' as const, currentSessionId: undefined }
        : t
    );
    
    const bills = [bill, ...get().bills];
    
    set({ sessions, tables, bills });
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    saveToStorage(STORAGE_KEYS.TABLES, tables);
    saveToStorage(STORAGE_KEYS.BILLS, bills);
    
    return bill;
  },
  
  addCueRental: (sessionId, cueType, quantity) => {
    const cueTypeInfo = cueTypes.find(c => c.type === cueType);
    if (!cueTypeInfo) return;
    
    const rental: CueRental = {
      id: generateId(),
      type: cueType,
      typeName: cueTypeInfo.name,
      quantity,
      feePerHour: cueTypeInfo.feePerHour,
      totalFee: 0
    };
    
    const sessions = get().sessions.map(s =>
      s.id === sessionId
        ? { ...s, cueRentals: [...s.cueRentals, rental] }
        : s
    );
    
    set({ sessions });
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  },
  
  removeCueRental: (sessionId, rentalId) => {
    const sessions = get().sessions.map(s =>
      s.id === sessionId
        ? { ...s, cueRentals: s.cueRentals.filter(r => r.id !== rentalId) }
        : s
    );
    
    set({ sessions });
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  },
  
  getActiveSessionByTableId: (tableId) => {
    return get().sessions.find(s => s.tableId === tableId && s.status === 'active');
  },
  
  getSessionById: (sessionId) => {
    return get().sessions.find(s => s.id === sessionId);
  },
  
  getBillById: (billId) => {
    return get().bills.find(b => b.id === billId);
  },
  
  generateBill: (session, endTime) => {
    const { rates } = get();
    const billingResult = calculateBillingSegments(session.startTime, endTime, rates);
    const cueRentalFee = calculateTotalCueRental(session.cueRentals, billingResult.totalDuration);
    const tableFee = billingResult.totalAmount;
    const subTotal = tableFee + cueRentalFee;
    
    const discountRate = memberDiscountRates[session.memberLevel] || 1;
    const discountAmount = session.isVip ? subTotal * (1 - discountRate) : 0;
    const totalAmount = subTotal - discountAmount;
    
    const billNo = 'BL' + Date.now().toString().slice(-8);
    
    const cueRentalsWithFee = session.cueRentals.map(cr => ({
      ...cr,
      totalFee: calculateTotalCueRental([cr], billingResult.totalDuration)
    }));
    
    return {
      id: generateId(),
      billNo,
      sessionId: session.id,
      tableName: session.tableName,
      customerName: session.customerName,
      customerPhone: session.customerPhone,
      startTime: session.startTime,
      endTime,
      durationMinutes: billingResult.totalDuration,
      segments: billingResult.segments,
      cueRentals: cueRentalsWithFee,
      cueRentalFee: Math.round(cueRentalFee * 100) / 100,
      tableFee,
      totalAmount: Math.round(totalAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      isVip: session.isVip,
      memberLevel: session.memberLevel,
      createdAt: new Date(),
      paymentStatus: 'pending' as const
    };
  },
  
  get todayStats() {
    const { tables, bills, sessions } = get();
    const today = new Date().toDateString();
    
    const todayBills = bills.filter(b => 
      new Date(b.createdAt).toDateString() === today && b.paymentStatus === 'paid'
    );
    
    const revenue = todayBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    
    return {
      revenue: Math.round(revenue * 100) / 100,
      billsCount: todayBills.length,
      occupiedTables,
      availableTables
    };
  }
}));
