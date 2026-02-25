'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
    <div className="glass-card p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Request Status Distribution</h3>
        <FileText className="h-4 w-4 text-[var(--aip-teal)]" />
      </div>
      <div className="pt-2">
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
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#0f172a',
                }}
                itemStyle={{ color: '#0f172a' }}
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
      </div>
    </div>
  );
}
