import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { CommunityPost } from '../types/app';
import { Spinner } from '../components/Spinner';

const topics = [
  { key: 'all', label: 'All Discussions' },
  { key: 'pest_control', label: 'Pest & Disease' },
  { key: 'soil_fertilizer', label: 'Soil & Fertilizer' },
  { key: 'crop_technique', label: 'Farming Tech' },
  { key: 'weather_advisory', label: 'Weather' },
  { key: 'general', label: 'General' },
];

export const CommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');

  // New post modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('pest_control');
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.listCommunityPosts(selectedTopic);
      setPosts(data);
    } catch (e) {
      console.error('Failed to load community posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTopic]);

  const handleUpvote = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isUpvotedByMe: !p.isUpvotedByMe,
                upvotes: p.isUpvotedByMe ? p.upvotes - 1 : p.upvotes + 1,
              }
            : p
        )
      );
      await api.toggleUpvotePost(postId);
    } catch {
      fetchPosts();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      setErr('Please fill in both title and body.');
      return;
    }
    setCreating(true);
    setErr('');
    try {
      await api.createCommunityPost({ title, body, category });
      setShowModal(false);
      setTitle('');
      setBody('');
      fetchPosts();
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Failed to publish post.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <span>←</span> Back
        </button>
        <div className="top-bar-title">Community Forum</div>
        <button className="btn-action" onClick={() => setShowModal(true)}>
          + Post
        </button>
      </div>

      {/* ── Topic Chips ───────────────────────────────────────── */}
      <div className="chips-wrapper">
        <div className="chips-scroll">
          {topics.map((t) => (
            <button
              key={t.key}
              className={`chip ${selectedTopic === t.key ? 'active' : ''}`}
              onClick={() => setSelectedTopic(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Forum Posts List ──────────────────────────────────── */}
      <div className="scroll-content">
        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">💬</div>
            <div className="empty-title">No discussions yet</div>
            <div className="empty-desc">Be the first to start a topic for this category.</div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="community-card">
              <div className="section-header" style={{ marginBottom: 8 }}>
                <div className="author-row">
                  <div className="author-avatar">
                    {post.authorName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="author-name">{post.authorName}</span>
                      {post.isExpert && <span className="expert-badge">🎓 Expert</span>}
                    </div>
                    <div className="author-role">{post.authorRole}</div>
                  </div>
                </div>
                <span className="category-tag">{post.category.replace('_', ' ')}</span>
              </div>

              <div className="post-title">{post.title}</div>
              <div className="post-body">{post.body}</div>

              <div className="card-footer">
                <button
                  className={`upvote-btn ${post.isUpvotedByMe ? 'active' : ''}`}
                  onClick={() => handleUpvote(post.id)}
                >
                  ▲ {post.upvotes} Upvotes
                </button>
                <span className="comments-count">💬 {post.commentsCount} Comments</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── New Post Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Start a Discussion</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate}>
              {err && <div className="error-box">{err}</div>}

              <div className="field">
                <label className="label">Topic Category</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {topics.filter(t => t.key !== 'all').map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Title</label>
                <input
                  className="input"
                  placeholder="e.g. Best fertilizer for yellow corn?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label">Details / Body</label>
                <textarea
                  className="input input-textarea"
                  placeholder="Describe your issue or question..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? <Spinner size={20} /> : 'Publish Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
