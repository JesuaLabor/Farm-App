import React, { useState } from 'react';
import { communityApi } from '../../api/community';
import { getImageUrl } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Post, PostCategory } from '../../types/community';

interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onPostShared?: (newPost: Post) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  isOpen,
  onClose,
  onPostShared,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'repost' | 'external'>('repost');
  const [repostComment, setRepostComment] = useState('');
  const [repostCategory, setRepostCategory] = useState<PostCategory>(
    post?.category || 'general'
  );
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const postUrl = `${window.location.origin}/community/posts/${post.id}`;
  const shareText = `Check out this agricultural update from ${post.authorName} on AgriConnect: "${post.title || post.body?.slice(0, 60) || 'Farm Update'}"`;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'farmer':
        return { label: '🌾 Farmer', bg: '#dcfce7', color: '#15803d' };
      case 'supplier':
        return { label: '🏪 Supplier', bg: '#e0f2fe', color: '#0369a1' };
      case 'lgu':
      case 'lgu_staff':
      case 'lgu_officer':
        return { label: '🏛️ LGU Staff', bg: '#fef3c7', color: '#b45309' };
      case 'buyer':
        return { label: '🛒 Buyer', bg: '#f1f5f9', color: '#475569' };
      default:
        return { label: '👤 Member', bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    success('Link Copied!', 'Post link copied to clipboard.');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'AgriConnect Post',
          text: shareText,
          url: postUrl,
        });
      } catch {
        // User dismissed share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  const handleExternalShare = (platform: 'facebook' | 'viber' | 'whatsapp') => {
    let url = '';
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedText = encodeURIComponent(`${shareText}\n${postUrl}`);

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'viber':
        url = `viber://forward?text=${encodedText}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
    }

    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleRepostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newPost = await communityApi.createPost({
        body: repostComment.trim() || 'Shared a post',
        category: repostCategory,
        sharedPostId: post.id,
      });

      success('Post Shared!', 'This post has been shared to your community feed.');
      if (onPostShared) {
        onPostShared(newPost);
      }
      setRepostComment('');
      onClose();
    } catch (err: any) {
      error(
        'Failed to Share',
        err.response?.data?.error || 'Could not repost at this time. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const originalBadge = getRoleBadge(post.authorRole);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'reactionDockIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔗</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Share Post
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              fontWeight: 700,
              color: '#64748B',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Selection: Repost vs External Apps */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #F1F5F9',
            padding: '0 20px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('repost')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: 800,
              color: activeTab === 'repost' ? '#0E4A27' : '#64748B',
              borderBottom: activeTab === 'repost' ? '3px solid #0E4A27' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>🔄</span> Repost to Feed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: 800,
              color: activeTab === 'external' ? '#0E4A27' : '#64748B',
              borderBottom: activeTab === 'external' ? '3px solid #0E4A27' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>📲</span> External Apps & Link
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: REPOST WITH THOUGHTS */}
          {activeTab === 'repost' && (
            <form onSubmit={handleRepostSubmit}>
              {/* Current User Composer Area */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#0E4A27',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '15px',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <span>{user?.firstName ? user.firstName.charAt(0).toUpperCase() : '👨‍🌾'}</span>
                  {user?.photoUrl && (
                    <img
                      src={getImageUrl(user.photoUrl)}
                      alt={user.firstName}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      {user?.firstName} {user?.lastName}
                    </span>
                    <select
                      value={repostCategory}
                      onChange={(e) => setRepostCategory(e.target.value as PostCategory)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0E4A27',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="general">🌾 General Discussion</option>
                      <option value="crop_advice">🌱 Crop Advice</option>
                      <option value="pest_control">🐛 Pest & Disease</option>
                      <option value="market_talk">💰 Market Prices</option>
                      <option value="equipment">🚜 Tools & Equipment</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts about this post with farmers and community members..."
                    value={repostComment}
                    onChange={(e) => setRepostComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Embedded Preview of the Original Post */}
              <div
                style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '14px',
                  backgroundColor: '#FFFFFF',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#0E4A27',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    <span>{post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}</span>
                    {post.authorPhotoUrl && (
                      <img
                        src={getImageUrl(post.authorPhotoUrl)}
                        alt={post.authorName}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {post.authorName}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: originalBadge.color,
                          backgroundColor: originalBadge.bg,
                          padding: '1px 6px',
                          borderRadius: '8px',
                        }}
                      >
                        {originalBadge.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {post.title && post.title !== post.body && (
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, color: '#0E4A27' }}>
                    {post.title}
                  </h4>
                )}

                {post.body && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#334155',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.body}
                  </p>
                )}

                {(post.imageUrl || post.videoUrl) && (
                  <div
                    style={{
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0E4A27',
                      backgroundColor: '#ECFDF5',
                      padding: '3px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {post.videoUrl ? '🎬 Contains Video' : '📷 Contains Photo'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '14px',
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '14px',
                  }}
                >
                  {submitting ? 'Reposting...' : '🔄 Repost to Feed'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: EXTERNAL SHARING & COPY LINK */}
          {activeTab === 'external' && (
            <div>
              {/* Copy Direct Link Card */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '20px',
                }}
              >
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '8px' }}>
                  POST LINK
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={postUrl}
                    style={{
                      flex: 1,
                      padding: '9px 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      color: '#334155',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn btn-primary"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy Link'}
                  </button>
                </div>
              </div>

              {/* Social Media Share Buttons */}
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                SHARE VIA EXTERNAL APPS
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={() => handleExternalShare('facebook')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#93C5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1877F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '20px',
                      fontWeight: 800,
                    }}
                  >
                    f
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>Facebook</span>
                </button>

                {/* Viber Button */}
                <button
                  type="button"
                  onClick={() => handleExternalShare('viber')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAF5FF';
                    e.currentTarget.style.borderColor = '#D8B4FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#7360F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '18px',
                    }}
                  >
                    📞
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>Viber</span>
                </button>

                {/* WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => handleExternalShare('whatsapp')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0FDF4';
                    e.currentTarget.style.borderColor = '#86EFAC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '18px',
                    }}
                  >
                    💬
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>WhatsApp</span>
                </button>
              </div>

              {/* Native Mobile Share Sheet (if supported) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    border: '1.5px dashed #0E4A27',
                    background: '#F0FDF4',
                    color: '#0E4A27',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>📲</span> More Share Options (Device Share Sheet)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
