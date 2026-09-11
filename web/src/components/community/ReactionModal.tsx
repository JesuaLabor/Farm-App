import React, { useState, useEffect } from 'react';
import { communityApi } from '../../api/community';
import { getImageUrl } from '../../api';
import type { PostReaction, ReactionType } from '../../types/community';
import { REACTION_DEFINITIONS } from './ReactionPicker';

interface ReactionModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  initialReactions?: PostReaction[];
}

export const ReactionModal: React.FC<ReactionModalProps> = ({
  postId,
  isOpen,
  onClose,
  initialReactions,
}) => {
  const [reactions, setReactions] = useState<PostReaction[]>(initialReactions || []);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | ReactionType>('all');

  useEffect(() => {
    if (!isOpen || !postId) return;

    // Fetch live enriched reactions from backend
    let isMounted = true;
    setLoading(true);

    communityApi.getPostReactions(postId)
      .then((data) => {
        if (isMounted) {
          setReactions(data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load post reactions:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  // Compute counts per reaction type
  const reactionCounts: Partial<Record<ReactionType, number>> = {};
  reactions.forEach((r) => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });

  const availableTypes = (['like', 'celebrate', 'support', 'love', 'insight', 'funny'] as ReactionType[]).filter(
    (t) => (reactionCounts[t] || 0) > 0
  );

  const filteredList = selectedFilter === 'all'
    ? reactions
    : reactions.filter((r) => r.type === selectedFilter);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'farmer':
        return { label: '🌾 Farmer', bg: '#DCFCE7', color: '#15803D' };
      case 'supplier':
        return { label: '🏪 Supplier', bg: '#E0F2FE', color: '#0369A1' };
      case 'lgu':
      case 'lgu_staff':
      case 'lgu_officer':
        return { label: '🏛️ LGU Staff', bg: '#FEF3C7', color: '#B45309' };
      case 'buyer':
        return { label: '🛒 Buyer', bg: '#F1F5F9', color: '#475569' };
      default:
        return { label: '👤 Member', bg: '#F1F5F9', color: '#475569' };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
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
          maxWidth: '520px',
          maxHeight: '85vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '22px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Reactions
            </h3>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#64748B',
                background: '#F1F5F9',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {reactions.length}
            </span>
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
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            ✕
          </button>
        </div>

        {/* Reaction Filter Category Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderBottom: '1px solid #F1F5F9',
            overflowX: 'auto',
            background: '#F8FAFC',
          }}
        >
          {/* All Tab */}
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedFilter === 'all' ? '1.5px solid #0E4A27' : '1px solid transparent',
              background: selectedFilter === 'all' ? '#EAF6EE' : 'transparent',
              color: selectedFilter === 'all' ? '#0E4A27' : '#64748B',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>All</span>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>({reactions.length})</span>
          </button>

          {/* Individual Reaction Tabs */}
          {availableTypes.map((type) => {
            const def = REACTION_DEFINITIONS[type];
            const count = reactionCounts[type] || 0;
            const isSelected = selectedFilter === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedFilter(type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isSelected ? `1.5px solid ${def.color}` : '1px solid transparent',
                  background: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? def.color : '#64748B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {def.icon(16)}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Members List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {loading && reactions.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              Loading reactions...
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
              No reactions found in this category.
            </div>
          ) : (
            filteredList.map((r, idx) => {
              const rBadge = getRoleBadge(r.userRole);
              const def = REACTION_DEFINITIONS[r.type] || REACTION_DEFINITIONS.like;

              return (
                <div
                  key={r.userId ? `${r.userId}-${r.type}-${idx}` : idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Avatar with Overlaid Reaction Badge */}
                    <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#0E4A27',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '16px',
                          position: 'relative',
                        }}
                      >
                        <span>{r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}</span>
                        {r.userPhotoUrl && (
                          <img
                            src={getImageUrl(r.userPhotoUrl)}
                            alt={r.userName}
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

                      {/* Small Reaction Icon Badge at Bottom-Right of Avatar */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {def.icon(16)}
                      </div>
                    </div>

                    {/* Member Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                          {r.userName || 'Community Member'}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: rBadge.color,
                            backgroundColor: rBadge.bg,
                            padding: '1px 7px',
                            borderRadius: '10px',
                          }}
                        >
                          {rBadge.label}
                        </span>
                      </div>
                      {r.createdAt && (
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {formatTimeAgo(r.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reaction Tag Label */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: def.color,
                    }}
                  >
                    {def.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
