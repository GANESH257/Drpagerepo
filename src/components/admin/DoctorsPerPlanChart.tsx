'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getDoctorsPerPlan, PlanData } from '@/lib/adminAnalytics';

interface DoctorsPerPlanChartProps {
  requests: AdminJoinRequest[];
}

const COLORS = ['#2EC4B6', '#1A4B7F', '#F59E0B'];

export function DoctorsPerPlanChart({ requests }: DoctorsPerPlanChartProps) {
  const [chartData, setChartData] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDoctorsPerPlan(requests);
        setChartData(data);
      } catch (error) {
        console.error('Error loading plan data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requests]);

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">Doctors Per Plan</CardTitle>
        <Crown className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <p>Loading plan data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <p>No plan data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.plan}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: number | undefined) => [value ?? 0, 'Doctors']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const data = chartData.find((d) => d.plan === value);
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
