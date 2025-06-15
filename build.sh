#!/bin/bash

# 今彩539開獎資訊系統建置腳本

echo "🚀 開始建置今彩539開獎資訊系統..."

# 檢查Python環境
echo "📋 檢查Python環境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安裝"
    exit 1
fi

# 檢查Node.js環境  
echo "📋 檢查Node.js環境..."
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm 未安裝"
    exit 1
fi

# 安裝Python依賴
echo "📦 安裝Python依賴..."
pip3 install -r requirements.txt

# 執行爬蟲抓取資料
echo "🕷️ 執行爬蟲抓取最新資料..."
python3 scraper.py

# 進入前端目錄
cd frontend

# 安裝前端依賴
echo "📦 安裝前端依賴..."
npm install

# 複製開獎資料到前端
echo "📄 複製開獎資料..."
cp ../lottery_data.json public/

# 建置前端應用
echo "🔨 建置前端應用..."
npm run build

echo "✅ 建置完成！"
echo "📁 靜態檔案位置: frontend/build/"
echo "🌐 可使用以下指令啟動本地伺服器:"
echo "   cd frontend && npx serve -s build"