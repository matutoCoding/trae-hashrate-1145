import { RateSchedule, Table, Member, QueueEntry, BillingSession, Bill } from '../types';
import { generateId } from '../utils/time';
import { addHours, addMinutes, subDays } from 'date-fns';

export const defaultRateSchedules: RateSchedule[] = [
  {
    id: generateId(),
    name: '早间特惠',
    period: 'normal',
    startTime: '06:00',
    endTime: '12:00',
    ratePerHour: 28,
    isPeak: false,
    priority: 1,
    enabled: true
  },
  {
    id: generateId(),
    name: '午间平峰',
    period: 'normal',
    startTime: '12:00',
    endTime: '18:00',
    ratePerHour: 38,
    isPeak: false,
    priority: 1,
    enabled: true
  },
  {
    id: generateId(),
    name: '晚间高峰',
    period: 'peak',
    startTime: '18:00',
    endTime: '22:00',
    ratePerHour: 58,
    isPeak: true,
    priority: 2,
    enabled: true
  },
  {
    id: generateId(),
    name: '夜间场',
    period: 'night',
    startTime: '22:00',
    endTime: '06:00',
    ratePerHour: 48,
    isPeak: false,
    priority: 1,
    enabled: true
  }
];

export const defaultTables: Table[] = [
  { id: generateId(), name: 'A1', type: 'american', status: 'available' },
  { id: generateId(), name: 'A2', type: 'american', status: 'available' },
  { id: generateId(), name: 'A3', type: 'american', status: 'available' },
  { id: generateId(), name: 'A4', type: 'american', status: 'available' },
  { id: generateId(), name: 'A5', type: 'american', status: 'available' },
  { id: generateId(), name: 'B1', type: 'snooker', status: 'available' },
  { id: generateId(), name: 'B2', type: 'snooker', status: 'available' },
  { id: generateId(), name: 'B3', type: 'snooker', status: 'available' },
];

export const defaultMembers: Member[] = [
  {
    id: generateId(),
    name: '张三',
    phone: '13800138001',
    level: 5,
    levelName: '钻石会员',
    canQueueJump: true,
    discountRate: 0.8,
    joinDate: subDays(new Date(), 365),
    createdAt: subDays(new Date(), 365),
    totalSpent: 12800,
    visits: 86,
    visitCount: 86,
    isActive: true
  },
  {
    id: generateId(),
    name: '李四',
    phone: '13800138002',
    level: 4,
    levelName: '白金会员',
    canQueueJump: true,
    discountRate: 0.85,
    joinDate: subDays(new Date(), 200),
    createdAt: subDays(new Date(), 200),
    totalSpent: 6800,
    visits: 45,
    visitCount: 45,
    isActive: true
  },
  {
    id: generateId(),
    name: '王五',
    phone: '13800138003',
    level: 3,
    levelName: '黄金会员',
    canQueueJump: true,
    discountRate: 0.9,
    joinDate: subDays(new Date(), 100),
    createdAt: subDays(new Date(), 100),
    totalSpent: 3200,
    visits: 28,
    visitCount: 28,
    isActive: true
  },
  {
    id: generateId(),
    name: '赵六',
    phone: '13800138004',
    level: 2,
    levelName: '白银会员',
    canQueueJump: false,
    discountRate: 0.95,
    joinDate: subDays(new Date(), 50),
    createdAt: subDays(new Date(), 50),
    totalSpent: 1500,
    visits: 15,
    visitCount: 15,
    isActive: true
  },
  {
    id: generateId(),
    name: '钱七',
    phone: '13800138005',
    level: 1,
    levelName: '普通会员',
    canQueueJump: false,
    discountRate: 0.98,
    joinDate: subDays(new Date(), 20),
    createdAt: subDays(new Date(), 20),
    totalSpent: 600,
    visits: 8,
    visitCount: 8,
    isActive: true
  }
];

export const generateMockSessions = (): BillingSession[] => {
  const now = new Date();
  return [
    {
      id: generateId(),
      tableId: defaultTables[0].id,
      tableName: defaultTables[0].name,
      customerId: generateId(),
      customerName: '陈先生',
      customerPhone: '13900139001',
      isVip: false,
      memberLevel: 0,
      startTime: addHours(now, -2),
      status: 'active',
      cueRentals: [
        {
          id: generateId(),
          type: 'standard',
          typeName: '标准球杆',
          quantity: 2,
          feePerHour: 5,
          totalFee: 0
        }
      ]
    },
    {
      id: generateId(),
      tableId: defaultTables[1].id,
      tableName: defaultTables[1].name,
      customerId: defaultMembers[0].id,
      customerName: defaultMembers[0].name,
      customerPhone: defaultMembers[0].phone,
      isVip: true,
      memberLevel: defaultMembers[0].level,
      startTime: addHours(now, -1.5),
      status: 'active',
      cueRentals: [
        {
          id: generateId(),
          type: 'professional',
          typeName: '专业球杆',
          quantity: 1,
          feePerHour: 15,
          totalFee: 0
        }
      ]
    },
    {
      id: generateId(),
      tableId: defaultTables[5].id,
      tableName: defaultTables[5].name,
      customerId: defaultMembers[1].id,
      customerName: defaultMembers[1].name,
      customerPhone: defaultMembers[1].phone,
      isVip: true,
      memberLevel: defaultMembers[1].level,
      startTime: addHours(now, -3),
      status: 'active',
      cueRentals: []
    }
  ];
};

