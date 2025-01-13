import { usePeerConnection } from '@/hooks/use-peer';
import React, { useState, useRef } from 'react';

interface ChatAppProps {
  peerId: string;
}

export const ChatApp: React.FC<ChatAppProps> = ({ peerId }) => {
  const {
    connectionStatus,
    connectedPeers,
    chatHistory,
    connectToPeer,
    sendMessage,
    sendFile,
  } = usePeerConnection(peerId);

  const [message, setMessage] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFile(file);
    }
  };

  const handleConnectToPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (remotePeerId.trim()) {
      connectToPeer(remotePeerId);
      setRemotePeerId('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PeerJS Chat App</h1>
      <div className="mb-4">
        <p>Your Peer ID: {peerId}</p>
        <p>Status: {connectionStatus}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Connected Peers</h2>
        <ul>
          {connectedPeers.map((peer) => (
            <li key={peer}>{peer}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleConnectToPeer} className="mb-4">
        <input
          type="text"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          placeholder="Enter remote Peer ID"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Connect
        </button>
      </form>
      <div className="mb-4 h-64 overflow-y-auto border p-2">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === peerId ? 'text-right' : 'text-left'}`}>
            <span className="font-semibold">{msg.sender}: </span>
            {msg.type === 'text' ? (
              msg.content
            ) : (
              <a href={msg.content} download={msg.fileName} className="text-blue-500 underline">
                {msg.fileName}
              </a>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2">
          Send
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          placeholder='ok'
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Send File
        </button>
      </form>
    </div>
  );
};

