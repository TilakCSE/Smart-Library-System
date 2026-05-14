"use client";

import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { date: "Apr 1", activity: 120 },
  { date: "Apr 3", activity: 80 },
  { date: "Apr 5", activity: 320 },
  { date: "Apr 7", activity: 150 },
  { date: "Apr 9", activity: 350 },
  { date: "Apr 11", activity: 180 },
  { date: "Apr 13", activity: 290 },
  { date: "Apr 15", activity: 160 },
  { date: "Apr 18", activity: 390 },
];

export function LineChart() {
  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}m`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#a855f7' }}
          />
          {/* The Glowing Purple Line */}
          <Line 
            type="monotone" 
            dataKey="activity" 
            stroke="#a855f7" 
            strokeWidth={3} 
            dot={false}
            style={{
              filter: "drop-shadow(0px 0px 8px rgba(168, 85, 247, 0.5))"
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}