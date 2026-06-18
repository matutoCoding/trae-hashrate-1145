import { create } from 'zustand';
import { QueueEntry, QueueTableType, Member } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { generateMockQueue } from '../data/mockData';
import { generateId, calculateDuration } from '../utils/time';
import { differenceInMinutes } from 'date-fns';
import { useMemberStore } from './memberStore';

interface QueueState {
  entries: QueueEntry[];
  queueCounter: number;
  currentCall: QueueEntry | null;
  isInitialized: boolean;
  
  init: () => void;
  
  calculatePriority: (isVip: boolean, memberLevel: number, joinTime: Date) => number;
  
  addToQueue: (customerInfo: {
    customerName: string;
    customerPhone: string;
    phone: string;
    isVip: boolean;
    memberLevel: number;
    tableType: QueueTableType;
    note?: string;
  }) => QueueEntry;
  
  removeFromQueue: (entryId: string) => void;
  
  callNext: (tableType?: 'american' | 'snooker') => QueueEntry | null;
  
  callSpecific: (entryId: string) => QueueEntry | null;
  
  markCompleted: (entryId: string) => void;
  
  markCancelled: (entryId: string) => void;
  
  cancelEntry: (entryId: string) => void;
  
  markArrived: (entryId: string) => void;
  
  getWaitingQueue: () => QueueEntry[];
  
  getSortedQueue: () => QueueEntry[];
  
  getVipQueue: () => QueueEntry[];
  
  getNormalQueue: () => QueueEntry[];
  
  getEstimatedWaitTime: (entry: QueueEntry) => number;
  
  findMemberByPhone: (phone: string) => Member | undefined;
  
  refreshPriorities: () => void;
  
  insertWithPriority: (entries: QueueEntry[], newEntry: QueueEntry) => QueueEntry[];
}

