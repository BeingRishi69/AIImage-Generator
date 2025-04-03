'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, alt, size = 40, className = '' }: AvatarProps) {
  const [error, setError] = useState(false);
  
  // If no src or error loading image, show default avatar
  if (!src || error) {
    return (
      <div
        className={`bg-purple-100 text-purple-600 flex items-center justify-center rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <FiUser size={size * 0.5} />
      </div>
    );
  }
  
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
} 