import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { communityApi } from '../api/community';
import type { Post, PostCategory } from '../types/community';

const CATEGORIES: { value: PostCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all',         label: 'All topics',    icon: '🌿' },
  { value: 'crop_advice', label: 'Crop advice',   icon: '🌾' },
  { value: 'pest_control',label: 'Pest control',  icon: '🐛' },
  { value: 'market_talk', label: 'Market talk',   icon: '📈' },
  { value: 'equipment',   label: 'Equipment',     icon: '🚜' },
  { value: 'general',     label: 'General',       icon: '💬' },
];

const CATEGORY_ACCENT: Record<string, string> = {
  crop_advice:  'var(--green-500)',
  pest_control: '#b45309',
  market_talk:  '#0369a1',
  equipment:    '#7c3aed',
  general:      'var(--gray-400)',
  all:          'var(--green-500)',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export const CommunityHubPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PostCategory>('crop_advice');
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await communityApi.listPosts(activeCategory !== 'all' ? activeCategory : undefined);
      setPosts(data);
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleUpvote = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await communityApi.toggleUpvote(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isUpvotedByMe: res.isUpvoted, upvotes: res.isUpvoted ? p.upvotes + 1 : p.upvotes - 1 }
            : p
        )
      );
    } catch (e) {
      console.error('Failed to toggle upvote:', e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await communityApi.createPost({ title, body, category, imageUrl: imageUrl || undefined });
      setShowModal(false);
      setTitle(''); setBody(''); setImageUrl('');
      fetchPosts();
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create post.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-root">
      <Navbar />

      <main className="page-main" style={{ maxWidth: '860px' }}>
        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="page-header-label">AgriConnect community</span>
            <h1 className="page-header-title">Farmer &amp; expert discussion forum</h1>
            <p className="page-header-sub">
              Ask farming questions, share harvest insights, and get advice from agricultural experts.
            </p>
          </div>
          <button className="btn btn--inverse" onClick={() => setShowModal(true)}>
            + Start a discussion
          </button>
        </div>

        {/* ── Category Pill Tabs ───────────────────────────────── */}
        <div className="pill-tabs-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`pill-tab${activeCategory === cat.value ? ' pill-tab--active' : ''}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* ── Feed ────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }}>
                <div className="skeleton-body" style={{ padding: '24px' }}>
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line--med" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <h3 className="empty-state__title">No posts in this topic yet</h3>
            <p className="empty-state__desc">Be the first to start a conversation.</p>
            <button className="btn btn--primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
              Start a discussion
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => {
              const accent = CATEGORY_ACCENT[post.category] ?? 'var(--green-500)';
              return (
                <Link
                  to={`/community/posts/${post.id}`}
                  key={post.id}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article
                    className="post-card"
                    style={{ borderLeftColor: post.authorRole === 'expert' ? '#7c3aed' : accent }}
                  >
                    <div className="post-card__header">
                      {/* Author */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="post-card__avatar">
                          {post.authorName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                              {post.authorName}
                            </span>
                            {post.authorRole === 'expert' && (
                              <span className="badge badge--expert">🎓 Expert</span>
                            )}
                          </div>
                          <span className="post-card__time">{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>

                      {/* Category */}
                      <span
                        className="post-card__category"
                        style={{ color: accent, backgroundColor: `${accent}18` }}
                      >
                        {post.category.replace('_', ' ')}
                      </span>
                    </div>

                    <h2 className="post-card__title">{post.title}</h2>
                    <p className="post-card__body">{post.body}</p>

                    <div className="post-card__footer">
                      <button
                        onClick={(e) => handleUpvote(post.id, e)}
                        className={`upvote-btn${post.isUpvotedByMe ? ' upvote-btn--active' : ''}`}
                      >
                        ▲ {post.upvotes}
                      </button>
                      <span className="post-card__comments">
                        💬 {post.commentsCount} {post.commentsCount === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Create Post Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header__sub">Community forum</p>
                <h2 className="modal-header__title">Start a discussion</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {createError && (
              <div className="feedback-box feedback-box--error">{createError}</div>
            )}

            <form onSubmit={handleCreatePost}>
              <div className="form-field">
                <label className="form-label">Topic category</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PostCategory)}
                >
                  <option value="crop_advice">🌾 Crop advice &amp; farming techniques</option>
                  <option value="pest_control">🐛 Pest &amp; disease control</option>
                  <option value="market_talk">📈 Market prices &amp; buying trends</option>
                  <option value="equipment">🚜 Machinery &amp; supplies</option>
                  <option value="general">💬 General agricultural discussion</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="How to prevent bacterial wilt in tomatoes?"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Details *</label>
                <textarea
                  className="form-input form-textarea"
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe your issue or topic in detail…"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn--primary"
                  style={{ flex: 1 }}
                >
                  {creating ? 'Publishing…' : 'Publish post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
