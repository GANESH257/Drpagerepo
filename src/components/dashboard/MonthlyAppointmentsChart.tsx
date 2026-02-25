'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { AppointmentRequest } from '@/types';

interface MonthlyAppointmentsChartProps {
  appointments: AppointmentRequest[];
}

interface MonthlyData {
  month: string;
  count: number;
}

// Use only real appointment counts per month so chart matches dashboard data
function generateMonthlyAppointmentsData(appointments: AppointmentRequest[]): MonthlyData[] {
  const now = new Date();
  const months: MonthlyData[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();

    const count = appointments.filter((apt) => {
      const aptTime = new Date(apt.createdAt).getTime();
      return aptTime >= monthStart && aptTime <= monthEnd;
    }).length;

    months.push({ month: monthName, count });
  }

  return months;
}

export function MonthlyAppointmentsChart({ appointments }: MonthlyAppointmentsChartProps) {
  const chartData = useMemo(() => generateMonthlyAppointmentsData(appointments), [appointments]);

  return (
    <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">New Appointments Trend</CardTitle>
        <Calendar className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
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
              formatter={(value: number | undefined) => [value ?? 0, 'Appointments']}
            />
            <Bar
              dataKey="count"
              fill="#2EC4B6"
              radius={[8, 8, 0, 0]}
              stroke="#2EC4B6"
              strokeWidth={1}
              activeBar={{ fill: '#2EC4B6', stroke: '#0f172a', strokeWidth: 1 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
