export type RatePeriod = 'peak' | 'normal' | 'night';

export interface RateSchedule {
  id: string;
  name: string;
  period: RatePeriod;
  startTime: string;
  endTime: string;
  ratePerHour: number;
  isPeak: boolean;
  priority: number;
  enabled: boolean;
}

export type TableType = 'american' | 'snooker';
export type TableStatus = 'available' | 'occupied' | 'maintenance';

export interface Table {
  id: string;
  name: string;
  type: TableType;
  status: TableStatus;
  currentSessionId?: string;
}

export type CueType = 'standard' | 'professional' | 'carbon';

export interface CueRental {
  id: string;
  type: CueType;
  typeName: string;
  quantity: number;
  feePerHour: number;
  totalFee: number;
}

export interface BillingSession {
  id: string;
  tableId: string;
  tableName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  isVip: boolean;
  memberLevel: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed';
  cueRentals: CueRental[];
}

export interface BillSegment {
  id: string;
  rateId: string;
  rateName: string;
  ratePerHour: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  amount: number;
  isPeak: boolean;
}

export interface Bill {
  id: string;
  billNo: string;
  sessionId: string;
  tableName: string;
  customerName: string;
  customerPhone: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  segments: BillSegment[];
  cueRentals: CueRental[];
  cueRentalFee: number;
  tableFee: number;
  totalAmount: number;
  discountAmount: number;
  isVip: boolean;
  memberLevel: number;
  createdAt: Date;
  paymentMethod?: 'cash' | 'wechat' | 'alipay' | 'card';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
}

export type QueueStatus = 'waiting' | 'called' | 'completed' | 'cancelled';
export type QueueTableType = 'american' | 'snooker' | 'any';

export interface QueueEntry {
  id: string;
  queueNumber: number;
  customerName: string;
  customerPhone: string;
  phone: string;
  isVip: boolean;
  memberLevel: number;
  priority: number;
  tableType: QueueTableType;
  joinTime: Date;
  status: QueueStatus;
  calledTime?: Date;
  completedTime?: Date;
  note?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  level: number;
  levelName: string;
  canQueueJump: boolean;
  discountRate: number;
  joinDate: Date;
  createdAt: Date;
  totalSpent: number;
  visits: number;
  visitCount: number;
  isActive: boolean;
}

export interface DailyStats {
  date: string;
  totalRevenue: number;
  totalBills: number;
  totalHours: number;
  peakHoursRevenue: number;
  vipRevenue: number;
  cueRentalRevenue: number;
}

export type PageRoute = '/' | '/tables' | '/rates' | '/queue' | '/bills' | '/members';
