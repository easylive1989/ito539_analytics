#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import re
import json
import os
from datetime import datetime
from typing import List, Dict
from bs4 import BeautifulSoup

class LTO539Scraper:
    def __init__(self):
        self.base_url = "https://www.pilio.idv.tw/lto539/list539BIG.asp"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_page(self, page: int = 1, order_by: str = "new") -> str:
        """抓取指定頁面的內容"""
        params = {
            'indexpage': page,
            'orderby': order_by
        }
        
        try:
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            return ""
    
    def parse_lottery_data(self, html_content: str) -> List[Dict]:
        """解析開獎資料"""
        soup = BeautifulSoup(html_content, 'html.parser')
        text_content = soup.get_text()

        # 支援新舊兩種格式：
        # 新格式：開獎日期:2025/10/15(三)
        # 舊格式：2025/09/29
        pattern = r'(?:開獎日期:)?(\d{4}/\d{2}/\d{2})(?:\([一二三四五六日]\))?\s*\r?\n\s*\r?\n\s*(\d{1,2},\s*\d{1,2},\s*\d{1,2},\s*\d{1,2},\s*\d{1,2})'
        matches = re.findall(pattern, text_content, re.DOTALL)
        
        lottery_data = []
        
        for date_str, numbers_str in matches:
            try:
                # 清理號碼字串，移除所有空格和特殊字符
                numbers_str = re.sub(r'[\s\xa0]+', '', numbers_str)  # 移除所有空格和\xa0
                numbers = [int(num.strip()) for num in numbers_str.split(',') if num.strip()]
                
                if len(numbers) == 5:  # 確保有5個號碼
                    lottery_data.append({
                        'date': date_str,
                        'numbers': numbers,
                        'timestamp': datetime.strptime(date_str, '%Y/%m/%d').isoformat()
                    })
                    
            except Exception as e:
                print(f"Error parsing date {date_str} or numbers {numbers_str}: {e}")
                continue
        
        return lottery_data
    
    def load_existing_data(self, filename: str = "lottery_data.json") -> List[Dict]:
        """載入現有的資料"""
        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get('data', [])
            except Exception as e:
                print(f"Error loading existing data: {e}")
        return []
    
    def scrape_recent_data(self, pages: int = 3) -> List[Dict]:
        """只抓取最近的資料"""
        all_data = []
        
        for page in range(1, pages + 1):
            print(f"Scraping page {page}/{pages}...")
            html_content = self.fetch_page(page)
            
            if not html_content:
                print(f"Failed to fetch page {page}")
                continue
            
            page_data = self.parse_lottery_data(html_content)
            all_data.extend(page_data)
            
            # 避免過度頻繁請求
            import time
            time.sleep(2)
        
        # 按日期排序（最新的在前）
        all_data.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return all_data
    
    def merge_and_deduplicate(self, existing_data: List[Dict], new_data: List[Dict]) -> List[Dict]:
        """合併並去重資料"""
        # 建立日期索引來快速查找
        existing_dates = {item['date'] for item in existing_data}
        
        # 只保留新的資料
        truly_new_data = [item for item in new_data if item['date'] not in existing_dates]
        
        # 合併資料
        merged_data = truly_new_data + existing_data
        
        # 按日期排序
        merged_data.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return merged_data
    
    def save_to_json(self, data: List[Dict], filename: str = "lottery_data.json"):
        """將資料儲存為JSON檔案"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    'last_updated': datetime.now().isoformat(),
                    'total_records': len(data),
                    'data': data
                }, f, ensure_ascii=False, indent=2)
            print(f"Data saved to {filename} with {len(data)} records")
        except Exception as e:
            print(f"Error saving data: {e}")

    def send_discord_notification(self, latest_date: str, total_records: int, new_records: int = 0):
        """發送 Discord 通知

        Args:
            latest_date: 最新資料的日期
            total_records: 總資料筆數
            new_records: 本次新增的資料筆數
        """
        # 從環境變數讀取 webhook URL
        webhook_url = os.getenv('DISCORD_WEBHOOK_URL')

        if not webhook_url:
            print("Warning: DISCORD_WEBHOOK_URL environment variable not set. Skipping notification.")
            return

        # 建立通知訊息
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        message = {
            "content": f"✅ **今彩539資料更新完成**\n\n"
                      f"📅 最新開獎日期：`{latest_date}`\n"
                      f"📊 總資料筆數：**{total_records}** 筆\n"
                      f"🆕 本次新增：**{new_records}** 筆\n"
                      f"🕐 更新時間：`{current_time}`",
            "username": "今彩539資料監控"
        }

        try:
            response = requests.post(
                webhook_url,
                json=message,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            response.raise_for_status()
            print(f"Discord notification sent successfully (Status: {response.status_code})")

        except requests.exceptions.RequestException as e:
            print(f"Error sending Discord notification: {e}")

def main():
    scraper = LTO539Scraper()

    # 載入現有資料
    print("Loading existing data...")
    existing_data = scraper.load_existing_data()
    print(f"Found {len(existing_data)} existing records")

    # 抓取最近的資料
    print("Scraping recent data...")
    new_data = scraper.scrape_recent_data(pages=3)
    print(f"Scraped {len(new_data)} records from recent pages")

    # 合併並去重
    print("Merging and deduplicating...")
    merged_data = scraper.merge_and_deduplicate(existing_data, new_data)

    # 計算新增的資料筆數
    new_records_count = len(merged_data) - len(existing_data)

    # 儲存更新後的資料
    scraper.save_to_json(merged_data)

    print(f"Update complete. Total records: {len(merged_data)}")

    # 取得最新資料日期
    if merged_data:
        latest_date = merged_data[0]['date']

        # 發送 Discord 通知
        print("\nSending Discord notification...")
        scraper.send_discord_notification(
            latest_date=latest_date,
            total_records=len(merged_data),
            new_records=new_records_count
        )
    else:
        print("⚠️  No data available to send notification")

if __name__ == "__main__":
    main()