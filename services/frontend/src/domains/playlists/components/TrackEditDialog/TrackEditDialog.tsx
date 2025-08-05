'use client';

import { useState, useEffect } from 'react';
import { Music, FileText, Info } from 'lucide-react';

import type { Track } from '@/shared/types/playlist';
import { Button } from '@/shared/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Separator } from '@/shared/components/ui/Separator';
import { EditTrackForm as EditTrackFormFromSpotify } from '@/domains/spotifySource/components/EditTrackForm';

interface TrackEditDialogProps {
  track: Track;
  onTrackUpdate: (updatedTrack: Track) => void;
  children: React.ReactNode;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
/* TODO: Глянуть логику заполнения формы при изменении трека */
function TrackEditDialog({ track, onTrackUpdate, children }: TrackEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'spotify' | 'm3u'>('general');

  // Form state
  const [formData, setFormData] = useState({
    title: track.title,
    artist: track.artist,
    album: track.album,
  });

  // M3U data form state
  const [m3uFormData, setM3uFormData] = useState({
    title: track.m3uData?.title || track.title || '',
    artist: track.m3uData?.artist || track.artist || '',
    url: track.m3uData?.url || '',
    duration: track.m3uData?.duration || 0,
  });

  // Local track state for display
  const [localTrack, setLocalTrack] = useState<Track>(track);

  // Обновляем форму при изменении трека
  useEffect(() => {
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album,
    });
    setM3uFormData({
      title: track.m3uData?.title || track.title || '',
      artist: track.m3uData?.artist || track.artist || '',
      url: track.m3uData?.url || '',
      duration: track.m3uData?.duration || 0,
    });
    setLocalTrack(track);
  }, [track]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleM3uInputChange = (field: keyof typeof m3uFormData, value: string | number) => {
    setM3uFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updatedTrack: Track = {
      ...localTrack,
      title: formData.title,
      artist: formData.artist,
      album: formData.album,
      m3uData: {
        title: m3uFormData.title,
        artist: m3uFormData.artist,
        url: m3uFormData.url,
        duration: m3uFormData.duration,
      },
      // Сохраняем Spotify данные из локального состояния
      spotifyData: localTrack.spotifyData,
      coverKey: localTrack.coverKey,
    };
    onTrackUpdate(updatedTrack);
    setIsOpen(false);
  };

  const renderGeneralTab = () => (
    <div className='space-y-4'>
      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='title'>Название</Label>
          <Input
            id='title'
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder='Название трека'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='artist'>Исполнитель</Label>
          <Input
            id='artist'
            value={formData.artist}
            onChange={(e) => handleInputChange('artist', e.target.value)}
            placeholder='Исполнитель'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='album'>Альбом</Label>
          <Input
            id='album'
            value={formData.album}
            onChange={(e) => handleInputChange('album', e.target.value)}
            placeholder='Альбом'
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2'>
        <h4 className='text-sm font-medium flex items-center gap-2'>
          <Info className='h-4 w-4' />
          Информация о треке
        </h4>
        <div className='text-sm text-muted-foreground space-y-1'>
          <p>Позиция в плейлисте: {localTrack.position}</p>
          {localTrack.spotifyData && (
            <p className='text-green-600'>✓ Связан со Spotify</p>
          )}
          {localTrack.m3uData && (
            <p className='text-blue-600'>✓ Имеет данные файла</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSpotifyTab = () => (
    <EditTrackFormFromSpotify track={track} onDataChange={(spotifyData) => {
      setLocalTrack((prev) => ({ 
        ...prev,
        album: prev.album || spotifyData.album,
        duration: prev.duration || Math.round(spotifyData.duration / 1000),
        spotifyData
      }))
    }}/>
  );

  const renderM3UTab = () => (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <FileText className='h-4 w-4' />
        <span className='font-medium'>Данные файла</span>
        {localTrack.m3uData && (
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

      {localTrack.m3uData && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Текущие данные файла:</h4>
          <div className='p-3 border rounded-lg bg-muted/20'>
            <p className='text-sm'>
              <span className='font-medium'>Название:</span> {localTrack.m3uData.title}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Исполнитель:</span> {localTrack.m3uData.artist}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Путь:</span> {localTrack.m3uData.url}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Длительность:</span> {formatDuration(localTrack.m3uData.duration)}
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

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'general': {
        return renderGeneralTab();
      }
      case 'spotify': {
        return renderSpotifyTab();
      }
      case 'm3u': {
        return renderM3UTab();
      }
      default: {
        return renderGeneralTab();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Редактировать трек</DialogTitle>
          <DialogDescription>
            Измените информацию о треке и свяжите его с внешними источниками
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {/* Tab Navigation */}
          <div className='flex border-b sticky top-0 bg-background z-10'>
            <button
              type='button'
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info className='h-4 w-4 inline mr-2' />
              Общая информация
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('spotify')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'spotify'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Music className='h-4 w-4 inline mr-2' />
              Spotify
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('m3u')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'm3u'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className='h-4 w-4 inline mr-2' />
              Данные файла
            </button>
          </div>

          {/* Tab Content */}
          <div className='min-h-[400px]'>
            {renderCurrentTab()}
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TrackEditDialog;
