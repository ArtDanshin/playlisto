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
import { EditTrackForm as EditTrackFormFromM3U } from '@/domains/fileSource/components/EditTrackForm';

interface TrackEditDialogProps {
  track: Track;
  onTrackUpdate: (updatedTrack: Track) => void;
  children: React.ReactNode;
}

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

  // Local track state for display
  const [localTrack, setLocalTrack] = useState<Track>(track);

  // Обновляем форму при изменении трека
  useEffect(() => {
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album,
    });
    setLocalTrack(track);
  }, [track]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
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
    <EditTrackFormFromM3U track={track} onDataChange={(m3uData) => {
      setLocalTrack((prev) => ({ 
        ...prev,
        m3uData
      }))
    }}/>
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
