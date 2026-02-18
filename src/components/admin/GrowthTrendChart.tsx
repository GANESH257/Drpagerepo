'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getGrowthTrendData, GrowthData } from '@/lib/adminAnalytics';

interface GrowthTrendChartProps {
  requests: AdminJoinRequest[];
}

export function GrowthTrendChart({ requests }: GrowthTrendChartProps) {
  const chartData = useMemo(() => getGrowthTrendData(requests), [requests]);

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Growth Trend</CardTitle>
        <TrendingUp className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
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
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
                formatter={(value: number | undefined) => [value ?? 0, 'Total Doctors']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2EC4B6"
                strokeWidth={2}
                dot={{ fill: '#2EC4B6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
