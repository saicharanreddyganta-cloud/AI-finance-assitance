import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello Rahul! 👋 I am your **FinSight AI Financial Assistant**.\n\nI have complete, secure access to your live transactions, category breakdowns, goals, and savings data. Ask me anything about your money, such as *'How much did I spend on food this month?'* or *'Where am I overspending?'*",
      suggested_actions: [
        'How much did I spend on food this month?',
        'Where am I overspending?',
        'Compare this month with last month',
        'How much can I save next month?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.content,
        suggested_actions: res.data.suggested_actions || []
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble analyzing your database records right now. Please try again in a few moments."
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedClick = (prompt) => {
    handleSend(prompt);
  };

  const formatMessage = (content) => {
    // Basic Markdown bold & bullet formatting
    return content.split('\n').map((line, lineIdx) => {
      // Bold handling
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span
          key={lineIdx}
          className="block min-h-[1.2em]"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>AI Financial Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider">
                  Database Grounded
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Ask anything about your income, spending habits, forecasts, or optimization levers.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome-reset',
                  role: 'assistant',
                  content:
                    "Session refreshed! How can I assist with your personal finances today?",
                  suggested_actions: [
                    'How much did I spend this month?',
                    'What is my biggest expense?',
                    'How can I reduce my expenses?'
                  ]
                }
              ])
            }
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-card p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isBot
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-sm'
                    : 'bg-slate-800'
                }`}
              >
                {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
                      : 'bg-brand-600 text-white shadow-sm'
                  }`}
                >
                  {formatMessage(msg.content)}
                </div>

                {/* Suggested Follow-up Actions (Bot Only) */}
                {isBot && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggested_actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedClick(action)}
                        className="px-3 py-1 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 transition-colors shadow-2xs"
                      >
                        {action} &rarr;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-xs text-slate-400 font-medium ml-1">Analyzing financial database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g. 'Where am I overspending?', 'How much did I spend on food?')..."
            className="w-full pl-5 pr-14 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 p-2 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white rounded-xl shadow-md transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>FinSight AI provides educational personal finance insights and analytics, not accredited investment advice.</span>
        </p>
      </div>
    </div>
  );
};
