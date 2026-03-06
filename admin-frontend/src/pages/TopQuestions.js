import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import { TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TopQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('all');

    useEffect(() => {
        fetchTopQuestions();
    }, [language]);

    const fetchTopQuestions = async () => {
        try {
            const params = language !== 'all' ? { language, limit: 50 } : { limit: 50 };
            const response = await dashboardAPI.getTopQuestions(params);
            setQuestions(response.data.topQuestions);
        } catch (error) {
            toast.error('Failed to fetch top questions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Top Questions">
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Most Asked Questions</h3>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Languages</option>
                            <option value="am">Amharic</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div
                                key={q.id || index}
                                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-600 rounded-full font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium text-gray-800 ${q.language === 'am' ? 'amharic-text' : ''}`}>
                                        {q.question}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            Asked {q.ask_count} times
                                        </span>
                                        <span>
                                            Last asked: {format(new Date(q.last_asked), 'MMM dd, yyyy')}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                            {q.language === 'am' ? 'Amharic' : 'English'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TopQuestions;
