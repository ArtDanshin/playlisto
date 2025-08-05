'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import type { Track, TrackM3UData } from '@/shared/types/playlist';
import { formatDuration } from '@/shared/utils/common'; 
 
interface EditTrackFormProps {
  track: Track;
  onDataChange: (data: TrackM3UData) => void; 
}

function EditTrackForm({ track, onDataChange }: EditTrackFormProps) {
  const [m3uFormData, setM3uFormData] = useState<TrackM3UData>({
    title: track.m3uData?.title || '',
    artist: track.m3uData?.artist || '',
    url: track.m3uData?.url || '',
    duration: track.m3uData?.duration || 0,
  });

  const handleM3uInputChange = (field: keyof TrackM3UData, value: string | number) => {
    setM3uFormData((prev) => {
      const newM3UData = {
        ...prev,
        [field]: value,
      }

      onDataChange(newM3UData);

      return newM3UData;
    })
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <FileText className='h-4 w-4' />
        <span className='font-medium'>Данные файла</span>
        {track.m3uData && (
          <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
            Настроено
          </span>
        )}
      </div>

      <div className='space-y-4'>
        <div className='grid gap-2'>
          <Label htmlFor='m3u-title'>Название трека</Label>
          <Input
            id='m3u-title'
            value={m3uFormData.title}
            onChange={(e) => handleM3uInputChange('title', e.target.value)}
            placeholder='Название трека'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='m3u-artist'>Исполнитель</Label>
          <Input
            id='m3u-artist'
            value={m3uFormData.artist}
            onChange={(e) => handleM3uInputChange('artist', e.target.value)}
            placeholder='Исполнитель'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='m3u-url'>Путь к файлу</Label>
          <Input
            id='m3u-url'
            value={m3uFormData.url}
            onChange={(e) => handleM3uInputChange('url', e.target.value)}
            placeholder='file:///path/to/track.mp3'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='m3u-duration'>Длительность (секунды)</Label>
          <Input
            id='m3u-duration'
            type='number'
            value={m3uFormData.duration}
            onChange={(e) => handleM3uInputChange('duration', Number.parseInt(e.target.value, 10) || 0)}
            placeholder='180'
          />
        </div>
      </div>

      {track.m3uData && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Текущие данные файла:</h4>
          <div className='p-3 border rounded-lg bg-muted/20'>
            <p className='text-sm'>
              <span className='font-medium'>Название:</span> {track.m3uData.title}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Исполнитель:</span> {track.m3uData.artist}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Путь:</span> {track.m3uData.url}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Длительность:</span> {formatDuration(track.m3uData.duration)}
            </p>
          </div>
          <p className='text-xs text-blue-600 bg-blue-50 p-2 rounded'>
            {/* eslint-disable-next-line react-classic/no-unescaped-entities */}
            💡 Изменения будут сохранены при нажатии кнопки "Сохранить"
          </p>
        </div>
      )}
    </div>
  );
}

export default EditTrackForm;
