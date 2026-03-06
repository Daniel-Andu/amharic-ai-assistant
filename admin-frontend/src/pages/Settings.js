import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Save, User, Lock, Bell, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [settings, setSettings] = useState({
        username: 'Admin',
        email: 'admin@aiassistant.com',
        notifications: true,
        emailAlerts: false,
        language: 'en',
        timezone: 'UTC+3'
    });

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    return (
        <Layout title="Settings">
            <div className="max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm">
                    {/* Profile Settings */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Profile Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={settings.username}
                                    onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <Lock className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Security</h3>
                        </div>

                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Change Password
                        </button>
                    </div>

                    {/* Notification Settings */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span className="text-gray-700">Push Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-gray-700">Email Alerts</span>
                                <input
                                    type="checkbox"
                                    checked={settings.emailAlerts}
                                    onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">System</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interface Language
                                </label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="en">English</option>
                                    <option value="am">አማርኛ (Amharic)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="UTC+3">East Africa Time (UTC+3)</option>
                                    <option value="UTC">UTC</option>
                                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="p-6 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={handleSave}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
