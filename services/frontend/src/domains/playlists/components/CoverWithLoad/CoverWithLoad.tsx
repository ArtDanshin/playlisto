'use client';

import { useEffect, useState, memo } from 'react';

import { ImageCover } from '@/shared/components/ImageCover';
import { playlistoDBService } from '@/infrastructure/services/playlisto-db';

interface CoverWithLoadProps {
  coverKey?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'default' | 'loading';
  placeholder?: string;
}

/**
 * TODO: Все картинки хранятся в состониях, соответственно в памяти. Нужно переделать так, чтобы их не хранить
 */
function CoverWithLoad({
  coverKey, size = 'md', className = '', status = 'default', placeholder,
}: CoverWithLoadProps) {
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCover() {
      setLoading(true);
      if (coverKey) {
        const cover = await playlistoDBService.getCover(coverKey);

        if (isMounted) setImageBase64(cover?.base64 || null);
      } else {
        setImageBase64(null);
      }
      setLoading(false);
    }

    loadCover();

    return () => {
      isMounted = false;
    };
  }, [coverKey]);

  return (
    <ImageCover
      imageBase64={imageBase64}
      size={size}
      className={className}
      status={loading ? 'loading' : status}
      placeholder={placeholder}
    />
  );
}

export default memo(CoverWithLoad);
