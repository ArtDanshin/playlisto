'use client';

import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Minus, Music,
} from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/Collapsible';
import { TrackCard } from '@/shared/components/TrackCard';
import type { Track } from '@/shared/types/playlist';

interface PlaylistComparisonProps {
  addTracks: Track[];
  missingTracks: Track[];
  commonTracks: Track[];
  hasOrderDifference: boolean;
}

interface ExpandedSections {
  addTracks: boolean;
  missingTracks: boolean;
  commonTracks: boolean;
}

function PlaylistComparison({
  addTracks,
  missingTracks,
  commonTracks,
  hasOrderDifference,
}: PlaylistComparisonProps) {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    addTracks: false,
    missingTracks: false,
    commonTracks: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderTrackList = (tracks: Track[], emptyMessage: string) => {
    if (tracks.length === 0) {
      return (
        <div className='text-sm text-muted-foreground p-2 bg-muted rounded'>
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className='divide-y-1'>
        {tracks.map((track) => (
          <TrackCard
            key={`${track.title}-${track.artist}-${track.duration}`}
            title={track.title}
            artist={track.artist}
            album={track.album}
            duration={track.duration}
            coverUrl={track.spotifyData?.coverUrl || track.coverKey}
            variant='muted'
          />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div>
        <h4 className='font-medium mb-2'>Сравнение плейлистов</h4>
      </div>

      {/* Detailed Track Lists */}
      <div className='space-y-3'>
        {/* Add Tracks */}
        {addTracks.length > 0 && (
          <div className='border rounded-lg'>
            <Collapsible
              open={expandedSections.addTracks}
              onOpenChange={() => toggleSection('addTracks')}
            >
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b cursor-pointer hover:bg-muted/50'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-medium flex items-center gap-2'>
                      <Plus className='h-4 w-4 text-green-600' />
                      Новые треки ({addTracks.length})
                    </div>
                    {expandedSections.addTracks
                      ? (
                          <ChevronDown className='h-4 w-4' />
                        )
                      : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='p-3'>
                  {renderTrackList(addTracks, 'Нет новых треков')}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Missing Tracks */}
        {missingTracks.length > 0 && (
          <div className='border rounded-lg'>
            <Collapsible
              open={expandedSections.missingTracks}
              onOpenChange={() => toggleSection('missingTracks')}
            >
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b cursor-pointer hover:bg-muted/50'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-medium flex items-center gap-2'>
                      <Minus className='h-4 w-4 text-red-600' />
                      Удаляемые треки ({missingTracks.length})
                    </div>
                    {expandedSections.missingTracks
                      ? (
                          <ChevronDown className='h-4 w-4' />
                        )
                      : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='p-3'>
                  {renderTrackList(missingTracks, 'Нет треков для удаления')}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Common Tracks */}
        {commonTracks.length > 0 && (
          <div className='border rounded-lg'>
            <Collapsible
              open={expandedSections.commonTracks}
              onOpenChange={() => toggleSection('commonTracks')}
            >
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b cursor-pointer hover:bg-muted/50'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-medium flex items-center gap-2'>
                      <Music className='h-4 w-4 text-blue-600' />
                      Общие треки ({commonTracks.length})
                    </div>
                    {expandedSections.commonTracks
                      ? (
                          <ChevronDown className='h-4 w-4' />
                        )
                      : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='p-3'>
                  {renderTrackList(commonTracks, 'Нет общих треков')}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* No Changes Message */}
        {addTracks.length === 0 && missingTracks.length === 0 && (
          <div className='text-sm text-muted-foreground p-2 bg-muted rounded'>
            Плейлисты идентичны по составу треков
          </div>
        )}

        {hasOrderDifference && (
          <div className='text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200'>
            ⚠️ Обнаружены различия в порядке треков
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistComparison;
