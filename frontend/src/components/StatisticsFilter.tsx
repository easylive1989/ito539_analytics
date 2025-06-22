import React, { useState, useEffect } from 'react';
import { LotteryRecord, StatisticsFilter, DateRange } from '../types';

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
  const [filterType, setFilterType] = useState<'period' | 'dateRange' | 'all'>(
    initialFilter.type === 'selectedDate' ? 'period' : initialFilter.type
  );
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

  const styles = {
    container: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
      margin: '0 0 20px 0',
      color: '#333',
      fontSize: '18px',
      fontWeight: '600',
    },
    filterOptions: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
      marginBottom: '24px',
    },
    filterOption: {
      border: '2px solid #e1e5e9',
      borderRadius: '8px',
      padding: '16px',
      transition: 'border-color 0.2s ease',
    },
    filterOptionActive: {
      borderColor: '#667eea',
      background: '#f8f9ff',
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
      color: '#333',
      cursor: 'pointer',
      marginBottom: '12px',
    },
    radioInput: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    controls: {
      marginLeft: '26px',
      marginTop: '12px',
    },
    select: {
      padding: '8px 12px',
      border: '2px solid #e1e5e9',
      borderRadius: '6px',
      background: 'white',
      fontSize: '14px',
      cursor: 'pointer',
    },
    dateControls: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    dateInputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    dateInput: {
      padding: '8px 12px',
      border: '2px solid #e1e5e9',
      borderRadius: '6px',
      fontSize: '14px',
    },
    quickButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap' as const,
      marginTop: '8px',
    },
    quickButton: {
      padding: '6px 12px',
      border: '1px solid #667eea',
      background: 'white',
      color: '#667eea',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
    },
    summary: {
      padding: '16px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    summaryInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: '14px',
      color: '#666',
      fontWeight: '500',
    },
    summaryValue: {
      fontSize: '14px',
      color: '#333',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>統計範圍設定</h3>
      
      <div style={styles.filterOptions}>
        <div style={{...styles.filterOption, ...(filterType === 'period' ? styles.filterOptionActive : {})}}>
          <label style={styles.label}>
            <input
              type="radio"
              name="filterType"
              value="period"
              checked={filterType === 'period'}
              onChange={() => handleFilterTypeChange('period')}
              style={styles.radioInput}
            />
            <span>按期數</span>
          </label>
          
          {filterType === 'period' && (
            <div style={styles.controls}>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                style={styles.select}
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

        <div style={{...styles.filterOption, ...(filterType === 'dateRange' ? styles.filterOptionActive : {})}}>
          <label style={styles.label}>
            <input
              type="radio"
              name="filterType"
              value="dateRange"
              checked={filterType === 'dateRange'}
              onChange={() => handleFilterTypeChange('dateRange')}
              style={styles.radioInput}
            />
            <span>按日期範圍</span>
          </label>
          
          {filterType === 'dateRange' && (
            <div style={{...styles.controls, ...styles.dateControls}}>
              <div style={styles.dateInputGroup}>
                <label htmlFor="startDate">開始日期：</label>
                <input
                  id="startDate"
                  type="date"
                  min={formatDateForInput(minDate)}
                  max={formatDateForInput(maxDate)}
                  value={dateRange.startDate ? formatDateForInput(dateRange.startDate) : ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              
              <div style={styles.dateInputGroup}>
                <label htmlFor="endDate">結束日期：</label>
                <input
                  id="endDate"
                  type="date"
                  min={formatDateForInput(minDate)}
                  max={formatDateForInput(maxDate)}
                  value={dateRange.endDate ? formatDateForInput(dateRange.endDate) : ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              
              <div style={styles.quickButtons}>
                <button
                  type="button"
                  onClick={() => {
                    const endDate = records[0].date;
                    const startRecord = records.find((_, index) => index === 29); // 近30期
                    const startDate = startRecord ? startRecord.date : records[records.length - 1].date;
                    setDateRange({ startDate, endDate });
                  }}
                  style={styles.quickButton}
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
                  style={styles.quickButton}
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
                  style={styles.quickButton}
                >
                  近7天
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{...styles.filterOption, ...(filterType === 'all' ? styles.filterOptionActive : {})}}>
          <label style={styles.label}>
            <input
              type="radio"
              name="filterType"
              value="all"
              checked={filterType === 'all'}
              onChange={() => handleFilterTypeChange('all')}
              style={styles.radioInput}
            />
            <span>全部資料</span>
          </label>
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryInfo}>
          <span style={styles.summaryLabel}>統計範圍：</span>
          <span style={styles.summaryValue}>
            {filterType === 'period' && `近${selectedPeriod}期`}
            {filterType === 'dateRange' && dateRange.startDate && dateRange.endDate && 
              `${dateRange.startDate} 至 ${dateRange.endDate}`}
            {filterType === 'all' && '全部資料'}
            {filterType === 'dateRange' && (!dateRange.startDate || !dateRange.endDate) && 
              '請選擇日期範圍'}
          </span>
        </div>
        
        <div style={styles.summaryInfo}>
          <span style={styles.summaryLabel}>包含期數：</span>
          <span style={styles.summaryValue}>{getFilteredRecordsCount()} 期</span>
        </div>
        
        <div style={styles.summaryInfo}>
          <span style={styles.summaryLabel}>資料範圍：</span>
          <span style={styles.summaryValue}>{minDate} 至 {maxDate}</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsFilterComponent;