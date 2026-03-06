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

function App() {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated() ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="App">
                <Toaster position="top-right" />
                <Routes>
                    {/* Login Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/conversations"
                        element={
                            <ProtectedRoute>
                                <ConversationLogs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/top-questions"
                        element={
                            <ProtectedRoute>
                                <TopQuestions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/knowledge-base"
                        element={
                            <ProtectedRoute>
                                <KnowledgeBase />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ai-training"
                        element={
                            <ProtectedRoute>
                                <AITraining />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user-stats"
                        element={
                            <ProtectedRoute>
                                <UserStats />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Redirect */}
                    <Route path="/" element={
                        isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