export const generateMockQueue = (): QueueEntry[] => {
  const now = new Date();
  return [
    {
      id: generateId(),
      queueNumber: 101,
      customerName: defaultMembers[2].name,
      customerPhone: defaultMembers[2].phone,
      phone: defaultMembers[2].phone,
      isVip: true,
      memberLevel: defaultMembers[2].level,
      priority: 1000 + 3 * 100,
      tableType: 'american',
      joinTime: addMinutes(now, -15),
      status: 'waiting'
    },
    {
      id: generateId(),
      queueNumber: 102,
      customerName: '周先生',
      customerPhone: '13700137001',
      phone: '13700137001',
      isVip: false,
      memberLevel: 0,
      priority: 0,
      tableType: 'american',
      joinTime: addMinutes(now, -25),
      status: 'waiting'
    },
    {
      id: generateId(),
      queueNumber: 103,
      customerName: '吴女士',
      customerPhone: '13700137002',
      phone: '13700137002',
      isVip: false,
      memberLevel: 0,
      priority: 0,
      tableType: 'any',
      joinTime: addMinutes(now, -10),
      status: 'waiting'
    },
    {
      id: generateId(),
      queueNumber: 104,
      customerName: defaultMembers[3].name,
      customerPhone: defaultMembers[3].phone,
      phone: defaultMembers[3].phone,
      isVip: true,
      memberLevel: defaultMembers[3].level,
      priority: 1000 + 2 * 100,
      tableType: 'snooker',
      joinTime: addMinutes(now, -5),
      status: 'waiting'
    }
  ];
};

export const generateMockBills = (): Bill[] => {
  const now = new Date();
  const yesterday = subDays(now, 1);
  
  const formatTimeStr = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };
  
  return [
    {
      id: generateId(),
      billNo: 'BL' + (Date.now() - 86400000).toString().slice(-8),
      sessionId: generateId(),
      tableName: 'A3',
      customerName: '郑先生',
      customerPhone: '13900139010',
      startTime: addHours(yesterday, 14),
      endTime: addHours(yesterday, 16.5),
      durationMinutes: 150,
      segments: [
        {
          id: generateId(),
          rateId: defaultRateSchedules[1].id,
          rateName: '午间平峰',
          ratePerHour: 38,
          startTime: formatTimeStr(addHours(yesterday, 14)),
          endTime: formatTimeStr(addHours(yesterday, 16.5)),
          durationMinutes: 150,
          amount: 95,
          isPeak: false
        }
      ],
      cueRentals: [
        {
          id: generateId(),
          type: 'standard',
          typeName: '标准球杆',
          quantity: 1,
          feePerHour: 5,
          totalFee: 12.5
        }
      ],
      cueRentalFee: 12.5,
      tableFee: 95,
      totalAmount: 107.5,
      discountAmount: 0,
      isVip: false,
      memberLevel: 0,
      createdAt: yesterday,
      paymentMethod: 'wechat',
      paymentStatus: 'paid'
    },
    {
      id: generateId(),
      billNo: 'BL' + (Date.now() - 86400000 - 1000).toString().slice(-8),
      sessionId: generateId(),
      tableName: 'B2',
      customerName: defaultMembers[0].name,
      customerPhone: defaultMembers[0].phone,
      startTime: addHours(yesterday, 19),
      endTime: addHours(yesterday, 22.5),
      durationMinutes: 210,
      segments: [
        {
          id: generateId(),
          rateId: defaultRateSchedules[2].id,
          rateName: '晚间高峰',
          ratePerHour: 58,
          startTime: formatTimeStr(addHours(yesterday, 19)),
          endTime: formatTimeStr(addHours(yesterday, 22)),
          durationMinutes: 180,
          amount: 174,
          isPeak: true
        },
        {
          id: generateId(),
          rateId: defaultRateSchedules[3].id,
          rateName: '夜间场',
          ratePerHour: 48,
          startTime: formatTimeStr(addHours(yesterday, 22)),
          endTime: formatTimeStr(addHours(yesterday, 22.5)),
          durationMinutes: 30,
          amount: 24,
          isPeak: false
        }
      ],
      cueRentals: [
        {
          id: generateId(),
          type: 'professional',
          typeName: '专业球杆',
          quantity: 1,
          feePerHour: 15,
          totalFee: 37.5
        }
      ],
      cueRentalFee: 37.5,
      tableFee: 198,
      totalAmount: 188.4,
      discountAmount: 47.1,
      isVip: true,
      memberLevel: defaultMembers[0].level,
      createdAt: yesterday,
      paymentMethod: 'alipay',
      paymentStatus: 'paid'
    }
  ];
};

export const cueTypes = [
  { type: 'standard' as const, name: '标准球杆', feePerHour: 5 },
  { type: 'professional' as const, name: '专业球杆', feePerHour: 15 },
  { type: 'carbon' as const, name: '碳素球杆', feePerHour: 25 }
];

export const memberLevelNames: Record<number, string> = {
  0: '非会员',
  1: '普通会员',
  2: '白银会员',
  3: '黄金会员',
  4: '白金会员',
  5: '钻石会员'
};

export const memberDiscountRates: Record<number, number> = {
  0: 1,
  1: 0.98,
  2: 0.95,
  3: 0.9,
  4: 0.85,
  5: 0.8
};

export const memberLevelDiscounts: Record<number, number> = memberDiscountRates;
