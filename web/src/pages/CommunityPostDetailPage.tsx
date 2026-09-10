import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityApi } from '../api/community';
import { useToast } from '../contexts/ToastContext';
import type { Post, Comment } from '../types/community';

export const CommunityPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // New comment state
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadThread = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        communityApi.getPostByID(id),
        communityApi.listComments(id),
      ]);
      setPost(p);
      setComments(c || []);
    } catch (e) {
      console.error('Failed to load thread:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const handleUpvote = async () => {
    if (!post || !id) return;
    try {
      const res = await communityApi.toggleUpvote(id);
      setPost((prev) =>
        prev
          ? {
            ...prev,
            isUpvotedByMe: res.isUpvoted,
            upvotes: res.isUpvoted ? prev.upvotes + 1 : Math.max(0, prev.upvotes - 1),
          }
          : null
      );
    } catch (e) {
      console.error('Failed to upvote:', e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await communityApi.createComment(id, { body: commentText.trim() });
      setCommentText('');
      await loadThread();
      success('Reply Posted Successfully!', 'Your response has been added to the discussion thread.');
    } catch (err: any) {
      error('Failed to post reply', err.response?.data?.error || 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'farmer':
        return { label: '🌾 Farmer', bg: '#dcfce7', color: '#15803d' };
      case 'supplier':
        return { label: '🏪 Agri Supplier', bg: '#e0f2fe', color: '#0369a1' };
      case 'lgu':
      case 'lgu_staff':
      case 'lgu_officer':
        return { label: '🏛️ LGU Staff', bg: '#fef3c7', color: '#b45309' };
      case 'buyer':
        return { label: '🛒 Buyer', bg: '#f1f5f9', color: '#475569' };
      default:
        return { label: '👤 Member', bg: '#f1f5f9', color: '#475569' };
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'crop_advice':
        return '🌱 Crop Care & Health';
      case 'pest_control':
        return '🐛 Pest & Disease Control';
      case 'market_talk':
        return '💰 Market Prices & Sales';
      case 'equipment':
        return '🚜 Tools & Equipment';
      case 'general':
      default:
        return '🌾 General Farming';
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}>Loading discussion thread...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="app-container" style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>Post Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>This discussion thread may have been removed or does not exist.</p>
        <button onClick={() => navigate('/community')} className="btn btn-primary">
          ← Return to Community Forum
        </button>
      </div>
    );
  }

  const authorBadge = getRoleBadge(post.authorRole);

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      {/* ── Navigation Breadcrumb ── */}
      <button
        onClick={() => navigate('/community')}
        style={{
          background: 'none',
          border: 'none',
          color: '#16a34a',
          fontWeight: 800,
          fontSize: '15px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: 0,
        }}
      >
        ← Back to Community Forum
      </button>

      {/* ── Main Question / Discussion Card ── */}
      <div
        className="card"
        style={{
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '28px',
          borderLeft: post.authorRole === 'lgu_staff' ? '6px solid #0D9488' : '6px solid #16a34a',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: post.authorRole === 'lgu_staff' ? '#0D9488' : '#16a34a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
              }}
            >
              {post.authorName ? post.authorName[0]?.toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{post.authorName}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: authorBadge.color,
                    backgroundColor: authorBadge.bg,
                    padding: '2px 10px',
                    borderRadius: '12px',
                  }}
                >
                  {authorBadge.label}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Posted on {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#0E4A27',
              backgroundColor: '#EAF6EE',
              padding: '6px 14px',
              borderRadius: '14px',
              border: '1px solid #C8E6D0',
            }}
          >
            {getCategoryLabel(post.category)}
          </span>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', margin: '0 0 16px 0', lineHeight: 1.3 }}>
          {post.title}
        </h1>

        <p style={{ fontSize: '17px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
          {post.body}
        </p>

        <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleUpvote}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '15px',
              border: post.isUpvotedByMe ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
              cursor: 'pointer',
              backgroundColor: post.isUpvotedByMe ? '#dcfce7' : '#fff',
              color: post.isUpvotedByMe ? '#166534' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>▲</span> {post.upvotes} Upvotes
          </button>

          <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 700 }}>
            💬 {comments.length} {comments.length === 1 ? 'Response' : 'Responses'} / Replies
          </span>
        </div>
      </div>

      {/* ── Add Comment / Answer Box ── */}
      <div className="card" style={{ padding: '26px', borderRadius: '20px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0E4A27', marginBottom: '12px' }}>
          Leave a Response or Farming Advice
        </h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: 0, marginBottom: '14px' }}>
          Join the conversation! Farmers, agronomists, and suppliers can share field recommendations, market updates, or answers.
        </p>
        <form onSubmit={handleAddComment}>
          <textarea
            required
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your answer, recommendation, or advice here..."
            className="form-input"
            style={{ fontSize: '16px', marginBottom: '14px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '16px', fontWeight: 800 }}
            >
              {submitting ? 'Posting Reply...' : 'Post Reply →'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Comments / Replies Thread ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
          Discussion Thread ({comments.length})
        </h3>
      </div>

      {comments.length === 0 ? (
        <div className="card" style={{ padding: '40px', borderRadius: '18px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            No replies yet on this topic
          </div>
          <p style={{ fontSize: '15px', margin: 0 }}>
            Be the first to provide helpful advice or share your farming experience!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => {
            const cBadge = getRoleBadge(comment.authorRole);
            const isLGU = comment.authorRole === 'lgu_staff';
            return (
              <div
                key={comment.id}
                className="card"
                style={{
                  padding: '24px',
                  borderRadius: '18px',
                  backgroundColor: isLGU ? '#f0fdfa' : '#FFFFFF',
                  borderLeft: isLGU ? '6px solid #0D9488' : '4px solid #CBD5E1',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isLGU ? '#0D9488' : '#16a34a',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '15px',
                      }}
                    >
                      {comment.authorName ? comment.authorName[0]?.toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{comment.authorName}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: cBadge.color,
                            backgroundColor: cBadge.bg,
                            padding: '2px 8px',
                            borderRadius: '10px',
                          }}
                        >
                          {cBadge.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.6, margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {comment.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
