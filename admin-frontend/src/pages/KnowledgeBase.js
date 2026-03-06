import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { knowledgeAPI } from '../services/api';
import { Upload, FileText, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const KnowledgeBase = () => {
    const [documents, setDocuments] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('documents');
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [faqForm, setFaqForm] = useState({
        question_am: '',
        answer_am: '',
        question_en: '',
        answer_en: '',
        category: '',
        priority: 0
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'documents') {
                const response = await knowledgeAPI.getDocuments();
                setDocuments(response.data.documents);
            } else {
                const response = await knowledgeAPI.getFAQs();
                setFaqs(response.data.faqs);
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        try {
            await knowledgeAPI.uploadDocument(formData);
            toast.success('Document uploaded successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await knowledgeAPI.deleteDocument(id);
            toast.success('Document deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const handleCreateFAQ = async (e) => {
        e.preventDefault();
        try {
            await knowledgeAPI.createFAQ(faqForm);
            toast.success('FAQ created successfully');
            setShowFAQModal(false);
            setFaqForm({
                question_am: '',
                answer_am: '',
                question_en: '',
                answer_en: '',
                category: '',
                priority: 0
            });
            fetchData();
        } catch (error) {
            toast.error('Failed to create FAQ');
        }
    };

    const handleDeleteFAQ = async (id) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

        try {
            await knowledgeAPI.deleteFAQ(id);
            toast.success('FAQ deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete FAQ');
        }
    };

    return (
        <Layout title="Knowledge Base">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'documents'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Documents
                </button>
                <button
                    onClick={() => setActiveTab('faqs')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'faqs'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    FAQs
                </button>
            </div>

            {/* Documents Tab */}
            {activeTab === 'documents' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Training Documents</h3>
                        <label className="bg-primary-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-700 transition-colors flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload New File
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.docx,.txt"
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary-600" />
                                    <div>
                                        <p className="font-medium text-gray-800">{doc.original_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(doc.file_size / 1024).toFixed(2)} KB •
                                            {format(new Date(doc.upload_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h3>
                        <button
                            onClick={() => setShowFAQModal(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add FAQ
                        </button>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 amharic-text">{faq.question_am}</p>
                                        {faq.question_en && (
                                            <p className="text-sm text-gray-600 mt-1">{faq.question_en}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFAQ(faq.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-gray-700 mt-2 amharic-text">{faq.answer_am}</p>
                                {faq.category && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {faq.category}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FAQ Modal */}
            {showFAQModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4">Add New FAQ</h3>
                        <form onSubmit={handleCreateFAQ} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question (Amharic) *
                                </label>
                                <input
                                    type="text"
                                    value={faqForm.question_am}
                                    onChange={(e) => setFaqForm({ ...faqForm, question_am: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 amharic-text"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Answer (Amharic) *
                                </label>
                                <textarea
                                    value={faqForm.answer_am}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer_am: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 amharic-text"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question (English)
                                </label>
                                <input
                                    type="text"
                                    value={faqForm.question_en}
                                    onChange={(e) => setFaqForm({ ...faqForm, question_en: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Answer (English)
                                </label>
                                <textarea
                                    value={faqForm.answer_en}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer_en: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    rows="4"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={faqForm.category}
                                        onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <input
                                        type="number"
                                        value={faqForm.priority}
                                        onChange={(e) => setFaqForm({ ...faqForm, priority: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowFAQModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Create FAQ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default KnowledgeBase;
