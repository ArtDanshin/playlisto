'use client';

import { Music } from 'lucide-react';

interface ImageCoverProps {
  imageBase64?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'default' | 'loading';
  placeholder?: string;
}

function ImageCover({
  imageBase64, size = 'md', className = '', status = 'default', placeholder,
}: ImageCoverProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-52 h-52',
  };

  if (status === 'loading') {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-lg animate-pulse ${className}`} />
    );
  }

  if (imageBase64) {
    return (
      <img
        src={imageBase64}
        alt='Cover image'
        className={`${sizeClasses[size]} object-cover rounded-lg ${className}`}
      />
    );
  }

  const classes = {
    common: `${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center`,
    placeholder: `bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg`,
  };

  return (
    <div className={`${classes.common} ${placeholder ? classes.placeholder : ''} ${className}`}>
      { placeholder || <Music className='w-1/2 h-1/2 text-gray-400' />}
    </div>
  );
}

export default ImageCover;
