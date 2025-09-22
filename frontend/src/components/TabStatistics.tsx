import React, { useState, useMemo } from 'react';
import { LotteryRecord } from '../types';
import Statistics from './Statistics';
import CombinationStatistics from './CombinationStatistics';
import './TabStatistics.css';

interface TabStatisticsProps {
  records: LotteryRecord[];
  selectedDate?: string;
}

type TabType = 'numbers' | 'combinations';

const TabStatistics: React.FC<TabStatisticsProps> = ({ records, selectedDate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('numbers');

  const statsTitle = useMemo(() => {
    if (selectedDate) {
      // 找到選擇日期的索引位置
      const selectedIndex = records.findIndex(record => record.date === selectedDate);

      if (selectedIndex !== -1) {
        return `統計分析 (${selectedDate} 往前30期)`;
      } else {
        return '統計分析 (最近30期)';
      }
    } else {
      return '統計分析 (最近30期)';
    }
  }, [records, selectedDate]);

  const tabs = [
    { id: 'numbers', label: '號碼統計', icon: '🔢' },
    { id: 'combinations', label: '組合統計', icon: '🔗' }
  ];

  return (
    <div className="tab-statistics">
      <div className="tab-header">
        <h2>{statsTitle}</h2>

        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'numbers' && (
          <div className="tab-panel">
            <Statistics
              records={records}
              selectedDate={selectedDate}
              hideTitle={true}
            />
          </div>
        )}

        {activeTab === 'combinations' && (
          <div className="tab-panel">
            <CombinationStatistics
              records={records}
              selectedDate={selectedDate}
              hideTitle={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabStatistics;