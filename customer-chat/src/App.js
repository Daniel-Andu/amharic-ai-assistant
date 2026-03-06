import React from 'react';
import { Toaster } from 'react-hot-toast';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <ChatWidget />
    </div>
  );
}

export default App;
