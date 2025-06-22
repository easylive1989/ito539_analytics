import React, { useState, useEffect } from 'react';
import { LotteryRecord } from '../types';
import './LatestResult.css';

interface LatestResultProps {
  records: LotteryRecord[];
  onDateChange?: (selectedRecord: LotteryRecord) => void;
}

const LatestResult: React.FC<LatestResultProps> = ({ records, onDateChange }) => {
  const [selectedRecord, setSelectedRecord] = useState<LotteryRecord>(records[0]);

  useEffect(() => {
    if (records.length > 0) {
      setSelectedRecord(records[0]);
      onDateChange?.(records[0]);
    }
  }, [records, onDateChange]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = event.target.value;
    const record = records.find(r => r.date === selectedDate);
    if (record) {
      setSelectedRecord(record);
      onDateChange?.(record);
    }
  };

  return (
    <div className="latest-result">
      <h2>開獎結果</h2>
      <div className="date-selector">
        <label htmlFor="date-select">選擇開獎日期：</label>
        <select 
          id="date-select"
          value={selectedRecord.date} 
          onChange={handleDateChange}
          className="date-select"
        >
          {records.map((record) => (
            <option key={record.date} value={record.date}>
              {formatDate(record.timestamp)}
            </option>
          ))}
        </select>
      </div>
      <div className="result-container">
        <div className="date-section">
          <span className="date-label">開獎日期</span>
          <span className="date-value">{formatDate(selectedRecord.timestamp)}</span>
        </div>
        <div className="numbers-section">
          <span className="numbers-label">開獎號碼</span>
          <div className="numbers-container">
            {selectedRecord.numbers.map((number, index) => (
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