"use client";
import { ChatApp } from "@/components/custom/chat-box";

export default function Home() {
  const peerId = Math.random().toString(36).substr(2, 9);
  return (
    <div className="App">
      <ChatApp peerId={peerId} />
    </div>
  );
}