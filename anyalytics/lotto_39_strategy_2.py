#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
39樂合彩 Strategy 2 勝率分析程式

Strategy 2 規則：
- 將 1~39 數字分成兩兩一組，總共 741 組
- 根據過去三十期出現次數最多的組合來投注本期二合
- 投注金額 25 元，二合中獎金額 1,125 元
"""

import json
import sys
import os
from datetime import datetime
from collections import defaultdict, Counter
from itertools import combinations

class Lotto39Strategy2Analyzer:
    def __init__(self, data_file):
        self.data_file = data_file
        self.lottery_data = []
        self.bet_amount = 25  # 投注金額
        self.win_amount = 1125  # 二合中獎金額
        self.results = []

    def load_data(self):
        """載入彩券資料"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # 資料是倒序排列，需要反轉為正序（從舊到新）
                self.lottery_data = list(reversed(data['data']))
            print(f"成功載入 {len(self.lottery_data)} 期開獎資料")
            print(f"資料期間: {self.lottery_data[0]['date']} ~ {self.lottery_data[-1]['date']}")
            return True
        except Exception as e:
            print(f"載入資料失敗: {e}")
            return False

    def generate_all_pairs(self):
        """生成所有可能的兩數組合 (1-39)"""
        return list(combinations(range(1, 40), 2))

    def get_pairs_from_numbers(self, numbers):
        """從一期的開獎號碼中提取所有可能的組合"""
        return list(combinations(sorted(numbers), 2))

    def count_pair_frequency(self, recent_periods):
        """統計最近期數中各組合的出現頻率"""
        pair_counter = Counter()

        for period in recent_periods:
            pairs = self.get_pairs_from_numbers(period['numbers'])
            for pair in pairs:
                pair_counter[pair] += 1

        return pair_counter

    def get_most_frequent_pair(self, pair_counter):
        """獲取出現次數最多的組合"""
        if not pair_counter:
            return None

        max_count = max(pair_counter.values())
        most_frequent_pairs = [pair for pair, count in pair_counter.items() if count == max_count]

        # 如果有多個組合並列最高，隨機選擇第一個
        return most_frequent_pairs[0] if most_frequent_pairs else None

    def check_win(self, bet_pair, winning_numbers):
        """檢查投注組合是否中獎"""
        if not bet_pair:
            return False
        return all(num in winning_numbers for num in bet_pair)

    def run_analysis(self):
        """執行策略分析"""
        if not self.load_data():
            return False

        print("\n開始進行 39樂合彩 Strategy 2 分析...")
        print("="*60)

        # 需要至少31期資料才能開始分析（前30期用於統計）
        if len(self.lottery_data) < 31:
            print("資料不足，需要至少31期資料")
            return False

        total_periods = len(self.lottery_data)
        analysis_periods = total_periods - 30  # 可分析的期數

        wins = 0
        total_cost = 0
        total_profit = 0

        for i in range(30, total_periods):
            current_period = self.lottery_data[i]
            recent_30_periods = self.lottery_data[i-30:i]

            # 統計前30期的組合頻率
            pair_counter = self.count_pair_frequency(recent_30_periods)

            # 選擇最常出現的組合
            bet_pair = self.get_most_frequent_pair(pair_counter)

            # 檢查是否中獎
            is_win = self.check_win(bet_pair, current_period['numbers'])

            # 記錄結果
            result = {
                'period': i + 1,
                'date': current_period['date'],
                'winning_numbers': current_period['numbers'],
                'bet_pair': bet_pair,
                'is_win': is_win,
                'cost': self.bet_amount,
                'profit': self.win_amount - self.bet_amount if is_win else -self.bet_amount
            }

            self.results.append(result)

            if is_win:
                wins += 1

            total_cost += self.bet_amount
            total_profit += result['profit']

        # 計算統計數據
        win_rate = (wins / analysis_periods) * 100 if analysis_periods > 0 else 0

        print(f"\n分析結果摘要：")
        print(f"分析期數: {analysis_periods}")
        print(f"中獎次數: {wins}")
        print(f"勝率: {win_rate:.2f}%")
        print(f"總投注成本: ${total_cost}")
        print(f"總獲利: ${total_profit}")
        print(f"投資報酬率: {(total_profit / total_cost * 100):.2f}%" if total_cost > 0 else "N/A")

        return True

    def generate_detailed_report(self):
        """生成詳細分析報表"""
        if not self.results:
            print("沒有分析結果可供報告")
            return

        print("\n" + "="*80)
        print("39樂合彩 Strategy 2 詳細分析報表")
        print("="*80)

        # 基本統計
        total_bets = len(self.results)
        wins = sum(1 for r in self.results if r['is_win'])
        win_rate = (wins / total_bets) * 100 if total_bets > 0 else 0
        total_cost = sum(r['cost'] for r in self.results)
        total_profit = sum(r['profit'] for r in self.results)
        roi = (total_profit / total_cost * 100) if total_cost > 0 else 0

        print(f"\n【基本統計】")
        print(f"分析期間: {self.results[0]['date']} ~ {self.results[-1]['date']}")
        print(f"總投注次數: {total_bets}")
        print(f"中獎次數: {wins}")
        print(f"未中獎次數: {total_bets - wins}")
        print(f"勝率: {win_rate:.2f}%")
        print(f"總投注成本: ${total_cost:,}")
        print(f"總獲利: ${total_profit:,}")
        print(f"投資報酬率: {roi:.2f}%")

        # 最常投注的組合
        bet_pairs = [r['bet_pair'] for r in self.results if r['bet_pair']]
        pair_counter = Counter(bet_pairs)

        print(f"\n【最常投注的組合 (前10名)】")
        for i, (pair, count) in enumerate(pair_counter.most_common(10), 1):
            win_count = sum(1 for r in self.results if r['bet_pair'] == pair and r['is_win'])
            pair_win_rate = (win_count / count * 100) if count > 0 else 0
            print(f"{i:2d}. {pair}: 投注{count}次, 中獎{win_count}次, 勝率{pair_win_rate:.1f}%")

        # 月度統計
        monthly_stats = defaultdict(lambda: {'bets': 0, 'wins': 0, 'cost': 0, 'profit': 0})

        for result in self.results:
            date_parts = result['date'].split('/')
            year_month = f"{date_parts[0]}/{date_parts[1]:0>2}"

            monthly_stats[year_month]['bets'] += 1
            if result['is_win']:
                monthly_stats[year_month]['wins'] += 1
            monthly_stats[year_month]['cost'] += result['cost']
            monthly_stats[year_month]['profit'] += result['profit']

        print(f"\n【月度統計】")
        print(f"{'月份':<10} {'投注次數':<8} {'中獎次數':<8} {'勝率':<8} {'獲利':<10}")
        print("-" * 50)

        for month in sorted(monthly_stats.keys()):
            stats = monthly_stats[month]
            month_win_rate = (stats['wins'] / stats['bets'] * 100) if stats['bets'] > 0 else 0
            print(f"{month:<10} {stats['bets']:<8} {stats['wins']:<8} {month_win_rate:<7.1f}% ${stats['profit']:<9}")

        # 最近20次投注詳細記錄
        print(f"\n【最近20次投注記錄】")
        print(f"{'期數':<6} {'日期':<12} {'開獎號碼':<20} {'投注組合':<12} {'結果':<6} {'獲利':<8}")
        print("-" * 70)

        for result in self.results[-20:]:
            numbers_str = str(result['winning_numbers'])
            bet_str = str(result['bet_pair']) if result['bet_pair'] else "None"
            win_str = "中獎" if result['is_win'] else "未中"
            profit_str = f"${result['profit']}"

            print(f"{result['period']:<6} {result['date']:<12} {numbers_str:<20} {bet_str:<12} {win_str:<6} {profit_str:<8}")

        # 直接生成最終報告
        self.generate_final_report()

        print(f"\n分析完成！詳細報告已儲存。")

    def generate_final_report(self):
        """生成格式化的詳細報告"""
        if not self.results:
            print("沒有分析結果可供報告")
            return

        # 計算統計數據
        total_periods = len(self.results)
        total_cost = sum(r['cost'] for r in self.results)
        wins = sum(1 for r in self.results if r['is_win'])
        total_winnings = wins * 1125  # 每次中獎1125元
        total_profit = sum(r['profit'] for r in self.results)
        roi = (total_profit / total_cost * 100) if total_cost > 0 else 0

        # 開始生成報告
        report = []
        report.append("39樂合彩投注策略獲獎統計報告")
        report.append("=" * 60)
        report.append("策略：根據過去30期出現次數最多的兩數組合投注二合")
        report.append("")
        report.append("獎金標準：")
        report.append("  投注2個號碼全中：1,125元")
        report.append("  每張彩票：25元")
        report.append("")
        report.append("中獎統計：")
        report.append(f"  中2個號碼：{wins}次，每次獎金1,125元")
        report.append(f"  中0個號碼：{total_periods - wins}次，無獎金")
        report.append("")
        report.append("財務統計：")
        report.append(f"  總投注期數：{total_periods}期")
        report.append(f"  總投注成本：{total_cost:,}元")
        report.append(f"  總獲得獎金：{total_winnings:,}元")
        report.append(f"  總淨損益：{total_profit:,}元")
        report.append(f"  投資報酬率：{roi:.2f}%")
        report.append("")
        report.append("詳細投注記錄：")
        report.append("-" * 60)

        # 按期數倒序顯示（最新的在前面）
        for result in reversed(self.results):
            period = result['period']
            date = result['date']
            bet_pair = result['bet_pair']
            winning_numbers = result['winning_numbers']
            is_win = result['is_win']
            profit = result['profit']

            report.append(f"第{period}期 ({date})")
            if bet_pair:
                report.append(f"  投注號碼：{list(bet_pair)}")
            else:
                report.append(f"  投注號碼：無 (跳過本期)")
            report.append(f"  開獎號碼：{winning_numbers}")

            if bet_pair is None:
                report.append("  中獎情況：跳過投注")
                report.append("  獲得獎金：0元")
                report.append("  淨損益：0元")
            elif is_win:
                report.append("  中獎情況：中2個號碼")
                report.append("  獲得獎金：1,125元")
                report.append(f"  淨損益：{profit}元")
            else:
                report.append("  中獎情況：未中獎")
                report.append("  獲得獎金：0元")
                report.append(f"  淨損益：{profit}元")

            report.append("")

        # 儲存詳細報告
        try:
            report_filename = "lotto_39_strategy_2.txt"

            with open(report_filename, 'w', encoding='utf-8') as f:
                f.write("\n".join(report))

            print(f"詳細報告已儲存至: {report_filename}")

            # 同時輸出到控制台（前50行）
            print("\n詳細報告預覽（前50行）：")
            print("=" * 60)
            for line in report[:50]:
                print(line)
            if len(report) > 50:
                print("...")
                print(f"完整報告共 {len(report)} 行，已儲存至檔案")

        except Exception as e:
            print(f"儲存詳細報告失敗: {e}")

def main():
    # 資料檔案路徑
    data_file = "../lottery_data.json"

    if not os.path.exists(data_file):
        print(f"找不到資料檔案: {data_file}")
        print("請確認檔案路徑是否正確")
        sys.exit(1)

    # 建立分析器
    analyzer = Lotto39Strategy2Analyzer(data_file)

    # 執行分析
    if analyzer.run_analysis():
        analyzer.generate_detailed_report()
    else:
        print("分析執行失敗")
        sys.exit(1)

if __name__ == "__main__":
    main()