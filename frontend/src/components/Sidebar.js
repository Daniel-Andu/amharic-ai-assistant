import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    HelpCircle,
    BookOpen,
    Brain,
    BarChart3,
    Settings,
    LogOut,
    Bot
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/conversations', icon: MessageSquare, label: 'Conversation Logs' },
        { path: '/admin/top-questions', icon: HelpCircle, label: 'Top Questions' },
        { path: '/admin/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
        { path: '/admin/ai-training', icon: Brain, label: 'AI Training' },
        { path: '/admin/user-stats', icon: BarChart3, label: 'User Stats' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    return (
        <div className="w-64 bg-primary-700 text-white h-screen fixed left-0 top-0 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-primary-800 flex items-center gap-3">
                <Bot className="w-8 h-8" />
                <div>
                    <h1 className="text-lg font-bold">AI Assistant System</h1>
                    <p className="text-xs text-primary-200">Admin Dashboard</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive
                                ? 'bg-primary-600 border-l-4 border-white'
                                : 'hover:bg-primary-600'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 hover:bg-primary-600 transition-colors border-t border-primary-600"
            >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
