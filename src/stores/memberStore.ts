import { create } from 'zustand';
import { Member } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { defaultMembers, memberLevelNames, memberDiscountRates } from '../data/mockData';
import { generateId } from '../utils/time';

interface MemberState {
  members: Member[];
  isInitialized: boolean;
  
  init: () => void;
  
  addMember: (member: Omit<Member, 'id' | 'joinDate' | 'createdAt' | 'totalSpent' | 'visits' | 'visitCount' | 'isActive' | 'levelName' | 'canQueueJump' | 'discountRate'>) => Member;
  
  updateMember: (id: string, updates: Partial<Member>) => void;
  
  deleteMember: (id: string) => void;
  
  removeMember: (id: string) => void;
  
  findMemberByPhone: (phone: string) => Member | undefined;
  
  findMemberById: (id: string) => Member | undefined;
  
  updateMemberSpending: (id: string, amount: number) => void;
  
  getActiveMembers: () => Member[];
  
  getMemberLevelName: (level: number) => string;
  getMemberDiscountRate: (level: number) => number;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  isInitialized: false,
  
  init: () => {
    if (get().isInitialized) return;
    
    const storedMembers = loadFromStorage<Member[]>(STORAGE_KEYS.MEMBERS, []);
    const members = storedMembers.length > 0 ? storedMembers : defaultMembers;
    
    set({ members, isInitialized: true });
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
  },
  
  addMember: (memberData) => {
    const now = new Date();
    const newMember: Member = {
      id: generateId(),
      ...memberData,
      levelName: memberLevelNames[memberData.level] || '普通会员',
      discountRate: memberDiscountRates[memberData.level] || 0.98,
      canQueueJump: memberData.level >= 2,
      joinDate: now,
      createdAt: now,
      totalSpent: 0,
      visits: 0,
      visitCount: 0,
      isActive: true
    };
    
    const members = [...get().members, newMember];
    set({ members });
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    
    return newMember;
  },
  
  updateMember: (id, updates) => {
    const members = get().members.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, ...updates };
      if (updates.level) {
        updated.levelName = memberLevelNames[updates.level] || m.levelName;
        updated.discountRate = memberDiscountRates[updates.level] || m.discountRate;
      }
      return updated;
    });
    
    set({ members });
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
  },
  
  deleteMember: (id) => {
    const members = get().members.filter(m => m.id !== id);
    set({ members });
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
  },
  
  removeMember: (id) => {
    get().deleteMember(id);
  },
  
  findMemberByPhone: (phone) => {
    return get().members.find(m => m.phone === phone && m.isActive);
  },
  
  findMemberById: (id) => {
    return get().members.find(m => m.id === id);
  },
  
  updateMemberSpending: (id, amount) => {
    const members = get().members.map(m =>
      m.id === id
        ? {
            ...m,
            totalSpent: m.totalSpent + amount,
            visits: m.visits + 1
          }
        : m
    );
    
    set({ members });
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
  },
  
  getActiveMembers: () => {
    return get().members.filter(m => m.isActive).sort((a, b) => b.level - a.level);
  },
  
  getMemberLevelName: (level) => memberLevelNames[level] || '非会员',
  getMemberDiscountRate: (level) => memberDiscountRates[level] || 1
}));
