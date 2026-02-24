'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getDoctorsJoinedPerMonth, MonthlyJoinData } from '@/lib/adminAnalytics';

interface DoctorsJoinedPerMonthChartProps {
  requests: AdminJoinRequest[];
}

export function DoctorsJoinedPerMonthChart({ requests }: DoctorsJoinedPerMonthChartProps) {
  const chartData = useMemo(() => getDoctorsJoinedPerMonth(requests), [requests]);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Doctors Joined Per Month</h3>
        <Users className="h-4 w-4 text-[var(--aip-teal)]" />
      </div>
      <div className="pt-2">
        {chartData.length === 0 || chartData.every((d) => d.count === 0) ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No join data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number | undefined) => [value ?? 0, 'Doctors']}
              />
              <Bar
                dataKey="count"
                fill="var(--aip-teal)"
                radius={[8, 8, 0, 0]}
                stroke="var(--aip-teal)"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
