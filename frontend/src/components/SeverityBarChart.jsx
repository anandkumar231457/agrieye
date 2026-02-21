import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const SeverityBarChart = ({ data }) => {
    // Mock data if none provided
    const chartData = data || [
        { name: 'Healthy', val: 65, color: '#2ECC71' },
        { name: 'Warning', val: 25, color: '#F1C40F' },
        { name: 'Critical', val: 10, color: '#E74C3C' },
    ];

    return (
        <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F5E9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }}
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: '#E8F5E9', opacity: 0.5 }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Bar dataKey="val" radius={[6, 6, 6, 6]} barSize={40}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SeverityBarChart;
