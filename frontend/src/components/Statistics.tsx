import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LotteryRecord, NumberStats } from '../types';
import './Statistics.css';

interface StatisticsProps {
  records: LotteryRecord[];
}

const Statistics: React.FC<StatisticsProps> = ({ records }) => {
  const { filteredRecords, statsTitle } = useMemo(() => {
    const filtered = records.slice(0, 30);
    const title = '號碼統計';
    
    return { filteredRecords: filtered, statsTitle: title };
  }, [records]);

  const stats = useMemo(() => {
    const recentRecords = filteredRecords;
    
    // 統計每個號碼出現次數
    const numberCounts: { [key: number]: number } = {};
    
    // 初始化1-39的計數
    for (let i = 1; i <= 39; i++) {
      numberCounts[i] = 0;
    }
    
    // 計算出現次數
    recentRecords.forEach(record => {
      record.numbers.forEach(number => {
        numberCounts[number]++;
      });
    });
    
    // 轉換為統計格式並排序
    const statsArray: NumberStats[] = Object.entries(numberCounts)
      .map(([number, count]) => ({
        number: parseInt(number),
        count,
        percentage: Math.round((count / recentRecords.length) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count);
    
    return statsArray;
  }, [filteredRecords]);

  const chartData = stats.slice(0, 10); // 顯示前10名

  return (
    <div className="statistics">
      <h2>{statsTitle}</h2>
      
      <div className="stats-summary">
        <div className="summary-item">
          <span className="summary-label">統計期數</span>
          <span className="summary-value">{filteredRecords.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">最熱門號碼</span>
          <span className="summary-value">{stats[0]?.number.toString().padStart(2, '0')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">出現次數</span>
          <span className="summary-value">{stats[0]?.count}</span>
        </div>
      </div>

      <div className="chart-container">
        <h3>熱門號碼排行 (前10名)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="number" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toString().padStart(2, '0')}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [value, '出現次數']}
              labelFormatter={(label) => `號碼: ${label.toString().padStart(2, '0')}`}
            />
            <Bar dataKey="count" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-table">
        <h3>完整統計表</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>號碼</th>
                <th>出現次數</th>
                <th>出現率</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr key={stat.number} className={index < 5 ? 'top-five' : ''}>
                  <td>{index + 1}</td>
                  <td className="number-cell">{stat.number.toString().padStart(2, '0')}</td>
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

export default Statistics;