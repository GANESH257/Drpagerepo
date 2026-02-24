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
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 border-b border-gray-100">
        <div>
          <CardTitle className="text-base font-semibold text-gray-900">Doctors per department</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Physicians by specialty (API data)</p>
        </div>
        <Building2 className="h-5 w-5 text-[#0F5FA8]" />
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F5FA8] border-t-transparent" />
            <p className="text-sm">Loading department data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 gap-2">
            <Building2 className="h-12 w-12 text-gray-300" />
            <p className="text-sm">No department data available</p>
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
                tick={{ fontSize: 11, fill: '#374151' }}
                stroke="#9ca3af"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: 600, color: '#1f2937' }}
                formatter={(value: number | undefined) => [value ?? 0, 'Doctors']}
              />
              <Bar
                dataKey="count"
                fill="#0F5FA8"
                radius={[0, 8, 8, 0]}
                stroke="#0F5FA8"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
