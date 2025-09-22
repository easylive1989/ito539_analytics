import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LotteryRecord, CombinationStats } from '../types';
import './CombinationStatistics.css';

interface CombinationStatisticsProps {
  records: LotteryRecord[];
  selectedDate?: string;
  hideTitle?: boolean;
}

const CombinationStatistics: React.FC<CombinationStatisticsProps> = ({ records, selectedDate, hideTitle = false }) => {
  const [showCount, setShowCount] = useState<number>(20); // 顯示前20組合

  const { filteredRecords, statsTitle } = useMemo(() => {
    let filtered: LotteryRecord[];
    let title: string;

    if (selectedDate) {
      // 找到選擇日期的索引位置
      const selectedIndex = records.findIndex(record => record.date === selectedDate);

      if (selectedIndex !== -1) {
        // 從選擇的日期開始往前取30期（包含選擇的日期）
        const startIndex = selectedIndex;
        const endIndex = Math.min(selectedIndex + 30, records.length);
        filtered = records.slice(startIndex, endIndex);
        title = `數字組合統計 (${selectedDate} 往前30期)`;
      } else {
        // 如果找不到選擇的日期，使用前30期
        filtered = records.slice(0, 30);
        title = '數字組合統計 (最近30期)';
      }
    } else {
      // 沒有選擇日期時，使用前30期
      filtered = records.slice(0, 30);
      title = '數字組合統計 (最近30期)';
    }

    return { filteredRecords: filtered, statsTitle: title };
  }, [records, selectedDate]);

  const combinationStats = useMemo(() => {
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
    filteredRecords.forEach(record => {
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
          percentage: Math.round((count / filteredRecords.length) * 100 * 100) / 100
        };
      })
      .sort((a, b) => b.count - a.count);

    return statsArray;
  }, [filteredRecords]);

  const chartData = combinationStats.slice(0, showCount).map(stat => ({
    ...stat,
    label: `${stat.combination[0].toString().padStart(2, '0')}-${stat.combination[1].toString().padStart(2, '0')}`
  }));

  const formatCombination = (combination: [number, number]) => {
    return `${combination[0].toString().padStart(2, '0')}-${combination[1].toString().padStart(2, '0')}`;
  };

  return (
    <div className="combination-statistics">
      {!hideTitle && <h2>{statsTitle}</h2>}

      <div className="stats-summary">
        <div className="summary-item">
          <span className="summary-label">統計期數</span>
          <span className="summary-value">{filteredRecords.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">總組合數</span>
          <span className="summary-value">741</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">最熱門組合</span>
          <span className="summary-value">{formatCombination(combinationStats[0]?.combination || [0, 0])}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">出現次數</span>
          <span className="summary-value">{combinationStats[0]?.count || 0}</span>
        </div>
      </div>

      <div className="chart-controls">
        <label htmlFor="show-count">顯示組合數：</label>
        <select
          id="show-count"
          value={showCount}
          onChange={(e) => setShowCount(Number(e.target.value))}
        >
          <option value={10}>前10組</option>
          <option value={20}>前20組</option>
          <option value={30}>前30組</option>
          <option value={50}>前50組</option>
        </select>
      </div>

      <div className="chart-container">
        <h3>熱門組合排行 (前{showCount}組)</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, '出現次數']}
              labelFormatter={(label) => `組合: ${label}`}
            />
            <Bar dataKey="count" fill="#764ba2" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-table">
        <h3>完整組合統計表</h3>
        <div className="stats-info">
          <p>顯示前50個最熱門的數字組合</p>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>組合</th>
                <th>出現次數</th>
                <th>出現率</th>
              </tr>
            </thead>
            <tbody>
              {combinationStats.slice(0, 50).map((stat, index) => (
                <tr key={formatCombination(stat.combination)} className={index < 5 ? 'top-five' : ''}>
                  <td>{index + 1}</td>
                  <td className="combination-cell">{formatCombination(stat.combination)}</td>
                  <td>{stat.count}</td>
                  <td>{stat.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CombinationStatistics;