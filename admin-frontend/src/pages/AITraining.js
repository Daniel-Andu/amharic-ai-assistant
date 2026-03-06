import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Brain, CheckCircle, Clock, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const AITraining = () => {
    const [trainingStatus, setTrainingStatus] = useState('up-to-date');
    const [version, setVersion] = useState('v3 (April 2024)');

    const handleRetrainAI = () => {
        toast.success('AI retraining initiated');
        setTrainingStatus('training');

        // Simulate training completion
        setTimeout(() => {
            setTrainingStatus('completed');
            toast.success('AI training completed successfully');
        }, 5000);
    };

    return (
        <Layout title="AI Training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Training Status */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Training Status</h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="font-medium text-gray-800">Current Status</p>
                                    <p className="text-sm text-gray-600">Up-to-Date</p>
                                </div>
                            </div>
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                {version}
                            </span>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-4">Training Data Summary</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Documents</p>
                                    <p className="text-2xl font-bold text-gray-800">12</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">FAQs</p>
                                    <p className="text-2xl font-bold text-gray-800">45</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Company Info</p>
                                    <p className="text-2xl font-bold text-gray-800">8</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-800">April 15, 2024</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRetrainAI}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Re-Train AI Model
                        </button>
                    </div>
                </div>

                {/* Version History */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Version History</h3>

                    <div className="space-y-4">
                        {[
                            { version: 'v3', date: 'April 2024', status: 'active' },
                            { version: 'v2', date: 'March 2024', status: 'inactive' },
                            { version: 'v1', date: 'February 2024', status: 'inactive' },
                        ].map((v) => (
                            <div
                                key={v.version}
                                className={`p-3 rounded-lg border ${v.status === 'active'
                                        ? 'border-primary-200 bg-primary-50'
                                        : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-800">{v.version}</span>
                                    {v.status === 'active' && (
                                        <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{v.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Accuracy Monitoring */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Accuracy Monitoring</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
                        <p className="text-2xl font-bold text-gray-800">85%</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Flagged Responses</p>
                        <p className="text-2xl font-bold text-gray-800">12</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Corrections Made</p>
                        <p className="text-2xl font-bold text-gray-800">8</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-800">92%</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AITraining;
