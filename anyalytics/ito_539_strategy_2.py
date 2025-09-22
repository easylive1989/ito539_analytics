import json
from collections import Counter

def load_lottery_data(filename):
    """載入彩票數據"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['data']

def calculate_top_numbers_for_period_with_check(lottery_data, period_index, lookback_periods=30):
    """計算特定期數往後30期的最高頻率前5名數字，並檢查是否有明確的前5名"""
    start_index = period_index
    end_index = min(period_index + lookback_periods, len(lottery_data))

    actual_periods = end_index - start_index

    # 收集這段期間內所有的數字
    all_numbers = []
    for i in range(start_index, end_index):
        all_numbers.extend(lottery_data[i]['numbers'])

    # 統計數字出現頻率
    number_counter = Counter(all_numbers)

    # 取得所有數字及其出現次數，依次數排序
    all_numbers_sorted = number_counter.most_common()

    # 檢查是否有明確的前5名
    if len(all_numbers_sorted) < 5:
        return None, "數字種類不足5個"

    # 取得前5名的次數
    top_5_counts = [count for num, count in all_numbers_sorted[:5]]

    # 檢查是否有第6名及以後的數字與第5名次數相同
    if len(all_numbers_sorted) > 5:
        fifth_count = top_5_counts[4]  # 第5名的次數
        # 檢查第6名開始是否有相同次數
        for i in range(5, len(all_numbers_sorted)):
            if all_numbers_sorted[i][1] == fifth_count:
                return None, f"第5名與其他號碼次數相同({fifth_count}次)，無法確定唯一的前5名"

    # 如果前5名內部有相同次數，也需要檢查
    unique_counts = set(top_5_counts)
    if len(unique_counts) < 5:
        # 檢查是否會影響前5名的唯一性
        # 找出重複的次數
        count_frequency = Counter(top_5_counts)
        for count_val, frequency in count_frequency.items():
            if frequency > 1:
                # 檢查這個次數是否也出現在第6名之後
                sixth_and_later = [count for num, count in all_numbers_sorted[5:]]
                if count_val in sixth_and_later:
                    return None, f"前5名內有重複次數({count_val})且第6名後也有相同次數，無法確定唯一的前5名"

    # 如果通過所有檢查，返回前5名數字
    top_5_numbers = [num for num, count in all_numbers_sorted[:5]]
    return top_5_numbers, "明確的前5名"

def calculate_matches(bet_numbers, winning_numbers):
    """計算中獎號碼數量"""
    return len(set(bet_numbers) & set(winning_numbers))

def calculate_prize(matches):
    """根據中獎號碼數量計算獎金"""
    prize_table = {
        5: 8000000,  # 800萬
        4: 20000,    # 2萬
        3: 300,      # 300元
        2: 50,       # 50元
        1: 0,        # 無獎金
        0: 0         # 無獎金
    }
    return prize_table.get(matches, 0)

def simulate_lottery_strategy_best(lottery_data):
    """模擬使用明確前5名高頻數字投注策略（只在有明確前5名時投注）"""
    results = []
    total_cost = 0
    total_winnings = 0
    skipped_periods = 0

    # 從第2期開始（因為第1期沒有上期數據）
    for i in range(1, len(lottery_data)):
        # 取得上一期的前5名高頻數字作為投注號碼
        previous_period_index = i - 1
        bet_numbers, status = calculate_top_numbers_for_period_with_check(lottery_data, previous_period_index)

        # 當期開獎號碼
        current_period = lottery_data[i]
        winning_numbers = current_period['numbers']

        # 期數計算（數據是倒序的，第一個是第582期）
        period_number = len(lottery_data) - i

        if bet_numbers is None:
            # 跳過投注
            skipped_periods += 1
            result = {
                'period': period_number,
                'date': current_period['date'],
                'bet_numbers': None,
                'winning_numbers': winning_numbers,
                'matches': None,
                'prize': 0,
                'cost': 0,
                'net_gain': 0,
                'status': f"跳過投注 - {status}"
            }
        else:
            # 計算中獎情況
            matches = calculate_matches(bet_numbers, winning_numbers)
            prize = calculate_prize(matches)

            # 投注成本
            cost = 50  # 每張彩票50元
            total_cost += cost
            total_winnings += prize

            result = {
                'period': period_number,
                'date': current_period['date'],
                'bet_numbers': bet_numbers,
                'winning_numbers': winning_numbers,
                'matches': matches,
                'prize': prize,
                'cost': cost,
                'net_gain': prize - cost,
                'status': "正常投注"
            }

        results.append(result)

    return results, total_cost, total_winnings, skipped_periods

def generate_winnings_report_best(results, total_cost, total_winnings, skipped_periods):
    """生成優化策略獲獎統計報告"""
    report_lines = []
    report_lines.append("彩票投注策略獲獎統計報告（優化版）")
    report_lines.append("=" * 60)
    report_lines.append("策略：使用上期前5名高頻數字作為投注號碼")
    report_lines.append("優化：只在有明確唯一前5名時才投注，避免平手情況")
    report_lines.append("")
    report_lines.append("獎金標準：")
    report_lines.append("  中5個號碼：800萬元")
    report_lines.append("  中4個號碼：2萬元")
    report_lines.append("  中3個號碼：300元")
    report_lines.append("  中2個號碼：50元")
    report_lines.append("  每張彩票：50元")
    report_lines.append("")

    # 只統計有投注的期數
    bet_results = [r for r in results if r['bet_numbers'] is not None]

    # 統計中獎情況
    match_stats = {}
    for result in bet_results:
        matches = result['matches']
        if matches not in match_stats:
            match_stats[matches] = 0
        match_stats[matches] += 1

    report_lines.append("中獎統計（僅計算有投注的期數）：")
    for matches in sorted(match_stats.keys(), reverse=True):
        count = match_stats[matches]
        if matches >= 2:  # 只顯示有獎金的情況
            prize = calculate_prize(matches)
            report_lines.append(f"  中{matches}個號碼：{count}次，每次獎金{prize:,}元")
        else:
            report_lines.append(f"  中{matches}個號碼：{count}次，無獎金")

    report_lines.append("")
    report_lines.append("財務統計：")
    report_lines.append(f"  總期數：{len(results)}期")
    report_lines.append(f"  實際投注期數：{len(bet_results)}期")
    report_lines.append(f"  跳過投注期數：{skipped_periods}期")
    report_lines.append(f"  總投注成本：{total_cost:,}元")
    report_lines.append(f"  總獲得獎金：{total_winnings:,}元")
    report_lines.append(f"  總淨損益：{total_winnings - total_cost:,}元")
    if total_cost > 0:
        roi = ((total_winnings - total_cost) / total_cost) * 100
        report_lines.append(f"  投資報酬率：{roi:.2f}%")

    # 計算投注率
    bet_rate = (len(bet_results) / len(results)) * 100
    report_lines.append(f"  投注率：{bet_rate:.2f}%")
    report_lines.append("")

    report_lines.append("詳細投注記錄：")
    report_lines.append("-" * 60)

    for result in results:  # 顯示所有期數的詳細記錄
        report_lines.append(f"第{result['period']}期 ({result['date']})")
        if result['bet_numbers'] is None:
            report_lines.append(f"  {result['status']}")
            report_lines.append(f"  開獎號碼：{result['winning_numbers']}")
            report_lines.append(f"  投注成本：0元")
            report_lines.append(f"  獲得獎金：0元")
            report_lines.append(f"  淨損益：0元")
        else:
            report_lines.append(f"  投注號碼：{result['bet_numbers']}")
            report_lines.append(f"  開獎號碼：{result['winning_numbers']}")
            report_lines.append(f"  中獎數量：{result['matches']}個")
            report_lines.append(f"  獲得獎金：{result['prize']:,}元")
            report_lines.append(f"  淨損益：{result['net_gain']:,}元")
        report_lines.append("")

    return "\n".join(report_lines)

def main():
    # 載入數據
    lottery_data = load_lottery_data('../lottery_data.json')

    print(f"載入了 {len(lottery_data)} 期彩票數據")
    print("開始模擬優化投注策略...")

    # 模擬投注策略
    results, total_cost, total_winnings, skipped_periods = simulate_lottery_strategy_best(lottery_data)

    # 生成報告
    report = generate_winnings_report_best(results, total_cost, total_winnings, skipped_periods)

    # 寫入檔案
    output_filename = 'ito_539_strategy_2.txt'
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(report)

    bet_periods = len(results) - skipped_periods
    print(f"獲獎統計報告已生成：{output_filename}")
    print(f"總期數：{len(results)}期")
    print(f"實際投注：{bet_periods}期，成本{total_cost:,}元")
    print(f"跳過投注：{skipped_periods}期")
    print(f"總獎金：{total_winnings:,}元")
    print(f"淨損益：{total_winnings - total_cost:,}元")
    if total_cost > 0:
        roi = ((total_winnings - total_cost) / total_cost) * 100
        print(f"投資報酬率：{roi:.2f}%")

if __name__ == "__main__":
    main()