'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockConversations = [
  { id: 1, name: 'Sujal Giri', avatar: 'SG', lastMessage: 'See you at 10 AM!', time: '2m ago', unread: 2 },
  { id: 2, name: 'Rahul Kumar', avatar: 'RK', lastMessage: 'Thanks for the ride', time: '1h ago', unread: 0 },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar - Conversation List (Desktop) */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r-2 border-gray-100`}>
        <div className="p-4 border-b-2 border-gray-100">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 border-b border-gray-100 ${
                selectedChat === conv.id ? 'bg-primary/5' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                {conv.avatar}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold truncate">{conv.name}</div>
                  <div className="text-xs text-gray-text">{conv.time}</div>
                </div>
                <div className="text-sm text-gray-text truncate">{conv.lastMessage}</div>
              </div>
              
              {conv.unread > 0 && (
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {conv.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Chat or Empty State */}
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b-2 border-gray-100 flex items-center gap-4">
              <button 
                onClick={() => setSelectedChat(null)}
                className="md:hidden text-primary"
              >
                ← Back
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                SG
              </div>
              <div className="flex-1">
                <div className="font-bold">Sujal Giri</div>
                <div className="text-xs text-gray-text">Online</div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex justify-start">
                  <div className="bg-white rounded-card px-4 py-3 max-w-xs shadow-sm">
                    <p>Hi! Are you still going to Jaunpur today?</p>
                    <div className="text-xs text-gray-text mt-1">10:30 AM</div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-card px-4 py-3 max-w-xs shadow-sm">
                    <p>Yes! Leaving at 10 AM sharp</p>
                    <div className="text-xs text-white/70 mt-1">10:31 AM</div>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-white rounded-card px-4 py-3 max-w-xs shadow-sm">
                    <p>Perfect! See you at 10 AM! 🚗</p>
                    <div className="text-xs text-gray-text mt-1">10:32 AM</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t-2 border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-input focus:border-primary outline-none"
                />
                <button className="btn-primary px-6">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="text-8xl mb-6">💬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start a Conversation</h3>
              <p className="text-gray-text max-w-md">
                Message a driver from ride details to discuss your journey
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
