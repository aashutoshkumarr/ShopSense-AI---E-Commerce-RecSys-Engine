import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  RotateCcw, 
  Truck, 
  CreditCard, 
  Wallet, 
  Award, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Sparkles,
  PhoneCall,
  FileText,
  AlertCircle
} from 'lucide-react';
import { HelpArticle, SupportTicket, AuthUser } from '../types';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser;
  onOpenReturns: () => void;
  onOpenOrders: () => void;
  onOpenWallet: () => void;
  onOpenAIHelp: () => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  authUser,
  onOpenReturns,
  onOpenOrders,
  onOpenWallet,
  onOpenAIHelp
}) => {
  const [activeTab, setActiveTab] = useState<'help_center' | 'tickets' | 'policy'>('help_center');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('art-return-policy');
  const [loading, setLoading] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket['category']>('return_replacement');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchArticles();
      fetchTickets();
    }
  }, [isOpen, searchQuery, selectedCategory, authUser.targetPersonaId]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/support/articles?query=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Failed to load help articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/support/tickets?userId=${authUser.targetPersonaId}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !activeTicketId) {
          setActiveTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authUser.targetPersonaId,
          userName: authUser.name,
          category: newTicketCategory,
          subject: newTicketSubject,
          message: newTicketMessage
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTickets([data.ticket, ...tickets]);
        setActiveTicketId(data.ticket.id);
        setIsCreatingTicket(false);
        setNewTicketSubject('');
        setNewTicketMessage('');
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicketId) return;

    try {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage,
          sender: 'user',
          senderName: authUser.name
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTickets(tickets.map(t => t.id === activeTicketId ? data.ticket : t));
        setReplyMessage('');
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'returns_refunds', label: 'Returns & Replacements', icon: RotateCcw },
    { id: 'shipping_delivery', label: 'Shipping & Delivery', icon: Truck },
    { id: 'wallet_payments', label: 'Wallet & Payments', icon: Wallet },
    { id: 'rewards_loyalty', label: 'Rewards & Loyalty', icon: Award }
  ];

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    <div id="support-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="customer-support-hub" 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Customer Support & Help Center</h2>
                <span className="px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200">
                  24/7 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Track orders, schedule doorstep returns, check instant wallet refunds, and resolve issues.
              </p>
            </div>
          </div>

          <button
            id="close-support-hub-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-100/70 border-b border-slate-200">
          <button
            id="quick-action-returns"
            onClick={() => {
              onClose();
              onOpenReturns();
            }}
            className="flex items-center gap-2.5 p-3 text-left bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
          >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Return / Replace</div>
              <div className="text-[10px] text-slate-500">7-Day Doorstep Pickup</div>
            </div>
          </button>

          <button
            id="quick-action-track-order"
            onClick={() => {
              onClose();
              onOpenOrders();
            }}
            className="flex items-center gap-2.5 p-3 text-left bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
          >
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Track Orders</div>
              <div className="text-[10px] text-slate-500">Live Courier Status</div>
            </div>
          </button>

          <button
            id="quick-action-wallet-refund"
            onClick={() => {
              onClose();
              onOpenWallet();
            }}
            className="flex items-center gap-2.5 p-3 text-left bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
          >
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Wallet & Refunds</div>
              <div className="text-[10px] text-slate-500">Instant 2-Min Payouts</div>
            </div>
          </button>

          <button
            id="quick-action-ai-assistant"
            onClick={() => {
              onClose();
              onOpenAIHelp();
            }}
            className="flex items-center gap-2.5 p-3 text-left bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">AI Concierge</div>
              <div className="text-[10px] text-slate-500">Instant Smart Chat</div>
            </div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white">
          <button
            id="tab-help-center"
            onClick={() => setActiveTab('help_center')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'help_center'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Knowledge Base & FAQs
          </button>

          <button
            id="tab-tickets"
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'tickets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Support Tickets ({tickets.length})
          </button>

          <button
            id="tab-policy"
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'policy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Guarantee & Guarantees
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'help_center' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="help-center-search-input"
                  type="text"
                  placeholder="Search return policy, shipping timelines, refund status, wallet credits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      id={`help-cat-${cat.id}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Articles Accordion */}
              <div className="space-y-3">
                {articles.map((art) => {
                  const isExpanded = expandedArticleId === art.id;
                  return (
                    <div
                      key={art.id}
                      id={`article-${art.id}`}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                    >
                      <button
                        onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{art.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{art.summary}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {art.categoryLabel}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700 leading-relaxed space-y-3">
                          <div className="prose prose-xs max-w-none whitespace-pre-line">
                            {art.content}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[11px] text-slate-400">
                            <span>Was this article helpful? (👍 {art.helpfulCount} found helpful)</span>
                            <div className="flex items-center gap-1.5">
                              {art.keywords.map(k => (
                                <span key={k} className="px-1.5 py-0.5 bg-slate-200/70 text-slate-600 rounded">
                                  #{k}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {articles.length === 0 && !loading && (
                  <div className="text-center py-10 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No help articles matched your search.</p>
                    <p className="text-xs mt-1">Try searching for "refund", "return", or "warranty".</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Your Support Tickets</h3>
                  <p className="text-xs text-slate-500">Track and respond to live tickets with our support team and AI agents.</p>
                </div>
                <button
                  id="create-new-ticket-btn"
                  onClick={() => setIsCreatingTicket(!isCreatingTicket)}
                  className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
                >
                  {isCreatingTicket ? 'Cancel' : '+ New Support Ticket'}
                </button>
              </div>

              {isCreatingTicket && (
                <form onSubmit={handleCreateTicket} className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900">Create New Support Request</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issue Category</label>
                      <select
                        id="ticket-category-select"
                        value={newTicketCategory}
                        onChange={(e) => setNewTicketCategory(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                      >
                        <option value="return_replacement">Return & Replacement Issue</option>
                        <option value="order_tracking">Order Tracking & Delivery</option>
                        <option value="payment_refund">Wallet & Payment Refund</option>
                        <option value="product_inquiry">Product Compatibility / Tech Specs</option>
                        <option value="general">General Support</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
                      <input
                        id="ticket-subject-input"
                        type="text"
                        placeholder="e.g. Need to modify doorstep pickup time"
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Detailed Message</label>
                    <textarea
                      id="ticket-message-textarea"
                      rows={3}
                      placeholder="Describe what you need assistance with..."
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTicket(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-ticket-btn"
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              )}

              {/* Tickets List and Message Thread */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-2">
                  {tickets.map(t => (
                    <button
                      key={t.id}
                      id={`ticket-item-${t.id}`}
                      onClick={() => setActiveTicketId(t.id)}
                      className={`w-full p-3 text-left rounded-xl border transition-all ${
                        activeTicketId === t.id
                          ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                          : 'bg-white/80 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400">#{t.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {t.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{t.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}

                  {tickets.length === 0 && (
                    <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                      <p className="text-xs">No active tickets.</p>
                    </div>
                  )}
                </div>

                {/* Ticket Details & Chat Messages */}
                <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-[400px]">
                  {activeTicket ? (
                    <>
                      <div className="pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{activeTicket.subject}</div>
                          <div className="text-[10px] text-slate-500">
                            Category: {activeTicket.category.replace('_', ' ')} | Priority: {activeTicket.priority}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                          Ticket #{activeTicket.id}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
                        {activeTicket.messages.map(m => {
                          const isUser = m.sender === 'user';
                          const isAI = m.sender === 'ai_assistant';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                                <span>{m.senderName}</span>
                                {isAI && <span className="text-indigo-600 font-semibold">• AI Triage</span>}
                              </div>
                              <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                isUser
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : isAI
                                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-tl-none'
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                              }`}>
                                {m.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-slate-100">
                        <input
                          id="ticket-reply-input"
                          type="text"
                          placeholder="Type your response to support..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          id="send-ticket-reply-btn"
                          type="submit"
                          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                      Select or create a ticket to view message thread.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-1">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  ShopSense 100% Buyer Protection & Guarantee
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Every product shipped is authentic, factory-sealed, and backed by a comprehensive 7-day doorstep replacement protocol and 1-year brand warranty.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    7-Day Doorstep Replacement
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If an item is defective or incompatible, a delivery agent collects it from your doorstep and provides a replacement unit or wallet refund.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    Instant Wallet Credit (&lt; 2 Mins)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Refunds to ShopSense Wallet are processed immediately upon hub inspection with an added +50 loyalty point bonus.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    Insured BlueDart Express Transit
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All shipments travel via temperature-controlled, tamper-evident air cargo with live GPS milestone tracking.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <PhoneCall className="w-4 h-4 text-amber-600" />
                    Dedicated Priority Support Desk
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Need emergency help with an active shipment? Reach our priority logistics desk directly via in-app tickets.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Support Desk Active • Typical response time &lt; 2 minutes</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close Help Center
          </button>
        </div>
      </div>
    </div>
  );
};
