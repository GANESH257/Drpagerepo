'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';
import { getDoctorsPerDepartment, DepartmentData } from '@/lib/adminAnalytics';

export function DoctorsPerDepartmentChart() {
  const [chartData, setChartData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDoctorsPerDepartment();
        setChartData(data);
      } catch (error) {
        console.error('Error loading department data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Doctors per department</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Physicians by specialty (API data)</p>
        </div>
        <Building2 className="h-5 w-5 text-[var(--aip-teal)]" />
      </div>
      <div className="pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--aip-teal)' }} />
            <p className="text-sm">Loading department data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
            <Building2 className="h-12 w-12 opacity-50" />
            <p className="text-sm">No department data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 11 }}
                className="text-foreground"
                width={120}
              />
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
                radius={[0, 8, 8, 0]}
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