export const useQueueStore = create<QueueState>((set, get) => ({
  entries: [],
  queueCounter: 100,
  currentCall: null,
  isInitialized: false,
  
  init: () => {
    if (get().isInitialized) return;
    
    const storedEntries = loadFromStorage<QueueEntry[]>(STORAGE_KEYS.QUEUE, []);
    const storedCounter = loadFromStorage<number>(STORAGE_KEYS.QUEUE_COUNTER, 100);
    
    const entries = storedEntries.length > 0 ? storedEntries : generateMockQueue();
    
    set({
      entries,
      queueCounter: storedCounter,
      isInitialized: true
    });
    
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
    saveToStorage(STORAGE_KEYS.QUEUE_COUNTER, storedCounter);
  },
  
  calculatePriority: (isVip, memberLevel, joinTime) => {
    const waitMinutes = differenceInMinutes(new Date(), joinTime);
    const vipBase = isVip ? 1000 : 0;
    const levelBonus = memberLevel * 100;
    const waitBonus = waitMinutes * 0.5;
    return vipBase + levelBonus + waitBonus;
  },
  
  addToQueue: (customerInfo) => {
    const now = new Date();
    const { isVip, memberLevel, phone, customerPhone } = customerInfo;
    const priority = get().calculatePriority(isVip, memberLevel, now);
    
    const entry: QueueEntry = {
      id: generateId(),
      queueNumber: get().queueCounter + 1,
      ...customerInfo,
      customerPhone: customerPhone || phone,
      phone: phone || customerPhone,
      priority,
      joinTime: now,
      status: 'waiting'
    };
    
    let entries = [...get().entries, entry];
    
    if (isVip && memberLevel >= 3) {
      entries = get().insertWithPriority(entries, entry);
    }
    
    const queueCounter = entry.queueNumber;
    
    set({ entries, queueCounter });
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
    saveToStorage(STORAGE_KEYS.QUEUE_COUNTER, queueCounter);
    
    return entry;
  },
  
  removeFromQueue: (entryId) => {
    const entries = get().entries.filter(e => e.id !== entryId);
    set({ entries });
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
  },
  
  callNext: (tableType) => {
    const waitingEntries = get().getSortedQueue().filter(e => e.status === 'waiting');
    
    let eligibleEntries = waitingEntries;
    if (tableType) {
      eligibleEntries = waitingEntries.filter(e => 
        e.tableType === tableType || e.tableType === 'any'
      );
    }
    
    if (eligibleEntries.length === 0) return null;
    
    const nextEntry = eligibleEntries[0];
    return get().callSpecific(nextEntry.id);
  },
  
  callSpecific: (entryId) => {
    const now = new Date();
    const entries = get().entries.map(e =>
      e.id === entryId
        ? { ...e, status: 'called' as const, calledTime: now }
        : e
    );
    
    const calledEntry = entries.find(e => e.id === entryId)!;
    
    set({ entries, currentCall: calledEntry });
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
    
    return calledEntry;
  },
  
  markCompleted: (entryId) => {
    const entries = get().entries.map(e =>
      e.id === entryId
        ? { ...e, status: 'completed' as const, completedTime: new Date() }
        : e
    );
    
    set({ 
      entries, 
      currentCall: get().currentCall?.id === entryId ? null : get().currentCall 
    });
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
  },
  
  markCancelled: (entryId) => {
    const entries = get().entries.map(e =>
      e.id === entryId
        ? { ...e, status: 'cancelled' as const }
        : e
    );
    
    set({ 
      entries,
      currentCall: get().currentCall?.id === entryId ? null : get().currentCall
    });
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
  },
  
  cancelEntry: (entryId) => {
    get().markCancelled(entryId);
  },
  
  markArrived: (entryId) => {
    const entries = get().entries.map(e =>
      e.id === entryId
        ? { ...e, status: 'completed' as const, completedTime: new Date() }
        : e
    );
    
    set({ 
      entries, 
      currentCall: get().currentCall?.id === entryId ? null : get().currentCall 
    });
    saveToStorage(STORAGE_KEYS.QUEUE, entries);
  },
  
  getWaitingQueue: () => {
    return get().entries
      .filter(e => e.status === 'waiting')
      .map(e => ({
        ...e,
        priority: get().calculatePriority(e.isVip, e.memberLevel, e.joinTime),
      }))
      .sort((a, b) => b.priority - a.priority || a.joinTime.getTime() - b.joinTime.getTime());
  },
  
  getSortedQueue: () => {
    return get().entries
      .filter(e => e.status === 'waiting' || e.status === 'called')
      .map(e => ({
        ...e,
        priority: get().calculatePriority(e.isVip, e.memberLevel, e.joinTime),
      }))
      .sort((a, b) => {
        if (a.status === 'called' && b.status !== 'called') return -1;
        if (b.status === 'called' && a.status !== 'called') return 1;
        return b.priority - a.priority || a.joinTime.getTime() - b.joinTime.getTime();
      });
  },
  
  getVipQueue: () => {
    return get().getSortedQueue().filter(e => e.isVip);
  },
  
  getNormalQueue: () => {
    return get().getSortedQueue().filter(e => !e.isVip);
  },
  
  getEstimatedWaitTime: (entry) => {
    const sortedQueue = get().getSortedQueue();
    const position = sortedQueue.findIndex(e => e.id === entry.id);
    if (position === -1) return 0;
    
    const averageSessionMinutes = 90;
    const availableTables = 5;
    const tablesPerPosition = Math.ceil(position / availableTables);
    
    return tablesPerPosition * averageSessionMinutes;
  },
  
  findMemberByPhone: (phone) => {
    return useMemberStore.getState().findMemberByPhone(phone);
  },
  
  refreshPriorities: () => {
    const now = new Date();
    const entries = get().entries.map(e => {
      if (e.status !== 'waiting') return e;
      const newPriority = get().calculatePriority(e.isVip, e.memberLevel, e.joinTime);
      return { ...e, priority: newPriority };
    });
    
    const hasChanges = entries.some((e, i) => e.priority !== get().entries[i]?.priority);
    if (hasChanges) {
      set({ entries });
      saveToStorage(STORAGE_KEYS.QUEUE, entries);
    }
  },
  
  insertWithPriority: (entries, newEntry) => {
    const result = [...entries.filter(e => e.id !== newEntry.id)];
    
    let insertIndex = result.findIndex(e => 
      e.status === 'waiting' && e.priority < newEntry.priority
    );
    
    if (insertIndex === -1) {
      insertIndex = result.length;
    }
    
    result.splice(insertIndex, 0, newEntry);
    return result;
  }
}));
