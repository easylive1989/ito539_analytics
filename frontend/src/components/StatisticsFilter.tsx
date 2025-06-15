import React, { useState, useEffect } from 'react';
import { LotteryRecord, StatisticsFilter, DateRange } from '../types';
import './StatisticsFilter.css';

interface StatisticsFilterProps {
  records: LotteryRecord[];
  onFilterChange: (filter: StatisticsFilter) => void;
  initialFilter: StatisticsFilter;
}

const StatisticsFilterComponent: React.FC<StatisticsFilterProps> = ({
  records,
  onFilterChange,
  initialFilter
}) => {
  const [filterType, setFilterType] = useState<'period' | 'dateRange' | 'all'>(initialFilter.type);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null
  });

  // 計算可用的日期範圍
  const minDate = records.length > 0 ? records[records.length - 1].date : '';
  const maxDate = records.length > 0 ? records[0].date : '';

  // 轉換日期格式用於input[type="date"]
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.replace(/\//g, '-');
  };

  // 轉換日期格式回原始格式
  const formatDateFromInput = (dateStr: string) => {
    if (!dateStr) return null;
    return dateStr.replace(/-/g, '/');
  };

  useEffect(() => {
    let filter: StatisticsFilter;
    
    switch (filterType) {
      case 'period':
        filter = { type: 'period', value: selectedPeriod };
        break;
      case 'dateRange':
        filter = { type: 'dateRange', value: dateRange };
        break;
      case 'all':
        filter = { type: 'all', value: null };
        break;
      default:
        filter = { type: 'period', value: 30 };
    }
    
    onFilterChange(filter);
  }, [filterType, selectedPeriod, dateRange, onFilterChange]);

  const handleFilterTypeChange = (type: 'period' | 'dateRange' | 'all') => {
    setFilterType(type);
  };

  const handleStartDateChange = (date: string) => {
    setDateRange(prev => ({
      ...prev,
      startDate: formatDateFromInput(date)
    }));
  };

  const handleEndDateChange = (date: string) => {
    setDateRange(prev => ({
      ...prev,
      endDate: formatDateFromInput(date)
    }));
  };

  const getFilteredRecordsCount = () => {
    switch (filterType) {
      case 'period':
        return Math.min(selectedPeriod, records.length);
      case 'dateRange':
        if (!dateRange.startDate || !dateRange.endDate) return 0;
        return records.filter(record => {
          const recordDate = new Date(record.timestamp);
          const start = new Date(dateRange.startDate!);
          const end = new Date(dateRange.endDate!);
          return recordDate >= start && recordDate <= end;
        }).length;
      case 'all':
        return records.length;
      default:
        return 0;
    }
  };

  return (
    <div className="statistics-filter">
      <h3>統計範圍設定</h3>
      
      <div className="filter-options">
        <div className="filter-option">
          <label>
            <input
              type="radio"
              name="filterType"
              value="period"
              checked={filterType === 'period'}
              onChange={() => handleFilterTypeChange('period')}
            />
            <span>按期數</span>
          </label>
          
          {filterType === 'period' && (
            <div className="period-controls">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              >
                <option value={5}>近5期</option>
                <option value={10}>近10期</option>
                <option value={20}>近20期</option>
                <option value={30}>近30期</option>
                <option value={50}>近50期</option>
                <option value={100}>近100期</option>
                <option value={200}>近200期</option>
              </select>
            </div>
          )}
        </div>

        <div className="filter-option">
          <label>
            <input
              type="radio"
              name="filterType"
              value="dateRange"
              checked={filterType === 'dateRange'}
              onChange={() => handleFilterTypeChange('dateRange')}
            />
            <span>按日期範圍</span>
          </label>
          
          {filterType === 'dateRange' && (
            <div className="date-controls">
              <div className="date-input-group">
                <label htmlFor="startDate">開始日期：</label>
                <input
                  id="startDate"
                  type="date"
                  min={formatDateForInput(minDate)}
                  max={formatDateForInput(maxDate)}
                  value={dateRange.startDate ? formatDateForInput(dateRange.startDate) : ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              
              <div className="date-input-group">
                <label htmlFor="endDate">結束日期：</label>
                <input
                  id="endDate"
                  type="date"
                  min={formatDateForInput(minDate)}
                  max={formatDateForInput(maxDate)}
                  value={dateRange.endDate ? formatDateForInput(dateRange.endDate) : ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </div>
              
              <div className="quick-date-buttons">
                <button
                  type="button"
                  onClick={() => {
                    const endDate = records[0].date;
                    const startRecord = records.find((_, index) => index === 29); // 近30期
                    const startDate = startRecord ? startRecord.date : records[records.length - 1].date;
                    setDateRange({ startDate, endDate });
                  }}
                >
                  近30期
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    const endDate = records[0].date;
                    const startRecord = records.find(r => new Date(r.timestamp) >= lastMonth);
                    const startDate = startRecord ? startRecord.date : records[records.length - 1].date;
                    setDateRange({ startDate, endDate });
                  }}
                >
                  近30天
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const endDate = records[0].date;
                    const startRecord = records.find(r => new Date(r.timestamp) >= lastWeek);
                    const startDate = startRecord ? startRecord.date : records[records.length - 1].date;
                    setDateRange({ startDate, endDate });
                  }}
                >
                  近7天
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="filter-option">
          <label>
            <input
              type="radio"
              name="filterType"
              value="all"
              checked={filterType === 'all'}
              onChange={() => handleFilterTypeChange('all')}
            />
            <span>全部資料</span>
          </label>
        </div>
      </div>

      <div className="filter-summary">
        <div className="summary-info">
          <span className="summary-label">統計範圍：</span>
          <span className="summary-value">
            {filterType === 'period' && `近${selectedPeriod}期`}
            {filterType === 'dateRange' && dateRange.startDate && dateRange.endDate && 
              `${dateRange.startDate} 至 ${dateRange.endDate}`}
            {filterType === 'all' && '全部資料'}
            {filterType === 'dateRange' && (!dateRange.startDate || !dateRange.endDate) && 
              '請選擇日期範圍'}
          </span>
        </div>
        
        <div className="summary-info">
          <span className="summary-label">包含期數：</span>
          <span className="summary-value">{getFilteredRecordsCount()} 期</span>
        </div>
        
        <div className="summary-info">
          <span className="summary-label">資料範圍：</span>
          <span className="summary-value">{minDate} 至 {maxDate}</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFilterComponent;