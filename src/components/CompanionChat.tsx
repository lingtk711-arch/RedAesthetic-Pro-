import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareHeart,
  Send,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  User,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage } from '../types';

export const CompanionChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `哈喽姐妹！我是你的【美商打卡搭子 / 审美陪伴官】🌱✨

不管你是正在为方圆脸发型发愁、想把黄黑皮调理得透亮有光泽，还是在小红书起号遇到瓶颈、不知道怎么把文案写得更有闺蜜呼吸感——随时跟我聊！

拒绝居高临下的说教，拒绝空洞鸡汤，我们只聊拿来即用的实用变美经验与小红书合规运营心得～ 今天你想聊哪方面呢？`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const icebreakers = [
    '0粉起号前7天，零点赞零阅读该怎么调整心态与内容？',
    '方圆脸到底适不适合剪齐刘海？怎样借发丝修饰骨骼？',
    '如何用莫兰迪淡粉+淡绿打造高质感的小红书封面？',
    '我的文案总被说“AI味很重”，怎样改得像真闺蜜说话？',
    '早八10分钟出门，有哪些低成本拔高气质的小习惯？',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || '对话失败');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `抱歉姐妹，网络刚刚晃了一下：${err.message}，再发一次试试～`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 bg-gradient-to-r from-[#EBF3EE] via-[#FCF4F5] to-[#F5E6E5] rounded-3xl border border-[#DFECE4] shadow-morandi flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#557764] shadow-xs">
            <MessageSquareHeart className="w-5 h-5 text-[#8EA89D]" />
          </div>
          <div>
            <h3 className="font-serif-sc font-bold text-base text-[#263C2E]">
              美商打卡搭子 · 审美陪伴官专属交流室
            </h3>
            <p className="text-xs text-[#5D7769]">
              真诚同频 · 拒绝说教 · 审美疑难与运营卡点即问即答
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#7DA28B] border border-[#D3E4DB]">
          在线同频陪伴中
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {icebreakers.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-[#F2F7F4] border border-[#DDE8E1] text-[#3D5C4A] shadow-2xs transition-colors cursor-pointer"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4 min-h-[460px] max-h-[600px] overflow-y-auto">
        {messages.map((m) => {
          const isBot = m.role === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isBot
                    ? 'bg-gradient-to-tr from-[#8EA89D] to-[#E8BCBE] text-white shadow-xs'
                    : 'bg-[#2F4235] text-white'
                }`}
              >
                {isBot ? '🌱' : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl flex flex-col gap-2 ${
                  isBot
                    ? 'bg-[#FAFBF9] border border-[#E3EDE6] text-gray-800'
                    : 'bg-[#6E947C] text-white'
                }`}
              >
                <div className="text-xs leading-relaxed whitespace-pre-wrap font-normal selection:bg-[#E8F1EC]">
                  {m.content}
                </div>

                {isBot && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="text-[10px] text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#558064]" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>复制解答</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8EA89D] to-[#E8BCBE] flex items-center justify-center text-white text-xs font-bold">
              🌱
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E3EDE6] text-xs text-gray-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8EA89D]" />
              <span>美商搭子正在打字回复你…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex items-center gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="问问美商搭子：关于选题、封面、文案语气或日常变美心得…"
          className="flex-1 px-3 py-2 text-xs text-gray-800 bg-transparent focus:outline-none resize-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-2xl bg-[#6E947C] hover:bg-[#5C8169] text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
