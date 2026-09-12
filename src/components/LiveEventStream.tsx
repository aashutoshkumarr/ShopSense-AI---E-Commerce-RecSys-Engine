import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Eye, 
  Heart, 
  ShoppingCart, 
  CreditCard, 
  Star, 
  Share2, 
  MinusCircle, 
  Sparkles, 
  RefreshCw,
  Clock,
  Layers,
  ArrowDownCircle,
  CheckCircle2
} from 'lucide-react';
import { UserEvent, EventType } from '../types';

interface LiveEventStreamProps {
  onEventLogged?: () => void;
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({ onEventLogged }) => {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load events:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateEvent = async (type: EventType) => {
    setIsSimulating(true);
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: type,
          userId: 'user-dev-alex',
          productId: 'prod-lap-01',
          productTitle: 'Lenovo ThinkPad T14s Gen 4 AMD Ryzen 7 PRO',
          category: 'Laptops',
          brand: 'Lenovo',
          ratingValue: type === 'product_rating' ? 5 : undefined,
          searchQuery: type === 'search' ? 'macbook m3 pro vs thinkpad' : undefined
        })
      });
      setIsSimulating(false);
      fetchEvents();
      if (onEventLogged) onEventLogged();
    } catch (err) {
      setIsSimulating(false);
      console.error('Failed to simulate event:', err);
    }
  };

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'purchase':
        return { icon: CreditCard, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', weight: '+10 wt' };
      case 'cart_add':
        return { icon: ShoppingCart, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', weight: '+7 wt' };
      case 'product_rating':
        return { icon: Star, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', weight: '+6 wt' };
      case 'wishlist_add':
        return { icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', weight: '+5 wt' };
      case 'product_share':
        return { icon: Share2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', weight: '+4 wt' };
      case 'recommendation_click':
        return { icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', weight: '+3 wt' };
      case 'search':
        return { icon: Search, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', weight: '+2 wt' };
      case 'product_view':
        return { icon: Eye, color: 'text-slate-300 bg-slate-800 border-slate-700', weight: '+1 wt' };
      case 'cart_remove':
        return { icon: MinusCircle, color: 'text-red-400 bg-red-500/10 border-red-500/30', weight: '-2 wt' };
      case 'recommendation_impression':
      default:
        return { icon: Activity, color: 'text-slate-400 bg-slate-900 border-slate-800', weight: '+0.5 wt' };
    }
  };

  const filteredEvents = selectedEventType === 'all' 
    ? events 
    : events.filter(e => e.eventType === selectedEventType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Real-Time Behavioral Event Stream</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingests 10 weighted event signals (Views, Searches, Clicks, Shares, Wishlists, Ratings, Carts, Purchases) into the online Feature Store.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Stream</span>
          </button>
        </div>
      </div>

      {/* 10 Event Weights Cheat Sheet / Quick Trigger Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">
          Interactive Signal Simulator &bull; 10 Event Types
        </span>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => handleSimulateEvent('product_view')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700"
          >
            <Eye className="h-3 w-3" /> View (+1)
          </button>
          <button
            onClick={() => handleSimulateEvent('search')}
            className="px-2.5 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 flex items-center gap-1 border border-blue-700/50"
          >
            <Search className="h-3 w-3" /> Search (+2)
          </button>
          <button
            onClick={() => handleSimulateEvent('recommendation_click')}
            className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 flex items-center gap-1 border border-purple-700/50"
          >
            <Sparkles className="h-3 w-3" /> Rec Click (+3)
          </button>
          <button
            onClick={() => handleSimulateEvent('product_share')}
            className="px-2.5 py-1 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 flex items-center gap-1 border border-indigo-700/50"
          >
            <Share2 className="h-3 w-3" /> Share (+4)
          </button>
          <button
            onClick={() => handleSimulateEvent('wishlist_add')}
            className="px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 flex items-center gap-1 border border-rose-700/50"
          >
            <Heart className="h-3 w-3" /> Wishlist (+5)
          </button>
          <button
            onClick={() => handleSimulateEvent('product_rating')}
            className="px-2.5 py-1 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 flex items-center gap-1 border border-amber-700/50"
          >
            <Star className="h-3 w-3" /> 5★ Rating (+6)
          </button>
          <button
            onClick={() => handleSimulateEvent('cart_add')}
            className="px-2.5 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 flex items-center gap-1 border border-cyan-700/50"
          >
            <ShoppingCart className="h-3 w-3" /> Cart Add (+7)
          </button>
          <button
            onClick={() => handleSimulateEvent('cart_remove')}
            className="px-2.5 py-1 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-300 flex items-center gap-1 border border-red-700/50"
          >
            <MinusCircle className="h-3 w-3" /> Remove (-2)
          </button>
          <button
            onClick={() => handleSimulateEvent('purchase')}
            className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 flex items-center gap-1 border border-emerald-700/50"
          >
            <CreditCard className="h-3 w-3" /> Purchase (+10)
          </button>
        </div>
      </div>

      {/* Stream Log List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Live Ingested Telemetry Feed ({filteredEvents.length} events logged)
            </h3>
          </div>

          <select
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Signal Types</option>
            <option value="purchase">Purchases (wt 10)</option>
            <option value="cart_add">Cart Adds (wt 7)</option>
            <option value="product_rating">Ratings (wt 6)</option>
            <option value="wishlist_add">Wishlists (wt 5)</option>
            <option value="product_share">Shares (wt 4)</option>
            <option value="recommendation_click">Rec Clicks (wt 3)</option>
            <option value="search">Searches (wt 2)</option>
            <option value="product_view">Views (wt 1)</option>
            <option value="cart_remove">Removals (wt -2)</option>
          </select>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No events recorded for this filter yet. Interact with products or use the buttons above to generate live signals.
            </div>
          ) : (
            filteredEvents.map(evt => {
              const badge = getEventBadge(evt.eventType);
              const Icon = badge.icon;

              return (
                <div key={evt.id} className="p-3.5 hover:bg-slate-800/30 transition flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${badge.color} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white font-mono uppercase text-[11px]">
                          {evt.eventType.replace('_', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                          User: {evt.userName || evt.userId}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${badge.color}`}>
                          {badge.weight}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs truncate mt-0.5">
                        {evt.productTitle ? (
                          <span>Product: <strong>{evt.productTitle}</strong> ({evt.category})</span>
                        ) : evt.searchQuery ? (
                          <span>Query: &ldquo;{evt.searchQuery}&rdquo;</span>
                        ) : (
                          <span>System Telemetry Action</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      Feature Store &check;
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
