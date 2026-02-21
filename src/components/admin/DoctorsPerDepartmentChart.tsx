'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Doctors Per Department</CardTitle>
        <Building2 className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Loading department data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No department data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
              />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                stroke="#9ca3af"
                width={120}
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
                fill="#1A4B7F"
                radius={[0, 8, 8, 0]}
                stroke="#1A4B7F"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
