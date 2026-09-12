import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  BrainCircuit, 
  MessageSquare, 
  Plus, 
  X,
  Send,
  Award
} from 'lucide-react';
import { ProductReview, ProductNLPSummary } from '../types';

interface ReviewsNLPSectionProps {
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewsNLPSection: React.FC<ReviewsNLPSectionProps> = ({
  productId,
  productTitle,
  userId,
  userName,
  userAvatar,
  onReviewSubmitted
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ProductNLPSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !comment) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
          userId,
          userName,
          userAvatar
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setSuccessMsg('Review analyzed with NLP & published! +50 Loyalty Points credited to your account.');
        setTitle('');
        setComment('');
        fetchReviews();
        if (onReviewSubmitted) onReviewSubmitted();
        setTimeout(() => {
          setSuccessMsg(null);
          setShowWriteModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🧠 NLP Executive Summary Hub */}
      {summary && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">NLP Sentiment &amp; Review Synthesis</h3>
                <p className="text-[11px] text-slate-400">Synthesized across {summary.totalReviews} customer feedback submissions</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                summary.overallSentiment === 'positive'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : summary.overallSentiment === 'neutral'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {summary.overallSentiment} Sentiment ({Math.round(summary.sentimentScore * 100)}% Polarity)
              </span>
              <button
                onClick={() => setShowWriteModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Write Review (+50 pts)
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            "{summary.editorialSummary || summary.nlpExecutiveSummary}"
          </p>

          {/* Sentiment Distribution Bars */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="text-emerald-400">Positive {summary.positivePercentage}%</span>
              <span className="text-amber-400">Neutral {summary.neutralPercentage}%</span>
              <span className="text-red-400">Negative {summary.negativePercentage}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
              <div style={{ width: `${summary.positivePercentage}%` }} className="bg-emerald-500" />
              <div style={{ width: `${summary.neutralPercentage}%` }} className="bg-amber-500" />
              <div style={{ width: `${summary.negativePercentage}%` }} className="bg-red-500" />
            </div>
          </div>

          {/* Pros & Cons Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" /> Key Pros Identified
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.topPros.map((pro, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex items-center gap-1"
                  >
                    <span>{pro.tag}</span>
                    <span className="text-[9px] font-mono text-emerald-400/80">({pro.mentionCount})</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ThumbsDown className="h-3.5 w-3.5" /> Cons / Considerations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.topCons.map((con, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-rose-950/60 text-rose-300 border border-rose-800 flex items-center gap-1"
                  >
                    <span>{con.tag}</span>
                    <span className="text-[9px] font-mono text-rose-400/80">({con.mentionCount})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Verified Customer Reviews ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No reviews yet. Be the first to review and earn +50 Loyalty Points!
          </div>
        ) : (
          reviews.map((rev) => (
            <div 
              key={rev.id}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {rev.userName}
                      {rev.verifiedPurchase && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`h-3.5 w-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-600'}`} 
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize font-mono border ${
                    rev.sentiment === 'positive'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : rev.sentiment === 'neutral'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                      : 'bg-red-950/60 text-red-300 border-red-800'
                  }`}>
                    {rev.sentiment}
                  </span>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-200">{rev.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                {rev.pros.map((p, i) => (
                  <span key={i} className="bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-900">
                    + {p}
                  </span>
                ))}
                {rev.cons.map((c, i) => (
                  <span key={i} className="bg-rose-950/40 text-rose-300 px-1.5 py-0.5 rounded border border-rose-900">
                    - {c}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Write a Review</h3>
              </div>
              <button 
                onClick={() => setShowWriteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-sm font-semibold text-white">{successMsg}</div>
                <div className="text-xs text-slate-400">Awarding points &amp; recalculating NLP summaries...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Your Overall Rating:</span>
                  <div className="flex gap-1 text-amber-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="focus:outline-none transition hover:scale-110"
                      >
                        <Star 
                          className={`h-5 w-5 ${s <= rating ? 'fill-amber-400' : 'text-slate-600'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Review Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exceptional build quality and battery life!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Detailed Feedback</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe performance, display clarity, ergonomics, any drawbacks..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Submitting this review automatically earns you <strong>+50 Loyalty Points</strong>.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !title || !comment}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Analyzing Sentiment with NLP...' : 'Publish Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
