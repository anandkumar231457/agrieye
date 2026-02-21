import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const EnvironmentalChart = ({ currentData }) => {
    const [activeTab, setActiveTab] = useState('temp'); // temp | humidity

    // Generate dynamic trend based on current data (or fallback to mock)
    const generateTrend = () => {
        const endTemp = currentData?.temperature || 24;
        const endHum = currentData?.humidity || 65;

        const points = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const t = new Date(now.getTime() - i * 60 * 60 * 1000); // Past 6 hours
            const timeStr = t.getHours() + ':00';

            // Random variation for past data, exact value for last point
            const isLast = i === 0;
            const tempVar = isLast ? 0 : (Math.random() * 4 - 2);
            const humVar = isLast ? 0 : (Math.random() * 10 - 5);

            points.push({
                time: timeStr,
                temp: Math.round(endTemp - (i * 0.5) + tempVar), // Slight trend
                humidity: Math.round(endHum + (i * 0.5) + humVar)
            });
        }
        return points;
    };

    const data = generateTrend();

    return (
        <div className="bg-white rounded-[3.5rem] shadow-organic border border-gray-50 p-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Environmental Trend</h4>
                    <p className="text-2xl font-black text-brand-dark tracking-tighter">Field Conditions</p>
                </div>
                <div className="flex bg-gray-50 rounded-full p-1 border border-gray-100">
                    <button
                        onClick={() => setActiveTab('temp')}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'temp' ? 'bg-white shadow-sm text-brand-deep' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Temp
                    </button>
                    <button
                        onClick={() => setActiveTab('humidity')}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'humidity' ? 'bg-white shadow-sm text-brand-deep' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Humidity
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F5E9" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey={activeTab === 'temp' ? 'temp' : 'humidity'}
                            stroke={activeTab === 'temp' ? '#E74C3C' : '#2ECC71'}
                            strokeWidth={4}
                            dot={{ fill: activeTab === 'temp' ? '#E74C3C' : '#2ECC71', r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 8 }}
                            animationDuration={2000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EnvironmentalChart;
