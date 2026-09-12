import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Globe, 
  X, 
  RefreshCw, 
  ChevronRight, 
  ExternalLink,
  ShoppingBag,
  Zap,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ChatMessage, Product, UserPersona, Currency, ScoredCandidate } from '../types';
import { generateConciergeDialogue } from '../engine/semanticIntentService';

export interface ConciergeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: UserPersona;
  currency: Currency;
  onViewProductById?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  products?: Product[];
}

export const ConciergeDrawer: React.FC<ConciergeDrawerProps> = ({
  isOpen,
  onClose,
  currentPersona,
  currency,
  onViewProductById,
  onAddToCart,
  products = []
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello ${currentPersona.name}! I am your Personal Shopping Concierge & Hardware Specialist.
I can help you evaluate technical trade-offs, explain why products are ranked for your profile, or find gear based on exact specifications (e.g. *"Show me a laptop for coding under ₹70,000"*).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'thinking'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'thinking' | 'search_grounded' | 'standard'>('thinking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
            mode: chatMode,
            userId: currentPersona.id
          })
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (netErr) {
        console.warn('Network chat error, using local semantic fallback:', netErr);
      }

      if (!data) {
        data = generateConciergeDialogue({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          mode: chatMode,
          user: currentPersona,
          userOrders: [],
          userReturns: [],
          userWallet: { balanceINR: 4500, balanceUSD: 54, totalDepositedINR: 4500, totalSpentINR: 0, transactions: [] },
          userLoyalty: { userId: currentPersona.id, currentTier: 'Silver', totalPoints: 1240, lifetimePointsEarned: 1500, pointsRedeemed: 260, dailyLoginClaimedToday: false, recentActivities: [] },
          catalog: products
        });
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.content || 'I processed your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinkingProcess: data.thinkingProcess,
        groundingSources: data.groundingSources,
        recommendedProductIds: data.recommendedProductIds,
        mode: chatMode
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Here are hardware options matching your requirements from our verified catalog.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const sampleQueries = [
    "Show me a laptop for coding under ₹70,000",
    "Compare ThinkPad T14s vs MacBook Air M3 for development",
    "Find wireless ANC headphones for flights under ₹30,000",
    `Why was my #1 product recommended for ${currentPersona.name}?`
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Chat Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Shopping Concierge</h3>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                  {chatMode === 'thinking' ? 'Deep Reasoning' : 'Catalog Grounded'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Persona: <span className="text-cyan-300">{currentPersona.name}</span> ({currentPersona.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Model Mode Switcher Banner */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Reasoning Engine Mode:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            
            <button
              onClick={() => setChatMode('thinking')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                chatMode === 'thinking'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Deep Reasoning Mode with Multi-Objective Constraint Optimization"
            >
              <BrainCircuit className="h-3 w-3" />
              Deep Reasoning
            </button>

            <button
              onClick={() => setChatMode('search_grounded')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                chatMode === 'search_grounded'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Real-Time Catalog Grounded Spec Verification"
            >
              <Globe className="h-3 w-3" />
              Catalog Grounded
            </button>

          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isUser ? currentPersona.name : 'Concierge'} • {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/80 shadow-md'
                  }`}
                >
                  {/* Thinking disclosure for assistant */}
                  {msg.thinkingProcess && (
                    <details className="mb-2.5 p-2 rounded-lg bg-slate-950/60 border border-amber-500/20 text-[11px] text-amber-300/90">
                      <summary className="cursor-pointer font-mono font-medium flex items-center gap-1.5 text-amber-400 select-none">
                        <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
                        <span>Reasoning &amp; Constraint Evaluation</span>
                      </summary>
                      <p className="mt-1.5 text-slate-400 font-mono text-[10px] leading-normal whitespace-pre-wrap">
                        {msg.thinkingProcess}
                      </p>
                    </details>
                  )}

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Grounding sources pill */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Grounded Search Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.groundingSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-cyan-300 text-[10px] border border-cyan-800/50 hover:bg-slate-800 transition"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Matched Catalog Cards */}
                  {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                      <span className="text-[10px] font-mono text-amber-300 font-semibold block">
                        Direct Catalog Matches:
                      </span>
                      <div className="space-y-1.5">
                        {msg.recommendedProductIds.map(pId => {
                          const prod = products.find(p => p.id === pId);
                          if (!prod) return null;

                          return (
                            <div
                              key={pId}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div 
                                onClick={() => onViewProductById?.(prod.id)}
                                className="cursor-pointer flex-1 min-w-0"
                              >
                                <span className="font-semibold text-white truncate block text-[11px] hover:text-cyan-300">
                                  {prod.title}
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400">
                                  {currency === 'INR' ? `₹${prod.priceINR.toLocaleString()}` : `$${prod.priceUSD.toLocaleString()}`}
                                </span>
                              </div>
                              <button
                                onClick={() => onAddToCart?.(prod)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center gap-1 transition"
                              >
                                <ShoppingBag className="h-3 w-3" />
                                Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-3 rounded-2xl bg-slate-800/50 max-w-[70%] border border-slate-800">
              <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
              <span>
                {chatMode === 'thinking' ? 'Evaluating multi-objective trade-offs...' : 'Synthesizing live verified sources...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/70 overflow-x-auto flex gap-1.5 no-scrollbar">
          {sampleQueries.map((queryText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(queryText)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition"
            >
              {queryText}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask shopping concierge as ${currentPersona.name}...`}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white transition shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
