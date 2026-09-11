import React, { useState, useRef, useEffect } from 'react';
import type { ReactionType } from '../../types/community';

interface ReactionDef {
  type: ReactionType;
  label: string;
  color: string;
  activeClass: string;
  icon: (size?: number) => React.ReactNode;
}

export const REACTION_DEFINITIONS: Record<ReactionType, ReactionDef> = {
  like: {
    type: 'like',
    label: 'Like',
    color: '#0a66c2',
    activeClass: 'active-like',
    icon: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
        <circle cx="12" cy="12" r="11" fill="url(#like-grad)" />
        <path
          d="M8 11.5v6a1 1 0 001 1h1.5a1 1 0 001-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1zm3.5 6h4.8a1.5 1.5 0 001.48-1.26l.8-4.5A1.5 1.5 0 0017.1 10H14V7.5c0-.83-.67-1.5-1.5-1.5l-.29.07c-.42.1-.71.48-.71.91v.52L10.3 10.7a1 1 0 00-.3.72v5.08c0 .55.45 1 1 1h.5z"
          fill="#FFFFFF"
        />
        <defs>
          <linearGradient id="like-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  celebrate: {
    type: 'celebrate',
    label: 'Celebrate',
    color: '#059669',
    activeClass: 'active-celebrate',
    icon: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
        <circle cx="12" cy="12" r="11" fill="url(#cel-grad)" />
        <path
          d="M7.8 12.8l2.9-2.9a1.2 1.2 0 011.7 1.7l-2.1 2.1 2.8-1.1a1.2 1.2 0 011.5 1.5l-3.3 3.3a2 2 0 01-2.8 0L6.4 15.3a1.8 1.8 0 010-2.5zm4.9-5.1a1 1 0 011.4 0l3.5 3.5a1.8 1.8 0 010 2.5l-2.1 2.1-1.7-1.7 2.1-2.1a1.2 1.2 0 00-1.7-1.7l-2.9 2.9-1.4-1.4 2.8-2.8a1 1 0 010-1.3z"
          fill="#FFFFFF"
        />
        <path d="M12 4.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" fill="#FEF08A" />
        <path d="M17.5 7l.3.7.7.3-.7.3-.3.7-.3-.7-.7-.3.7-.3.3-.7z" fill="#FEF08A" />
        <defs>
          <linearGradient id="cel-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  support: {
    type: 'support',
    label: 'Support',
    color: '#4f46e5',
    activeClass: 'active-support',
    icon: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
        <circle cx="12" cy="12" r="11" fill="url(#sup-grad)" />
        <path
          d="M12 7.2a2.3 2.3 0 013.3 0c.9.9.9 2.3 0 3.2l-3.3 3.3-3.3-3.3a2.3 2.3 0 010-3.2 2.3 2.3 0 013.3 0z"
          fill="#FDA4AF"
        />
        <path
          d="M6 14.8a1.5 1.5 0 012.1-.3l2.4 1.8a2.5 2.5 0 003 0l2.4-1.8a1.5 1.5 0 012.1.3 1.5 1.5 0 01-.3 2.1l-3 2.2a4.5 4.5 0 01-5.4 0l-3-2.2a1.5 1.5 0 01-.3-2.1z"
          fill="#FFFFFF"
        />
        <defs>
          <linearGradient id="sup-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  love: {
    type: 'love',
    label: 'Love',
    color: '#e11d48',
    activeClass: 'active-love',
    icon: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
        <circle cx="12" cy="12" r="11" fill="url(#love-grad)" />
        <path
          d="M12 17.5l-1.15-1.05C6.77 12.72 4 10.21 4 7.1A4.1 4.1 0 018.1 3c1.64 0 3.22.76 3.9 1.96A4.1 4.1 0 0115.9 3 4.1 4.1 0 0120 7.1c0 3.11-2.77 5.62-6.85 9.35L12 17.5z"
          fill="#FFFFFF"
        />
        <defs>
          <linearGradient id="love-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fb7185" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  insight: {
    type: 'insight',
    label: 'Insight',
    color: '#d97706',
    activeClass: 'active-insight',
    icon: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
        <circle cx="12" cy="12" r="11" fill="url(#ins-grad)" />
        <path
          d="M12 5.5a4.5 4.5 0 00-3.3 7.6c.6.7 1 1.6 1.1 2.5h4.4c.1-.9.5-1.8 1.1-2.5A4.5 4.5 0 0012 5.5zm-1.8 11.2h3.6v.7c0 .5-.4.9-.9.9h-1.8a.9.9 0 01-.9-.9v-.7z"
          fill="#FFFFFF"
        />
        <path d="M12 3v1.5M17.3 5.3l-1.1 1.1M6.7 5.3l1.1 1.1" stroke="#FEF08A" strokeWidth="1.4" strokeLinecap="round" />
        <defs>
          <linearGradient id="ins-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  funny: {
    type: 'funny',
    label: 'Funny',
    color: '#0284c7',
    activeClass: 'active-funny',
    icon: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
        <circle cx="12" cy="12" r="11" fill="url(#fun-grad)" />
        <path d="M8 9.5l1.5-1 1.5 1M13 9.5l1.5-1 1.5 1" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M7.5 13.2a4.5 4.5 0 009 0H7.5z"
          fill="#FFFFFF"
        />
        <path
          d="M9 13.2a3 3 0 006 0H9z"
          fill="#FDA4AF"
        />
        <defs>
          <linearGradient id="fun-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
};

const ORDERED_REACTIONS: ReactionType[] = ['like', 'celebrate', 'support', 'love', 'insight', 'funny'];

interface ReactionPickerProps {
  myReaction?: ReactionType;
  totalReactions?: number;
  reactionCounts?: Record<ReactionType, number>;
  onReact: (reaction: ReactionType) => void;
  disabled?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  myReaction,
  onReact,
  disabled = false,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPopover(true);
    }, 220);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPopover(false);
      setHoveredReaction(null);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setShowPopover(false);
    // If user already reacted, clicking toggles off (un-reacts with same reaction)
    if (myReaction) {
      onReact(myReaction);
    } else {
      onReact('like');
    }
  };

  const handleSelect = (e: React.MouseEvent, reaction: ReactionType) => {
    e.stopPropagation();
    if (disabled) return;
    setShowPopover(false);
    setHoveredReaction(null);
    onReact(reaction);
  };

  const activeDef = myReaction ? REACTION_DEFINITIONS[myReaction] : null;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* LinkedIn-Style Floating Reaction Bar Popover */}
      {showPopover && (
        <div className="reaction-popover-dock">
          {ORDERED_REACTIONS.map((type) => {
            const def = REACTION_DEFINITIONS[type];
            const isHovered = hoveredReaction === type;

            return (
              <button
                key={type}
                type="button"
                onClick={(e) => handleSelect(e, type)}
                onMouseEnter={() => setHoveredReaction(type)}
                className="reaction-dock-btn"
                title={def.label}
              >
                {/* Floating Tooltip Pill */}
                {isHovered && (
                  <span className="reaction-tooltip-tag">
                    {def.label}
                  </span>
                )}
                {def.icon(32)}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className={`post-action-btn ${activeDef ? activeDef.activeClass : ''}`}
      >
        {activeDef ? (
          <>
            {activeDef.icon(20)}
            <span>{activeDef.label}</span>
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span>Like</span>
          </>
        )}
      </button>
    </div>
  );
};

// Stacked Reaction Icons Display (LinkedIn / FB style)
interface ReactionBadgeListProps {
  reactionCounts?: Record<ReactionType, number>;
  totalReactions: number;
  onClick?: () => void;
}

export const ReactionBadgeList: React.FC<ReactionBadgeListProps> = ({
  reactionCounts = {} as Record<ReactionType, number>,
  totalReactions,
  onClick,
}) => {
  if (totalReactions <= 0) return null;

  // Find top reactions that have at least 1 count, ordered by count descending
  const activeTypes = ORDERED_REACTIONS.filter(
    (type) => (reactionCounts[type] || 0) > 0
  ).sort((a, b) => (reactionCounts[b] || 0) - (reactionCounts[a] || 0));

  // Take top 3 for stacking
  const topReactions = activeTypes.length > 0 ? activeTypes.slice(0, 3) : (['like'] as ReactionType[]);

  return (
    <div onClick={onClick} className="stacked-badges-container">
      <div className="stacked-icons-group">
        {topReactions.map((type, idx) => (
          <span
            key={type}
            className="stacked-icon-circle"
            style={{ zIndex: 10 - idx }}
          >
            {REACTION_DEFINITIONS[type]?.icon(18)}
          </span>
        ))}
      </div>
      <span className="stacked-badges-count" style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
        {totalReactions.toLocaleString()} {totalReactions === 1 ? 'reaction' : 'reactions'}
      </span>
    </div>
  );
};
