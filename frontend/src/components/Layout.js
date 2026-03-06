import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, title }) => {
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    // Load notifications (mock data for now - you can connect to API later)
    useEffect(() => {
        // Mock notifications - replace with API call
        setNotifications([
            { id: 1, message: 'New conversation started', time: '5 min ago', unread: true },
            { id: 2, message: 'FAQ updated successfully', time: '1 hour ago', unread: true },
            { id: 3, message: 'System backup completed', time: '2 hours ago', unread: false },
        ]);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to conversations with search query
            navigate(`/admin/conversations?search=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ));
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 ml-64">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

                    <div className="flex items-center gap-4">
                        {/* Notifications Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 hover:bg-gray-100 rounded-lg relative"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {notification.unread && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-800">{notification.message}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-gray-200 text-center">
                                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar (Expandable) */}
                {showSearch && (
                    <div className="bg-white border-b border-gray-200 px-8 py-4">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations, FAQs, users..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchQuery('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {/* Main Content */}
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
