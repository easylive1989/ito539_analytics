import {
  calculateNumberStatistics,
  calculateCombinationStatistics,
  filterRecordsByDate,
  getTopNumbers,
  getTopCombination,
  isValidNumber,
  isValidLotteryRecord
} from '../../utils/statisticsUtils';
import {
  mockLotteryData,
  emptyLotteryData,
  singleLotteryData
} from '../../test-helpers/testData.mock';

describe('statisticsUtils', () => {
  describe('calculateNumberStatistics', () => {
    test('應該正確計算號碼統計', () => {
      const result = calculateNumberStatistics(mockLotteryData);

      // 檢查結果長度應該是39（1-39所有號碼）
      expect(result).toHaveLength(39);

      // 檢查前幾名的統計結果
      const topStats = result.slice(0, 5);

      // 號碼1, 2, 3 應該都出現3次（60%）
      expect(topStats.find(s => s.number === 1)).toEqual({
        number: 1,
        count: 3,
        percentage: 60
      });
      expect(topStats.find(s => s.number === 2)).toEqual({
        number: 2,
        count: 3,
        percentage: 60
      });
      expect(topStats.find(s => s.number === 3)).toEqual({
        number: 3,
        count: 3,
        percentage: 60
      });

      // 結果應該按出現次數降序排列
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].count).toBeGreaterThanOrEqual(result[i].count);
      }
    });

    test('處理空資料應該返回全為0的統計', () => {
      const result = calculateNumberStatistics(emptyLotteryData);

      expect(result).toHaveLength(39);
      result.forEach(stat => {
        expect(stat.count).toBe(0);
        expect(stat.percentage).toBe(0);
      });
    });

    test('處理單期資料應該正確計算', () => {
      const result = calculateNumberStatistics(singleLotteryData);

      expect(result).toHaveLength(39);

      // 檢查中獎號碼的統計
      const winningNumbers = [5, 10, 15, 20, 25];
      winningNumbers.forEach(num => {
        const stat = result.find(s => s.number === num);
        expect(stat).toEqual({
          number: num,
          count: 1,
          percentage: 100
        });
      });

      // 檢查非中獎號碼的統計
      const nonWinningNumbers = result.filter(s => !winningNumbers.includes(s.number));
      nonWinningNumbers.forEach(stat => {
        expect(stat.count).toBe(0);
        expect(stat.percentage).toBe(0);
      });
    });
  });

  describe('calculateCombinationStatistics', () => {
    test('應該正確計算組合統計', () => {
      const result = calculateCombinationStatistics(mockLotteryData);

      // 檢查結果長度應該是741（39選2的組合數）
      expect(result).toHaveLength(741);

      // 檢查最高頻率的組合
      const topCombinations = result.slice(0, 10);

      // 檢查 [1,2] 組合（出現在第1,2期）
      const combination12 = topCombinations.find(c =>
        c.combination[0] === 1 && c.combination[1] === 2
      );
      expect(combination12).toEqual({
        combination: [1, 2],
        count: 2,
        percentage: 40
      });

      // 結果應該按出現次數降序排列
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].count).toBeGreaterThanOrEqual(result[i].count);
      }
    });

    test('處理空資料應該返回全為0的統計', () => {
      const result = calculateCombinationStatistics(emptyLotteryData);

      expect(result).toHaveLength(741);
      result.forEach(stat => {
        expect(stat.count).toBe(0);
        expect(stat.percentage).toBe(0);
      });
    });
  });

  describe('filterRecordsByDate', () => {
    test('沒有選擇日期時應該返回前30期', () => {
      const { filteredRecords, title } = filterRecordsByDate(mockLotteryData);

      expect(filteredRecords).toHaveLength(5); // 測試資料只有5期
      expect(title).toBe('統計 (最近30期)');
    });

    test('選擇有效日期時應該從該日期往前取30期', () => {
      const { filteredRecords, title } = filterRecordsByDate(mockLotteryData, '2025/01/08');

      expect(filteredRecords).toHaveLength(3); // 從第3期開始的3期
      expect(title).toBe('統計 (2025/01/08 往前30期)');
      expect(filteredRecords[0].date).toBe('2025/01/08');
    });

    test('選擇無效日期時應該使用前30期', () => {
      const { filteredRecords, title } = filterRecordsByDate(mockLotteryData, '2025/01/01');

      expect(filteredRecords).toHaveLength(5);
      expect(title).toBe('統計 (最近30期)');
    });

    test('自訂期數應該正確運作', () => {
      const { filteredRecords, title } = filterRecordsByDate(mockLotteryData, undefined, 3);

      expect(filteredRecords).toHaveLength(3);
      expect(title).toBe('統計 (最近3期)');
    });
  });

  describe('getTopNumbers', () => {
    test('應該返回最高頻率的前N個號碼', () => {
      const top3 = getTopNumbers(mockLotteryData, 3);

      expect(top3).toHaveLength(3);
      expect(top3).toEqual(expect.arrayContaining([1, 2, 3]));
    });

    test('預設應該返回前5個號碼', () => {
      const top5 = getTopNumbers(mockLotteryData);

      expect(top5).toHaveLength(5);
    });
  });

  describe('getTopCombination', () => {
    test('應該返回最高頻率的組合', () => {
      const topCombination = getTopCombination(mockLotteryData);

      expect(topCombination).not.toBeNull();
      expect(topCombination).toHaveLength(2);
      expect(topCombination![0]).toBeLessThan(topCombination![1]); // 確保排序正確
    });

    test('空資料應該返回null', () => {
      const topCombination = getTopCombination(emptyLotteryData);

      expect(topCombination).toBeNull();
    });
  });

  describe('isValidNumber', () => {
    test('有效號碼應該返回true', () => {
      expect(isValidNumber(1)).toBe(true);
      expect(isValidNumber(39)).toBe(true);
      expect(isValidNumber(20)).toBe(true);
    });

    test('無效號碼應該返回false', () => {
      expect(isValidNumber(0)).toBe(false);
      expect(isValidNumber(40)).toBe(false);
      expect(isValidNumber(-1)).toBe(false);
      expect(isValidNumber(1.5)).toBe(false);
      expect(isValidNumber(NaN)).toBe(false);
    });
  });

  describe('isValidLotteryRecord', () => {
    test('有效記錄應該返回true', () => {
      const validRecord = {
        date: '2025/01/10',
        numbers: [1, 2, 3, 4, 5],
        timestamp: '2025-01-10T00:00:00'
      };

      expect(isValidLotteryRecord(validRecord)).toBe(true);
    });

    test('無效記錄應該返回false', () => {
      // 測試各種無效情況
      expect(isValidLotteryRecord(null as any)).toBe(false);
      expect(isValidLotteryRecord(undefined as any)).toBe(false);
      expect(isValidLotteryRecord({})).toBe(false);

      // 缺少欄位
      expect(isValidLotteryRecord({
        date: '2025/01/10',
        numbers: [1, 2, 3, 4, 5]
      })).toBe(false);

      // 號碼數量錯誤
      expect(isValidLotteryRecord({
        date: '2025/01/10',
        numbers: [1, 2, 3, 4],
        timestamp: '2025-01-10T00:00:00'
      })).toBe(false);

      // 號碼超出範圍
      expect(isValidLotteryRecord({
        date: '2025/01/10',
        numbers: [1, 2, 3, 4, 40],
        timestamp: '2025-01-10T00:00:00'
      })).toBe(false);
    });
  });

  describe('邊界條件測試', () => {
    test('處理重複號碼（不應該發生但要處理）', () => {
      const invalidData = [{
        date: '2025/01/10',
        numbers: [1, 1, 2, 3, 4], // 重複號碼
        timestamp: '2025-01-10T00:00:00'
      }];

      // 函數應該能處理而不崩潰
      expect(() => calculateNumberStatistics(invalidData)).not.toThrow();
      expect(() => calculateCombinationStatistics(invalidData)).not.toThrow();
    });

    test('處理極大的資料集應該保持效能', () => {
      // 建立1000期的測試資料
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        date: `2025/01/${(i % 30) + 1}`,
        numbers: [
          (i % 39) + 1,
          ((i + 1) % 39) + 1,
          ((i + 2) % 39) + 1,
          ((i + 3) % 39) + 1,
          ((i + 4) % 39) + 1
        ],
        timestamp: `2025-01-${(i % 30) + 1}T00:00:00`
      }));

      const startTime = Date.now();
      const result = calculateNumberStatistics(largeData);
      const endTime = Date.now();

      expect(result).toHaveLength(39);
      expect(endTime - startTime).toBeLessThan(1000); // 應該在1秒內完成
    });
  });
});