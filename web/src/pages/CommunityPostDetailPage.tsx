import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { communityApi } from '../api/community';
import type { Post, Comment } from '../types/community';

export const CommunityPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
      setComments(c);
    } catch (e) {
      console.error('Failed to load thread:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadThread(); }, [loadThread]);

  const handleUpvote = async () => {
    if (!post || !id) return;
    try {
      const res = await communityApi.toggleUpvote(id);
      setPost({
        ...post,
        isUpvotedByMe: res.isUpvoted,
        upvotes: res.isUpvoted ? post.upvotes + 1 : post.upvotes - 1,
      });
    } catch (e) {
      console.error('Failed to upvote:', e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await communityApi.createComment(id, { body: commentText });
      setCommentText('');
      loadThread();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit answer/comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>Loading post thread...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>Post not found.</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        <Link to="/community" style={{ textDecoration: 'none', color: '#16a34a', fontWeight: 700, fontSize: '14px', display: 'inline-block', marginBottom: '20px' }}>
          ← Back to All Discussions
        </Link>

        {/* ── Main Post Card ── */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', marginBottom: '32px', borderLeft: post.authorRole === 'expert' ? '6px solid #6b21a8' : '6px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
                {post.authorName[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {post.authorName}
                  {post.authorRole === 'expert' && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6b21a8', backgroundColor: '#f3e8ff', padding: '2px 8px', borderRadius: '10px' }}>
                      🎓 Agricultural Expert
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Posted on {new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '12px' }}>
              {post.category.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>{post.title}</h1>
          <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
            {post.body}
          </p>

          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', alignItems: 'center' }}>
            <button
              onClick={handleUpvote}
              style={{
                padding: '8px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '14px',
                border: post.isUpvotedByMe ? 'none' : '1px solid #cbd5e1', cursor: 'pointer',
                backgroundColor: post.isUpvotedByMe ? '#dcfce7' : '#fff',
                color: post.isUpvotedByMe ? '#166534' : '#475569',
              }}
            >
              ▲ {post.upvotes} Upvotes
            </button>

            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
              💬 {comments.length} Responses / Answers
            </span>
          </div>
        </div>

        {/* ── Add Comment / Answer Box ── */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Leave a Response or Expert Answer
          </h3>
          <form onSubmit={handleAddComment}>
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your answer, experience, or advice..."
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '12px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '10px 24px', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer' }}
              >
                {submitting ? 'Posting...' : 'Post Response'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Comments List ── */}
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
          Discussion Thread ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
            No answers or comments posted yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map((comment) => {
              const isExpert = comment.authorRole === 'expert';
              return (
                <div
                  key={comment.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderRadius: '18px',
                    backgroundColor: isExpert ? '#faf5ff' : '#fff',
                    borderLeft: isExpert ? '6px solid #6b21a8' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: isExpert ? '#6b21a8' : '#16a34a',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px',
                      }}>
                        {comment.authorName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {comment.authorName}

                          {/* 🎓 Visually distinguished Expert badge */}
                          {isExpert && (
                            <span style={{
                              fontSize: '11px', fontWeight: 900, color: '#6b21a8',
                              backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe',
                              padding: '2px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            }}>
                              🎓 VERIFIED EXPERT ANSWER
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                    {comment.body}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
