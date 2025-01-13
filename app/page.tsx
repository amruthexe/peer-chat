"use client";
import { useEffect, useState } from "react";
import { ChatApp } from "@/components/custom/chat-box";

export default function Home() {
  const [peerId, setPeerId] = useState("");

  useEffect(() => {
    // Generate the peerId only on the client side
    const id = Math.random().toString(36).substr(2, 9);
    setPeerId(id);
  }, []);

  // Wait for the peerId to be generated before rendering the ChatApp
  if (!peerId) return null;

  return (
    <div className="App">
      <ChatApp peerId={peerId} />
    </div>
  );
}
