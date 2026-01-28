'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getDoctorsJoinedPerMonth, MonthlyJoinData } from '@/lib/adminAnalytics';

interface DoctorsJoinedPerMonthChartProps {
  requests: AdminJoinRequest[];
}

export function DoctorsJoinedPerMonthChart({ requests }: DoctorsJoinedPerMonthChartProps) {
  const chartData = useMemo(() => getDoctorsJoinedPerMonth(requests), [requests]);

  return (
    <Card className="card-vibrant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Doctors Joined Per Month</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every((d) => d.count === 0) ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No join data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
                formatter={(value: number | undefined) => [value ?? 0, 'Doctors']}
              />
              <Bar
                dataKey="count"
                fill="#2EC4B6"
                radius={[8, 8, 0, 0]}
                stroke="#2EC4B6"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
