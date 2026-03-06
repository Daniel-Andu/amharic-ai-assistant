import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConversationLogs from './pages/ConversationLogs';
import TopQuestions from './pages/TopQuestions';
import KnowledgeBase from './pages/KnowledgeBase';
import AITraining from './pages/AITraining';
import UserStats from './pages/UserStats';
import Settings from './pages/Settings';
import ChatWidget from './components/ChatWidget';

function App() {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated() ? children : <Navigate to="/admin/login" />;
    };

    return (
        <Router>
            <div className="App">
                <Toaster position="top-right" />
                <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/conversations"
                        element={
                            <ProtectedRoute>
                                <ConversationLogs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/top-questions"
                        element={
                            <ProtectedRoute>
                                <TopQuestions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/knowledge-base"
                        element={
                            <ProtectedRoute>
                                <KnowledgeBase />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/ai-training"
                        element={
                            <ProtectedRoute>
                                <AITraining />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/user-stats"
                        element={
                            <ProtectedRoute>
                                <UserStats />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Customer Routes */}
                    <Route path="/" element={<ChatWidget />} />
                    <Route path="/chat" element={<ChatWidget />} />

                    {/* Redirects */}
                    <Route path="/admin" element={
                        isAuthenticated() ? <Navigate to="/admin/dashboard" /> : <Navigate to="/admin/login" />
                    } />
                    <Route path="/login" element={<Navigate to="/admin/login" />} />
                    <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
