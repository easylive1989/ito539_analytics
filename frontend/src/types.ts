export interface LotteryRecord {
  date: string;
  numbers: number[];
  timestamp: string;
}

export interface LotteryData {
  last_updated: string;
  total_records: number;
  data: LotteryRecord[];
}

export interface NumberStats {
  number: number;
  count: number;
  percentage: number;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface StatisticsFilter {
  type: 'period' | 'dateRange' | 'all';
  value: number | DateRange | null;
}