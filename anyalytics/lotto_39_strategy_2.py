import json
from collections import Counter
from itertools import combinations

def load_lottery_data(filename):
    """載入彩票數據"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['data']

def generate_all_pairs():
    """生成所有可能的兩兩組合 (1-39)"""
    return list(combinations(range(1, 40), 2))

def calculate_top_pairs_for_period(lottery_data, period_index, lookback_periods=30):
    """計算特定期數往後30期的最高頻率二合組合"""
    start_index = period_index
    end_index = min(period_index + lookback_periods, len(lottery_data))

    # 收集這段期間內所有的二合組合
    all_pairs = []
    for i in range(start_index, end_index):
        numbers = lottery_data[i]['numbers']
        # 從當期的5個號碼中找出所有可能的二合組合
        period_pairs = list(combinations(numbers, 2))
        all_pairs.extend(period_pairs)

    # 統計二合組合出現頻率
    pair_counter = Counter(all_pairs)

    # 取得最高頻率的二合組合
    if pair_counter:
        top_pair = pair_counter.most_common(1)[0]
        return top_pair[0]  # 回傳組合 (tuple)
    else:
        return None

def calculate_matches(bet_pair, winning_numbers):
    """計算中獎情況"""
    # 檢查投注的二合是否都在開獎號碼中
    return len(set(bet_pair) & set(winning_numbers)) == 2

def calculate_prize(is_win):
    """根據中獎情況計算獎金"""
    return 1125 if is_win else 0  # 二合中獎獎金 1,125 元

def simulate_lottery_strategy(lottery_data):
    """模擬使用最高頻率二合投注策略"""
    results = []
    total_cost = 0
    total_winnings = 0
    win_count = 0

    # 從第2期開始（因為第1期沒有上期數據）
    for i in range(1, len(lottery_data)):
        # 取得上期到前30期的最高頻率二合作為投注號碼
        previous_period_index = i - 1
        bet_pair = calculate_top_pairs_for_period(lottery_data, previous_period_index)

        # 如果無法決定投注組合，跳過這期
        if bet_pair is None:
            continue

        # 當期開獎號碼
        current_period = lottery_data[i]
        winning_numbers = current_period['numbers']

        # 計算中獎情況
        is_win = calculate_matches(bet_pair, winning_numbers)
        prize = calculate_prize(is_win)

        if is_win:
            win_count += 1

        # 投注成本
        cost = 25  # 每張彩票25元
        total_cost += cost
        total_winnings += prize

        # 期數計算（數據是倒序的，第一個是最新期數）
        period_number = len(lottery_data) - i

        result = {
            'period': period_number,
            'date': current_period['date'],
            'bet_pair': list(bet_pair),
            'winning_numbers': winning_numbers,
            'is_win': is_win,
            'prize': prize,
            'cost': cost,
            'net_gain': prize - cost
        }
        results.append(result)

    return results, total_cost, total_winnings, win_count

def generate_winnings_report(results, total_cost, total_winnings, win_count):
    """生成獲獎統計報告"""
    report_lines = []
    report_lines.append("39樂合彩投注策略獲獎統計報告")
    report_lines.append("=" * 60)
    report_lines.append("策略：使用過去30期最高頻率二合組合投注")
    report_lines.append("")
    report_lines.append("獎金標準：")
    report_lines.append("  二合（投注2個號碼對中2個）：1,125元")
    report_lines.append("  每張彩票：25元")
    report_lines.append("")

    # 統計中獎情況
    total_periods = len(results)
    lose_count = total_periods - win_count

    report_lines.append("中獎統計：")
    report_lines.append(f"  二合中獎：{win_count}次，每次獎金1,125元")
    report_lines.append(f"  未中獎：{lose_count}次")
    report_lines.append("")

    report_lines.append("財務統計：")
    report_lines.append(f"  總投注期數：{total_periods}期")
    report_lines.append(f"  總投注成本：{total_cost:,}元")
    report_lines.append(f"  總獲得獎金：{total_winnings:,}元")
    report_lines.append(f"  總淨損益：{total_winnings - total_cost:,}元")
    if total_cost > 0:
        roi = ((total_winnings - total_cost) / total_cost) * 100
        report_lines.append(f"  投資報酬率：{roi:.2f}%")
    if total_periods > 0:
        win_rate = (win_count / total_periods) * 100
        report_lines.append(f"  中獎率：{win_rate:.2f}%")
    report_lines.append("")

    report_lines.append("詳細投注記錄：")
    report_lines.append("-" * 60)

    for result in results:  # 顯示所有期數的詳細記錄
        report_lines.append(f"第{result['period']}期 ({result['date']})")
        report_lines.append(f"  投注組合：{result['bet_pair']}")
        report_lines.append(f"  開獎號碼：{result['winning_numbers']}")
        report_lines.append(f"  中獎狀況：{'中獎' if result['is_win'] else '未中獎'}")
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
    results, total_cost, total_winnings, win_count = simulate_lottery_strategy(lottery_data)

    # 生成報告
    report = generate_winnings_report(results, total_cost, total_winnings, win_count)

    # 寫入檔案
    output_filename = 'lotto_39_strategy_2.txt'
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"獲獎統計報告已生成：{output_filename}")
    print(f"總投注：{len(results)}期，成本{total_cost:,}元")
    print(f"總獎金：{total_winnings:,}元")
    print(f"淨損益：{total_winnings - total_cost:,}元")
    if len(results) > 0:
        win_rate = (win_count / len(results)) * 100
        print(f"中獎率：{win_rate:.2f}%")

if __name__ == "__main__":
    main()