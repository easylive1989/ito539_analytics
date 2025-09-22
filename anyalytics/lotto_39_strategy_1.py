import json
from collections import Counter

def load_lottery_data(filename):
    """載入彩票數據"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['data']

def calculate_top_2_numbers_for_period(lottery_data, period_index, lookback_periods=30):
    """計算特定期數往後30期的最高頻率前2名數字"""
    start_index = period_index
    end_index = min(period_index + lookback_periods, len(lottery_data))

    actual_periods = end_index - start_index

    # 收集這段期間內所有的數字
    all_numbers = []
    for i in range(start_index, end_index):
        all_numbers.extend(lottery_data[i]['numbers'])

    # 統計數字出現頻率
    number_counter = Counter(all_numbers)

    # 取得前2名數字
    top_2 = number_counter.most_common(2)
    top_numbers = [num for num, count in top_2]

    return top_numbers

def calculate_matches(bet_numbers, winning_numbers):
    """計算中獎號碼數量"""
    return len(set(bet_numbers) & set(winning_numbers))

def calculate_prize_39(matches, bet_count):
    """根據中獎號碼數量和投注數量計算39樂合彩獎金"""
    if bet_count == 2 and matches == 2:
        return 1125  # 二合
    else:
        return 0  # 無獎金

def simulate_39_lottery_strategy(lottery_data):
    """模擬使用前2名高頻數字投注39樂合彩策略"""
    results = []
    total_cost = 0
    total_winnings = 0

    # 從第2期開始（因為第1期沒有上期數據）
    for i in range(1, len(lottery_data)):
        # 取得上一期的前2名高頻數字作為投注號碼
        previous_period_index = i - 1
        bet_numbers = calculate_top_2_numbers_for_period(lottery_data, previous_period_index)

        # 當期開獎號碼
        current_period = lottery_data[i]
        winning_numbers = current_period['numbers']

        # 計算中獎情況
        matches = calculate_matches(bet_numbers, winning_numbers)
        prize = calculate_prize_39(matches, len(bet_numbers))

        # 投注成本（39樂合彩2個號碼的投注成本）
        cost = 25  # 二合投注25元
        total_cost += cost
        total_winnings += prize

        # 期數計算（數據是倒序的，第一個是第582期）
        period_number = len(lottery_data) - i

        result = {
            'period': period_number,
            'date': current_period['date'],
            'bet_numbers': bet_numbers,
            'winning_numbers': winning_numbers,
            'matches': matches,
            'prize': prize,
            'cost': cost,
            'net_gain': prize - cost
        }
        results.append(result)

    return results, total_cost, total_winnings

def generate_39_winnings_report(results, total_cost, total_winnings):
    """生成39樂合彩獲獎統計報告"""
    report_lines = []
    report_lines.append("39樂合彩投注策略獲獎統計報告")
    report_lines.append("=" * 60)
    report_lines.append("策略：使用上期前2名高頻數字作為投注號碼（二合投注）")
    report_lines.append("")
    report_lines.append("獎金標準：")
    report_lines.append("  四合（4個號碼對中4個）：212,500元")
    report_lines.append("  三合（3個號碼對中3個）：11,250元")
    report_lines.append("  二合（2個號碼對中2個）：1,125元")
    report_lines.append("  每張彩票（二合）：25元")
    report_lines.append("")

    # 統計中獎情況
    match_stats = {}
    win_count = 0
    for result in results:
        matches = result['matches']
        if matches not in match_stats:
            match_stats[matches] = 0
        match_stats[matches] += 1

        if result['prize'] > 0:
            win_count += 1

    report_lines.append("中獎統計：")
    for matches in sorted(match_stats.keys(), reverse=True):
        count = match_stats[matches]
        if matches == 2:  # 二合中獎
            report_lines.append(f"  中{matches}個號碼（二合）：{count}次，每次獎金1,125元")
        else:
            report_lines.append(f"  中{matches}個號碼：{count}次，無獎金")

    report_lines.append("")
    report_lines.append("財務統計：")
    report_lines.append(f"  總投注期數：{len(results)}期")
    report_lines.append(f"  中獎期數：{win_count}期")
    win_rate = (win_count / len(results)) * 100
    report_lines.append(f"  中獎率：{win_rate:.2f}%")
    report_lines.append(f"  總投注成本：{total_cost:,}元")
    report_lines.append(f"  總獲得獎金：{total_winnings:,}元")
    report_lines.append(f"  總淨損益：{total_winnings - total_cost:,}元")
    if total_cost > 0:
        roi = ((total_winnings - total_cost) / total_cost) * 100
        report_lines.append(f"  投資報酬率：{roi:.2f}%")
    report_lines.append("")

    report_lines.append("詳細投注記錄：")
    report_lines.append("-" * 60)

    for result in results:  # 顯示所有期數的詳細記錄
        report_lines.append(f"第{result['period']}期 ({result['date']})")
        report_lines.append(f"  投注號碼：{result['bet_numbers']}")
        report_lines.append(f"  開獎號碼：{result['winning_numbers']}")
        report_lines.append(f"  中獎數量：{result['matches']}個")
        if result['prize'] > 0:
            report_lines.append(f"  獲得獎金：{result['prize']:,}元 (二合中獎)")
        else:
            report_lines.append(f"  獲得獎金：{result['prize']:,}元")
        report_lines.append(f"  淨損益：{result['net_gain']:,}元")
        report_lines.append("")

    return "\n".join(report_lines)

def main():
    # 載入數據
    lottery_data = load_lottery_data('../lottery_data.json')

    print(f"載入了 {len(lottery_data)} 期彩票數據")
    print("開始模擬39樂合彩投注策略...")

    # 模擬投注策略
    results, total_cost, total_winnings = simulate_39_lottery_strategy(lottery_data)

    # 生成報告
    report = generate_39_winnings_report(results, total_cost, total_winnings)

    # 寫入檔案
    output_filename = 'lotto_39_strategy_1.txt'
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(report)

    # 計算中獎次數
    win_count = len([r for r in results if r['prize'] > 0])
    win_rate = (win_count / len(results)) * 100

    print(f"獲獎統計報告已生成：{output_filename}")
    print(f"總投注：{len(results)}期，成本{total_cost:,}元")
    print(f"中獎期數：{win_count}期，中獎率：{win_rate:.2f}%")
    print(f"總獎金：{total_winnings:,}元")
    print(f"淨損益：{total_winnings - total_cost:,}元")
    if total_cost > 0:
        roi = ((total_winnings - total_cost) / total_cost) * 100
        print(f"投資報酬率：{roi:.2f}%")

if __name__ == "__main__":
    main()