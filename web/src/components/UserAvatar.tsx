import React from 'react';
import { getImageUrl } from '../api';

export interface UserAvatarProps {
  photoUrl?: string;
  name?: string;
  initials?: string;
  size?: number;
  bg?: string;
  color?: string;
  border?: string;
  fontSize?: string;
  style?: React.CSSProperties;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoUrl,
  name = 'User',
  initials = '?',
  size = 48,
  bg = '#E8F5E9',
  color = '#1B5E20',
  border,
  fontSize = '16px',
  style,
}) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bg,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: fontSize,
        flexShrink: 0,
        border: border || `2px solid ${color}22`,
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        ...style,
      }}
    >
      <span>{initials}</span>
      {photoUrl && (
        <img
          src={getImageUrl(photoUrl)}
          alt={name}
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
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
};
