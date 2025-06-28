
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', value: 20 },
  { month: 'Feb', value: 40 },
  { month: 'Mar', value: 30 },
  { month: 'Apr', value: 50 },
  { month: 'May', value: 60 },
  { month: 'Jun', value: 90 },
  { month: 'Jul', value: 45 },
  { month: 'Aug', value: 35 },
  { month: 'Sep', value: 25 },
];

const projectData = [
  { name: 'Project Done', value: 137, color: '#10B981' },
  { name: 'Project Task', value: 123, color: '#3B82F6' },
  { name: 'Project Due', value: 84, color: '#F59E0B' },
];

const ChartsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Graphs and Analysis</h3>
            <p className="text-sm text-muted-foreground">Projects completed per month based on trends.</p>
          </div>
          <select className="px-3 py-1 text-sm border border-border rounded-lg bg-background">
            <option>Month</option>
            <option>Week</option>
            <option>Year</option>
          </select>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              <YAxis hide />
              <Bar 
                dataKey="value" 
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performance */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top Performance</h3>
            <p className="text-sm text-muted-foreground">Best performing employee ranking.</p>
          </div>
          <select className="px-3 py-1 text-sm border border-border rounded-lg bg-background">
            <option>Augustus</option>
            <option>September</option>
            <option>October</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { name: 'Maryna', position: '1st', avatar: 'M' },
            { name: 'Jonathan', position: '2nd', avatar: 'J' },
            { name: 'Yasmine', position: '3rd', avatar: 'Y' },
            { name: 'Ronald', position: '4th', avatar: 'R' },
          ].map((person, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">{person.avatar}</span>
              </div>
              <div className="text-lg font-bold text-foreground">{person.position}</div>
              <div className="text-sm text-muted-foreground">{person.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
