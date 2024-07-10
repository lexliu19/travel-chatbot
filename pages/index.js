import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    setChatLog([...chatLog, { user: userInput, bot: '🤔...' }]);
    const currentUserInput = userInput;
    setUserInput('');

    try {
      const response = await axios.post('/api/ask', {
        question: currentUserInput,
      });

      setChatLog((prevChatLog) =>
        prevChatLog.map((entry, index) =>
          index === prevChatLog.length - 1
            ? { ...entry, bot: response.data.answer }
            : entry
        )
      );
    } catch (error) {
      console.error('Error fetching the answer:', error);
      setChatLog((prevChatLog) =>
        prevChatLog.map((entry, index) =>
          index === prevChatLog.length - 1
            ? {
                ...entry,
                bot: 'Sorry, something went wrong. Please try again.',
              }
            : entry
        )
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 pt-4 pb-4 fixed top-0 bg-indigo-500 text-white w-full text-center">
        Travel Agent Chatbot
      </h1>
      <div className="flex flex-col items-center w-full max-w-3xl mt-20 mb-20 space-y-4 overflow-auto">
        {chatLog.length >= 1 && (
          <div className="w-full bg-white pt-4 pb-4 pl-10 pr-10 rounded-lg shadow-lg">
            {chatLog.map((entry, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-end">
                  <p className="bg-blue-100 text-gray-800 p-3 rounded-lg shadow-sm w-fit max-w-xs">
                    <strong>❓:</strong> {entry.user}
                  </p>
                </div>
                <div className="flex justify-start">
                  <p className="bg-gray-100 text-gray-800 p-3 rounded-lg shadow-sm w-fit max-w-xs">
                    <strong>🤖:</strong> {entry.bot}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-4 w-full flex justify-center p-4">
        <div className="flex w-full max-w-md items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your travel question..."
            className="flex-1 px-4 py-2 border border-gray-200 bg-slate-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
