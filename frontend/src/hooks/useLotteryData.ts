import { useState, useEffect } from 'react';
import { LotteryData } from '../types';

export const useLotteryData = () => {
  const [data, setData] = useState<LotteryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use different paths for development and production
        const isDev = process.env.NODE_ENV === 'development';
        const dataUrl = isDev ? '/ito539_analytics/lottery_data.json' : './lottery_data.json';
        const response = await fetch(dataUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const lotteryData: LotteryData = await response.json();
        setData(lotteryData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};