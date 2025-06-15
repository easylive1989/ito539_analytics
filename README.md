# 今彩539開獎資訊系統

這是一個自動抓取今彩539開獎號碼並提供統計分析的網頁應用程式。

## 功能特色

- ✅ 自動每日抓取最新開獎資料
- ✅ 顯示最新開獎號碼
- ✅ 提供近期號碼統計分析
- ✅ 互動式圖表顯示
- ✅ 響應式網頁設計
- ✅ 自動部署到GitHub Pages

## 系統架構

### 後端 (Python)
- **爬蟲腳本**: 使用requests和BeautifulSoup抓取官方開獎資料
- **資料處理**: 自動解析並儲存為JSON格式
- **GitHub Actions**: 每日自動執行爬蟲更新資料

### 前端 (React + TypeScript)
- **資料顯示**: 最新開獎號碼展示
- **統計分析**: 近期號碼出現頻率統計
- **圖表視覺化**: 使用Recharts製作互動式圖表
- **響應式設計**: 支援手機和桌面裝置

## 檔案結構

```
├── scraper.py                  # 開發版爬蟲腳本
├── scraper_production.py       # 生產版爬蟲腳本
├── requirements.txt            # Python依賴
├── lottery_data.json          # 開獎資料
├── data-format.md             # 資料格式說明
├── .github/workflows/         # GitHub Actions工作流程
│   ├── scrape-lottery.yml     # 爬蟲自動執行
│   └── deploy-pages.yml       # GitHub Pages部署
└── frontend/                  # React前端應用
    ├── src/
    │   ├── components/        # React組件
    │   ├── hooks/            # 自定義hooks
    │   ├── types.ts          # TypeScript類型定義
    │   └── App.tsx           # 主應用組件
    └── public/               # 靜態資源
```

## 本地開發

### 設定環境

```bash
# 安裝Python依賴
pip install -r requirements.txt

# 安裝Node.js依賴
cd frontend
npm install
```

### 執行爬蟲

```bash
# 開發測試
python scraper.py

# 生產更新
python scraper_production.py
```

### 啟動前端

```bash
cd frontend
npm start
```

開啟 http://localhost:3000 查看應用程式

### 建置部署

```bash
cd frontend
npm run build
```

## 部署說明

本專案使用GitHub Actions自動化：

1. **資料更新**: 每日台灣時間21:00自動執行爬蟲
2. **網站部署**: 推送至main分支時自動部署到GitHub Pages

### 設定GitHub Pages

1. 進入Repository設定
2. 選擇Pages選項
3. Source設定為"GitHub Actions"
4. 推送程式碼到main分支即可自動部署

## 資料來源

資料來源：[今彩539官方開獎結果](https://www.pilio.idv.tw/lto539/list539BIG.asp)

## 技術棧

- **後端**: Python, requests, BeautifulSoup4
- **前端**: React, TypeScript, Recharts
- **部署**: GitHub Actions, GitHub Pages
- **開發工具**: Node.js, npm

## 授權

MIT License

## 免責聲明

本系統僅供參考，開獎結果以官方公布為準。請理性購買彩券，小心投注。