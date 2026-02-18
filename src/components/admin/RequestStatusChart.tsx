'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getRequestStatusDistribution, StatusData } from '@/lib/adminAnalytics';

interface RequestStatusChartProps {
  requests: AdminJoinRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#3B82F6',
  'Under Review': '#F59E0B',
  Approved: '#10B981',
  Rejected: '#EF4444',
};

export function RequestStatusChart({ requests }: RequestStatusChartProps) {
  const chartData = useMemo(() => getRequestStatusDistribution(requests), [requests]);

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Request Status Distribution</CardTitle>
        <FileText className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <p>No request data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.status}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || '#9CA3AF'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: number | undefined) => [value ?? 0, 'Requests']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const data = chartData.find((d) => d.status === value);
                  return `${value} (${data?.count || 0})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
