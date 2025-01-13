/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

type MessageType = 'text' | 'file';

interface Message {
  type: MessageType;
  sender: string;
  content: string;
  fileName?: string;
}

export function usePeerConnection(peerId: string) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<{ [peerId: string]: DataConnection }>({});
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const newPeer = new Peer(peerId);

    newPeer.on('open', () => {
      setConnectionStatus('connected');
      setPeer(newPeer);
    });

    newPeer.on('connection', handleConnection);

    newPeer.on('error', (err) => {
      console.error('Peer connection error:', err);
      setConnectionStatus('disconnected');
    });

    return () => {
      newPeer.destroy();
    };
  }, [peerId]);

  const handleConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      setConnections((prevConnections) => ({ ...prevConnections, [conn.peer]: conn }));
      setConnectedPeers((prevPeers) => [...prevPeers, conn.peer]);
    });

    conn.on('data', (data: any) => {
      const message: Message = {
        type: data.type,
        sender: conn.peer,
        content: data.content,
        fileName: data.fileName,
      };
      setChatHistory((prevHistory) => [...prevHistory, message]);
    });

    conn.on('close', () => {
      setConnections((prevConnections) => {
        const newConnections = { ...prevConnections };
        delete newConnections[conn.peer];
        return newConnections;
      });
      setConnectedPeers((prevPeers) => prevPeers.filter((p) => p !== conn.peer));
    });
  }, []);

  const connectToPeer = useCallback((remotePeerId: string) => {
    if (peer && !connections[remotePeerId]) {
      const conn = peer.connect(remotePeerId);
      handleConnection(conn);
    }
  }, [peer, connections, handleConnection]);

  const sendMessage = useCallback((content: string, type: MessageType = 'text', fileName?: string) => {
    const message: Message = { type, sender: peerId, content, fileName };
    Object.values(connections).forEach((conn) => {
      conn.send(message);
    });
    setChatHistory((prevHistory) => [...prevHistory, message]);
  }, [connections, peerId]);

  const sendFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        sendMessage(event.target.result as string, 'file', file.name);
      }
    };
    reader.readAsDataURL(file);
  }, [sendMessage]);

  return {
    connectionStatus,
    connectedPeers,
    chatHistory,
    connectToPeer,
    sendMessage,
    sendFile,
  };
}

