import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import { Eye, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const ConversationLogs = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLanguage, setFilterLanguage] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationDetails, setConversationDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Check if there's a search query from URL
        const params = new URLSearchParams(location.search);
        const urlSearch = params.get('search');
        if (urlSearch) {
            setSearchQuery(urlSearch);
        }
    }, [location]);

    useEffect(() => {
        fetchConversations();
    }, [page, searchQuery, filterLanguage, filterStatus]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getConversations({
                page,
                limit: 20,
                search: searchQuery,
                language: filterLanguage !== 'all' ? filterLanguage : undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined
            });
            setConversations(response.data.conversations);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchConversations();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const viewConversationDetails = async (conversationId) => {
        try {
            setLoadingDetails(true);
            setSelectedConversation(conversationId);
            const response = await dashboardAPI.getConversationDetails(conversationId);
            // Backend returns { conversation, messages }
            setConversationDetails({
                ...response.data.conversation,
                messages: response.data.messages
            });
        } catch (error) {
            toast.error('Failed to load conversation details');
            setSelectedConversation(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedConversation(null);
        setConversationDetails(null);
    };

    return (
        <Layout title="Conversation Logs">
            <div className="bg-white rounded-xl shadow-sm">
                {/* Search and Filters */}
                <div className="p-6 border-b border-gray-200 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">All Conversations</h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by session ID, message content..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex gap-4 items-center">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <select
                            value={filterLanguage}
                            onChange={(e) => {
                                setFilterLanguage(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="all">All Languages</option>
                            <option value="am">Amharic</option>
                            <option value="en">English</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="escalated">Escalated</option>
                        </select>

                        {(searchQuery || filterLanguage !== 'all' || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterLanguage('all');
                                    setFilterStatus('all');
                                    setPage(1);
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No conversations found</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {conversations.map((conv) => (
                                    <tr key={conv.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                            {conv.session_id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(conv.started_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {conv.total_messages}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {conv.language === 'am' ? 'አማርኛ' : 'English'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${conv.escalated
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {conv.escalated ? 'Escalated' : 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => viewConversationDetails(conv.id)}
                                                className="text-primary-600 hover:text-primary-700"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Conversation Details Modal */}
            {selectedConversation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Conversation Details</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetails ? (
                                <div className="text-center py-8 text-gray-500">Loading conversation...</div>
                            ) : conversationDetails ? (
                                <div className="space-y-4">
                                    {/* Conversation Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Session ID:</span>
                                            <span className="text-sm font-mono text-gray-900">{conversationDetails.session_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Language:</span>
                                            <span className="text-sm text-gray-900">
                                                {conversationDetails.language === 'am' ? 'አማርኛ (Amharic)' : 'English'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Started:</span>
                                            <span className="text-sm text-gray-900">{formatDate(conversationDetails.started_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Messages:</span>
                                            <span className="text-sm text-gray-900">{conversationDetails.messages?.length || 0}</span>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-800">Messages:</h4>
                                        {conversationDetails.messages && conversationDetails.messages.length > 0 ? (
                                            conversationDetails.messages.map((msg, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg ${msg.sender === 'user'
                                                        ? 'bg-primary-50 ml-8'
                                                        : 'bg-gray-50 mr-8'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-xs font-medium ${msg.sender === 'user' ? 'text-primary-600' : 'text-gray-600'
                                                            }`}>
                                                            {msg.sender === 'user' ? '👤 User' : '🤖 AI Assistant'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(msg.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                                                    {msg.confidence && (
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Confidence: {(msg.confidence * 100).toFixed(0)}%
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No messages found</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">Failed to load conversation details</div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ConversationLogs;
