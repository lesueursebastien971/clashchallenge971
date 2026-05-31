import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
};

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const fallbackUrl = 'https://images.pexels.com/photos/163064/play-student-web-learning-163064.jpeg?auto=compress&cs=tinysrgb&w=150';

  return (
    <img
      src={src || fallbackUrl}
      alt={alt}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
