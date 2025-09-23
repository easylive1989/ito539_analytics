import { LotteryRecord, NumberStats, CombinationStats } from '../types';

/**
 * 計算號碼統計 - 統計每個號碼在指定期數內的出現次數
 */
export function calculateNumberStatistics(records: LotteryRecord[]): NumberStats[] {
  // 統計每個號碼出現次數
  const numberCounts: { [key: number]: number } = {};

  // 初始化1-39的計數
  for (let i = 1; i <= 39; i++) {
    numberCounts[i] = 0;
  }

  // 計算出現次數
  records.forEach(record => {
    record.numbers.forEach(number => {
      numberCounts[number]++;
    });
  });

  // 轉換為統計格式並排序
  const statsArray: NumberStats[] = Object.entries(numberCounts)
    .map(([number, count]) => ({
      number: parseInt(number),
      count,
      percentage: records.length > 0 ? Math.round((count / records.length) * 100 * 100) / 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  return statsArray;
}

/**
 * 計算組合統計 - 統計所有可能的兩兩組合在指定期數內的出現次數
 */
export function calculateCombinationStatistics(records: LotteryRecord[]): CombinationStats[] {
  // 生成所有可能的兩兩組合 (1-39)
  const allCombinations: [number, number][] = [];
  for (let i = 1; i <= 39; i++) {
    for (let j = i + 1; j <= 39; j++) {
      allCombinations.push([i, j]);
    }
  }

  // 統計每個組合出現次數
  const combinationCounts: { [key: string]: number } = {};

  // 初始化所有組合計數為0
  allCombinations.forEach(([a, b]) => {
    const key = `${a}-${b}`;
    combinationCounts[key] = 0;
  });

  // 計算每期開獎號碼中的兩兩組合
  records.forEach(record => {
    const numbers = record.numbers.sort((a, b) => a - b);

    // 生成該期的所有兩兩組合
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const combination = [numbers[i], numbers[j]].sort((a, b) => a - b);
        const key = `${combination[0]}-${combination[1]}`;
        if (combinationCounts.hasOwnProperty(key)) {
          combinationCounts[key]++;
        }
      }
    }
  });

  // 轉換為統計格式並排序
  const statsArray: CombinationStats[] = Object.entries(combinationCounts)
    .map(([key, count]) => {
      const [a, b] = key.split('-').map(Number);
      return {
        combination: [a, b] as [number, number],
        count,
        percentage: records.length > 0 ? Math.round((count / records.length) * 100 * 100) / 100 : 0
      };
    })
    .sort((a, b) => b.count - a.count);

  return statsArray;
}

/**
 * 根據選擇的日期篩選記錄
 */
export function filterRecordsByDate(
  records: LotteryRecord[],
  selectedDate?: string,
  lookbackPeriods: number = 30
): { filteredRecords: LotteryRecord[]; title: string } {
  let filtered: LotteryRecord[];
  let title: string;

  if (selectedDate) {
    // 找到選擇日期的索引位置
    const selectedIndex = records.findIndex(record => record.date === selectedDate);

    if (selectedIndex !== -1) {
      // 從選擇的日期開始往前取指定期數（包含選擇的日期）
      const startIndex = selectedIndex;
      const endIndex = Math.min(selectedIndex + lookbackPeriods, records.length);
      filtered = records.slice(startIndex, endIndex);
      title = `統計 (${selectedDate} 往前${lookbackPeriods}期)`;
    } else {
      // 如果找不到選擇的日期，使用前指定期數
      filtered = records.slice(0, lookbackPeriods);
      title = `統計 (最近${lookbackPeriods}期)`;
    }
  } else {
    // 沒有選擇日期時，使用前指定期數
    filtered = records.slice(0, lookbackPeriods);
    title = `統計 (最近${lookbackPeriods}期)`;
  }

  return { filteredRecords: filtered, title };
}

/**
 * 計算最高頻率的前N個號碼
 */
export function getTopNumbers(records: LotteryRecord[], count: number = 5): number[] {
  const stats = calculateNumberStatistics(records);
  return stats.slice(0, count).map(stat => stat.number);
}

/**
 * 計算最高頻率的組合
 */
export function getTopCombination(records: LotteryRecord[]): [number, number] | null {
  if (records.length === 0) {
    return null;
  }
  const stats = calculateCombinationStatistics(records);
  return stats.length > 0 && stats[0].count > 0 ? stats[0].combination : null;
}

/**
 * 驗證號碼是否在有效範圍內 (1-39)
 */
export function isValidNumber(number: number): boolean {
  return Number.isInteger(number) && number >= 1 && number <= 39;
}

/**
 * 驗證開獎記錄格式
 */
export function isValidLotteryRecord(record: any): record is LotteryRecord {
  return !!(
    record &&
    typeof record.date === 'string' &&
    Array.isArray(record.numbers) &&
    record.numbers.length === 5 &&
    record.numbers.every((num: any) => isValidNumber(num)) &&
    typeof record.timestamp === 'string'
  );
}