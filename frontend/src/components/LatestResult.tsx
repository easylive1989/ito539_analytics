import React from 'react';
import { LotteryRecord } from '../types';
import './LatestResult.css';

interface LatestResultProps {
  records: LotteryRecord[];
}

const LatestResult: React.FC<LatestResultProps> = ({ records }) => {

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };


  return (
    <div className="latest-result">
      <h2>開獎結果</h2>
      <div className="result-container">
        <div className="date-section">
          <span className="date-label">開獎日期</span>
          <span className="date-value">{formatDate(records[0]?.timestamp)}</span>
        </div>
        <div className="numbers-section">
          <span className="numbers-label">開獎號碼</span>
          <div className="numbers-container">
            {records[0]?.numbers.map((number, index) => (
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