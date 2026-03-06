import React from 'react';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const UserStats = () => {
    const dailyData = [
        { date: 'Mon', chats: 45 },
        { date: 'Tue', chats: 52 },
        { date: 'Wed', chats: 38 },
        { date: 'Thu', chats: 61 },
        { date: 'Fri', chats: 55 },
        { date: 'Sat', chats: 28 },
        { date: 'Sun', chats: 32 },
    ];

    const hourlyData = [
        { hour: '00:00', count: 5 },
        { hour: '04:00', count: 2 },
        { hour: '08:00', count: 25 },
        { hour: '12:00', count: 45 },
        { hour: '16:00', count: 38 },
        { hour: '20:00', count: 15 },
    ];

    return (
        <Layout title="User Statistics">
            <div className="space-y-6">
                {/* Daily Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Daily Activity (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="chats" fill="#2196f3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Hourly Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Hourly Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#2196f3" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* User Engagement Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h4 className="text-sm text-gray-600 mb-2">Avg Session Duration</h4>
                        <p className="text-3xl font-bold text-gray-800">4.5 min</p>
                        <p className="text-sm text-green-600 mt-1">↑ 12% from last week</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h4 className="text-sm text-gray-600 mb-2">Avg Messages per Session</h4>
                        <p className="text-3xl font-bold text-gray-800">6.2</p>
                        <p className="text-sm text-green-600 mt-1">↑ 8% from last week</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h4 className="text-sm text-gray-600 mb-2">User Satisfaction</h4>
                        <p className="text-3xl font-bold text-gray-800">4.6/5</p>
                        <p className="text-sm text-gray-500 mt-1">Based on feedback</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserStats;
