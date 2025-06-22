import React, { useState } from 'react';
import './App.css';
import { useLotteryData } from './hooks/useLotteryData';
import LatestResult from './components/LatestResult';
import Statistics from './components/Statistics';

function App() {
  const { data, loading, error } = useLotteryData();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Debug information
  console.log('App render:', { data: !!data, loading, error });

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          <p>載入開獎資料中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <h2>載入失敗</h2>
          <p>錯誤訊息: {error}</p>
          <p>請確認資料檔案是否存在: ./lottery_data.json</p>
          <p>當前URL: {window.location.href}</p>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="App">
        <div className="no-data">
          <h2>無資料</h2>
          <p>目前沒有開獎資料</p>
        </div>
      </div>
    );
  }

  const lastUpdated = new Date(data.last_updated).toLocaleString('zh-TW');

  return (
    <div className="App">
      <header className="App-header">
        <h1>今彩539開獎資訊</h1>
        <p className="last-updated">最後更新：{lastUpdated}</p>
      </header>
      
      <main className="App-main">
        <LatestResult 
          records={data.data}
          onDateChange={setSelectedDate}
        />
        
        <Statistics 
          records={data.data}
          selectedDate={selectedDate}
        />
      </main>
      
      <footer className="App-footer">
        <p>資料來源：今彩539官方開獎結果</p>
        <p>總計 {data.total_records} 筆記錄</p>
      </footer>
    </div>
  );
}

export default App;
