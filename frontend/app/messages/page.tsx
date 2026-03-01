"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Search, MoreVertical, Paperclip, Smile } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "@/lib/mockData";
import { TRUNCATE_WALLET } from "@/lib/constants";
import type { Message } from "@/lib/types";

const MY_WALLET = "Dev1WaLLet1111111111111111111111111111111111";

export default function MessagesPage() {
  const { publicKey } = useWallet();
  const [activeConvId, setActiveConvId] = useState<string>(MOCK_CONVERSATIONS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myWallet = publicKey?.toBase58() ?? MY_WALLET;
  const activeConv = MOCK_CONVERSATIONS.find((c) => c.id === activeConvId);
  const activeMessages = messages[activeConvId] ?? [];

  const otherParticipantName = activeConv
    ? activeConv.participantNames?.find(
        (_, i) => activeConv.participants[i] !== myWallet
      ) ?? TRUNCATE_WALLET(activeConv.participants.find((p) => p !== myWallet) ?? "")
    : "";

  const filteredConversations = MOCK_CONVERSATIONS.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.jobTitle?.toLowerCase().includes(q) ||
      c.participantNames?.some((n) => n.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvId,
      senderWallet: myWallet,
      senderName: "You",
      content: input.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] ?? []), newMsg],
    }));
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0d0a1a] flex">
      {/* Conversation list */}
      <aside className="w-72 shrink-0 border-r border-purple-900/30 bg-[#12091f] flex flex-col hidden sm:flex">
        <div className="p-4 border-b border-purple-900/20">
          <h2 className="text-base font-semibold text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-purple-900/40 bg-[#1a0f2e] pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const otherName =
              conv.participantNames?.find((_, i) => conv.participants[i] !== myWallet) ??
              TRUNCATE_WALLET(conv.participants.find((p) => p !== myWallet) ?? "");
            const isActive = conv.id === activeConvId;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-4 border-b border-purple-900/10 hover:bg-white/5 transition-colors ${
                  isActive ? "bg-purple-900/20 border-l-2 border-l-purple-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {otherName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">{otherName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-purple-600 text-[10px] text-white flex items-center justify-center shrink-0 ml-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.jobTitle && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.jobTitle}</p>
                    )}
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        {activeConv && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-900/30 bg-[#12091f]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                {otherParticipantName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{otherParticipantName}</p>
                {activeConv.jobTitle && (
                  <p className="text-xs text-gray-500">{activeConv.jobTitle}</p>
                )}
              </div>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeMessages.map((msg) => {
            const isMe = msg.senderWallet === myWallet;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}
              >
                {!isMe && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                    {(msg.senderName ?? "?")[0]}
                  </div>
                )}
                <div className={`max-w-xs sm:max-w-md lg:max-w-lg`}>
                  {!isMe && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-[#1a0f2e] text-gray-200 border border-purple-900/30 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[11px] text-gray-600 mt-1 ${isMe ? "text-right" : "ml-1"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* XMTP notice */}
        <div className="px-5 py-2 bg-purple-900/10 border-t border-purple-900/20">
          <p className="text-xs text-purple-400/60 text-center">
            🔒 End-to-end encrypted via XMTP protocol (UI preview)
          </p>
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-purple-900/30 bg-[#12091f]">
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-400 transition-colors shrink-0">
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-purple-900/40 bg-[#1a0f2e] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
            />
            <button className="text-gray-600 hover:text-gray-400 transition-colors shrink-0">
              <Smile className="h-5 w-5" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="h-10 w-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
