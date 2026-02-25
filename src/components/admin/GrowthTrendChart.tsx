'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getGrowthTrendData, GrowthData } from '@/lib/adminAnalytics';

interface GrowthTrendChartProps {
  requests: AdminJoinRequest[];
}

export function GrowthTrendChart({ requests }: GrowthTrendChartProps) {
  const [chartData, setChartData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGrowthTrendData(requests);
        setChartData(data);
      } catch (error) {
        console.error('Error loading growth trend data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requests]);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Growth Trend</h3>
        <TrendingUp className="h-4 w-4 text-[var(--aip-teal)]" />
      </div>
      <div className="pt-2">
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Loading growth data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No growth data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#0f172a',
                }}
                labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                itemStyle={{ color: '#0f172a' }}
                formatter={(value: number | undefined) => [value ?? 0, 'Total Doctors']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--aip-teal)"
                strokeWidth={2}
                dot={{ fill: 'var(--aip-teal)', r: 4 }}
                activeDot={{ r: 6, fill: 'var(--aip-teal)', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
