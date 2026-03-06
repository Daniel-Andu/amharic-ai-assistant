import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import { MessageSquare, FileText, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Dashboard">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={MessageSquare}
                    title="Total Chats"
                    value={stats?.totalChats?.toLocaleString() || '0'}
                    color="bg-blue-500"
                    subtitle="All time conversations"
                />
                <StatCard
                    icon={FileText}
                    title="Total Messages"
                    value={stats?.totalMessages?.toLocaleString() || '0'}
                    color="bg-green-500"
                    subtitle="Messages exchanged"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Avg Confidence"
                    value={`${stats?.avgConfidence || '0'}%`}
                    color="bg-orange-500"
                    subtitle="AI response accuracy"
                />
                <StatCard
                    icon={Users}
                    title="Escalation Rate"
                    value={`${stats?.escalationRate || '0'}%`}
                    color="bg-red-500"
                    subtitle="Transferred to human"
                />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Activity</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">New Conversations</span>
                            <span className="font-semibold text-gray-800">{stats?.todayChats || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Sessions</span>
                            <span className="font-semibold text-gray-800">
                                {Math.floor((stats?.todayChats || 0) * 0.3)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Language Usage */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Language Usage</h3>
                    <div className="space-y-3">
                        {stats?.languageStats?.map((lang) => (
                            <div key={lang.language} className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    {lang.language === 'am' ? 'Amharic (አማርኛ)' : 'English'}
                                </span>
                                <span className="font-semibold text-gray-800">{lang.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
