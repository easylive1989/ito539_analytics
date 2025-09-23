import { LotteryRecord } from '../../types';

/**
 * 測試用的開獎資料
 * 設計了特定的數字分布來測試統計邏輯
 */
export const mockLotteryData: LotteryRecord[] = [
  {
    date: '2025/01/10',
    numbers: [1, 2, 3, 4, 5],
    timestamp: '2025-01-10T00:00:00'
  },
  {
    date: '2025/01/09',
    numbers: [1, 2, 6, 7, 8],
    timestamp: '2025-01-09T00:00:00'
  },
  {
    date: '2025/01/08',
    numbers: [1, 3, 9, 10, 11],
    timestamp: '2025-01-08T00:00:00'
  },
  {
    date: '2025/01/07',
    numbers: [2, 3, 12, 13, 14],
    timestamp: '2025-01-07T00:00:00'
  },
  {
    date: '2025/01/06',
    numbers: [4, 5, 15, 16, 17],
    timestamp: '2025-01-06T00:00:00'
  }
];

/**
 * 預期的號碼統計結果（基於上述測試資料）
 * 號碼1出現3次，號碼2出現3次，號碼3出現3次...
 */
export const expectedNumberStats = [
  { number: 1, count: 3, percentage: 60 },  // 1出現在前3期
  { number: 2, count: 3, percentage: 60 },  // 2出現在前3期
  { number: 3, count: 3, percentage: 60 },  // 3出現在前3期
  { number: 4, count: 2, percentage: 40 },  // 4出現在第1,5期
  { number: 5, count: 2, percentage: 40 },  // 5出現在第1,5期
];

/**
 * 預期的組合統計結果（基於上述測試資料）
 */
export const expectedCombinationStats = [
  { combination: [1, 2] as [number, number], count: 2, percentage: 40 },  // 1-2出現在第1,2期
  { combination: [1, 3] as [number, number], count: 2, percentage: 40 },  // 1-3出現在第1,3期
  { combination: [2, 3] as [number, number], count: 2, percentage: 40 },  // 2-3出現在第1,4期
];

/**
 * 無效的開獎資料（用於測試驗證邏輯）
 */
export const invalidLotteryData = [
  // 缺少必要欄位
  {
    date: '2025/01/10',
    numbers: [1, 2, 3, 4, 5]
    // 缺少 timestamp
  },
  // 號碼數量錯誤
  {
    date: '2025/01/09',
    numbers: [1, 2, 3, 4], // 只有4個號碼
    timestamp: '2025-01-09T00:00:00'
  },
  // 號碼超出範圍
  {
    date: '2025/01/08',
    numbers: [1, 2, 3, 4, 40], // 40超出範圍
    timestamp: '2025-01-08T00:00:00'
  },
  // 號碼為0
  {
    date: '2025/01/07',
    numbers: [0, 1, 2, 3, 4], // 0不在有效範圍
    timestamp: '2025-01-07T00:00:00'
  }
];

/**
 * 空的開獎資料
 */
export const emptyLotteryData: LotteryRecord[] = [];

/**
 * 單期開獎資料
 */
export const singleLotteryData: LotteryRecord[] = [
  {
    date: '2025/01/10',
    numbers: [5, 10, 15, 20, 25],
    timestamp: '2025-01-10T00:00:00'
  }
];