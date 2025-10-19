import { Music } from 'lucide-react';

import { formatDuration } from '@/shared/utils/common';

interface TrackCardProps {
  title: string;
  artist: string;
  album?: string;
  duration?: number; // в секундах
  coverUrl?: string; // может быть URL или base64 строка
  showCover?: boolean;
  coverSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'highlighted';
  onClick?: () => void;
  actionButton?: React.ReactNode;
  className?: string;
}

function TrackCard({
  title,
  artist,
  album,
  duration,
  coverUrl,
  showCover = true,
  coverSize = 'md',
  variant = 'default',
  onClick,
  actionButton,
  className = '',
}: TrackCardProps) {
  const getCoverSize = () => {
    switch (coverSize) {
      case 'sm': {
        return 'w-8 h-8';
      }
      case 'md': {
        return 'w-12 h-12';
      }
      case 'lg': {
        return 'w-16 h-16';
      }
      default: {
        return 'w-12 h-12';
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'highlighted': {
        return 'border rounded-lg bg-blue-50 border-blue-200';
      }
      case 'muted': {
        return 'bg-background';
      }
      default: {
        return 'border rounded-lg bg-muted/20';
      }
    }
  };

  const getClickableStyles = () => {
    let clickableClass = '';

    if (onClick) {
      clickableClass += 'cursor-pointer';

      switch (variant) {
        case 'highlighted': {
          clickableClass += ' hover:bg-muted/50 hover:border-gray-200';
          break;
        }
        default: {
          clickableClass += ' hover:bg-blue-50 hover:border-blue-200';
          break;
        }
      }
    }
    return clickableClass;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 w-full ${getVariantStyles()} ${getClickableStyles()} ${className}`}
      onClick={onClick}
    >
      {/* Cover */}
      {showCover && (
        <div className='flex-shrink-0'>
          {coverUrl
            ? (
                <img
                  src={coverUrl}
                  alt={album || title}
                  className={`${getCoverSize()} rounded`}
                />
              )
            : (
                <div className={`${getCoverSize()} bg-muted rounded flex items-center justify-center`}>
                  <Music className={`${coverSize === 'sm' ? 'h-4 w-4' : coverSize === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} text-muted-foreground`} />
                </div>
              )}
        </div>
      )}

      {/* Track Info */}
      <div className='flex-1 min-w-0'>
        <p className='font-medium break-words whitespace-normal'>{title}</p>
        <p className='text-sm text-muted-foreground break-words whitespace-normal'>{artist}</p>
        {album && (
          <p className='text-xs text-muted-foreground break-words whitespace-normal'>{album}</p>
        )}
      </div>

      {/* Duration */}
      {duration && (
        <div className='flex-shrink-0 text-xs text-muted-foreground'>
          {formatDuration(duration)}
        </div>
      )}

      {/* Action Button */}
      {actionButton && (
        <div className='flex-shrink-0'>
          {actionButton}
        </div>
      )}
    </div>
  );
}

export default TrackCard;
