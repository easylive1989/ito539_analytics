import React, { useState, useEffect } from 'react';
import { LotteryRecord } from '../types';
import './LatestResult.css';

interface LatestResultProps {
  records: LotteryRecord[];
  onDateChange?: (date: string) => void;
}

const LatestResult: React.FC<LatestResultProps> = ({ records, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<LotteryRecord | null>(null);

  useEffect(() => {
    if (records.length > 0 && !selectedDate) {
      setSelectedDate(records[0].timestamp);
      setSelectedRecord(records[0]);
      
      // 通知父組件初始日期
      if (onDateChange) {
        onDateChange(records[0].date);
      }
    }
  }, [records, selectedDate, onDateChange]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const date = event.target.value;
    setSelectedDate(date);
    const record = records.find(r => r.timestamp === date);
    setSelectedRecord(record || null);
    
    // 通知父組件日期變更，使用 record.date 而不是 timestamp
    if (record && onDateChange) {
      onDateChange(record.date);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const formatDateForSelect = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="latest-result">
      <h2>開獎結果</h2>
      <div className="result-container">
        <div className="date-section">
          <label htmlFor="date-select" className="date-label">選擇開獎日期：</label>
          <select 
            id="date-select" 
            value={selectedDate} 
            onChange={handleDateChange}
            className="date-select"
          >
            {records.map((record) => (
              <option key={record.timestamp} value={record.timestamp}>
                {formatDateForSelect(record.timestamp)}
              </option>
            ))}
          </select>
        </div>
        <div className="numbers-section">
          <span className="numbers-label">開獎號碼</span>
          <div className="numbers-container">
            {selectedRecord?.numbers.map((number, index) => (
              <div key={index} className="number-ball">
                {number.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestResult;