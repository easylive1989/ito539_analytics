# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

此專案是今彩539開獎資訊系統，包含自動化資料爬取、統計分析功能和網頁前端展示。主要技術棧為Python後端爬蟲 + React/TypeScript前端。

## 常用指令

### Python 爬蟲相關
```bash
# 安裝 Python 依賴
pip install -r requirements.txt

# 執行開發版爬蟲 (測試用)
python scraper.py

# 執行生產版爬蟲 (如果存在)
python scraper_production.py
```

### React 前端開發
```bash
# 進入前端目錄並安裝依賴
cd frontend
npm install

# 啟動開發伺服器
npm start

# 建置生產版本
npm run build

# 執行測試
npm test
```

### 完整建置流程
```bash
# 使用建置腳本（自動執行爬蟲 + 前端建置）
./build.sh

# 或手動執行步驟：
# 1. 執行爬蟲更新資料
python scraper.py

# 2. 複製資料到前端
cp lottery_data.json frontend/public/

# 3. 建置前端
cd frontend && npm run build
```

## 專案架構

### 資料流程
1. **爬蟲系統**: `scraper.py` 從官方網站抓取開獎資料
2. **資料儲存**: 儲存為 `lottery_data.json` 格式
3. **前端展示**: React 應用讀取 JSON 資料進行統計分析和視覺化

### 核心組件

#### Python 爬蟲 (`scraper.py`)
- 使用 requests + BeautifulSoup 解析開獎網頁
- 支援增量更新（只抓取新資料）
- 自動去重和資料驗證
- 輸出格式化的 JSON 資料

#### React 前端 (`frontend/src/`)
- **App.tsx**: 主應用程式組件
- **components/**: React 組件（圖表、統計表等）
- **hooks/**: 自定義 React hooks
- **types.ts**: TypeScript 類型定義
- 使用 Recharts 進行資料視覺化

#### 分析策略 (`anyalytics/`)
- 包含多種投注策略的 Python 實作
- 基於歷史資料進行機率分析
- 支援今彩539和39樂合彩

### 自動化部署
- **GitHub Actions**: 每日自動執行爬蟲更新資料
- **GitHub Pages**: 自動部署前端應用
- 工作流程文件位於 `.github/workflows/`

## 開發注意事項

### 資料格式
- 開獎資料統一使用 `lottery_data.json` 格式
- 包含日期、號碼、時間戳等欄位
- 詳細格式請參考 `data-format.md`

### 前端開發
- 專案使用 TypeScript 進行類型檢查
- 統計計算使用 React useMemo 進行效能優化
- 支援響應式設計，需考慮手機端顯示

### 爬蟲開發
- 需遵守網站爬取禮儀，避免過度頻繁請求
- 實作錯誤處理和重試機制
- 確保資料解析的穩定性

## 檔案結構說明

```
├── scraper.py              # 主要爬蟲腳本
├── lottery_data.json       # 開獎資料（自動生成）
├── build.sh               # 完整建置腳本
├── requirements.txt        # Python 依賴
├── anyalytics/            # 投注策略分析
│   ├── ito_539_strategy_*.py
│   └── lotto_39_strategy_*.py
├── frontend/              # React 前端應用
│   ├── src/
│   ├── public/
│   └── package.json
└── .github/workflows/     # GitHub Actions 自動化
    ├── scrape-lottery.yml # 每日資料更新
    └── deploy-pages.yml   # 網站部署
```