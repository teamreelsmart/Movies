'use client';

import { useState } from 'react';
import { DownloadSection } from './DownloadSection';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Episode {
  episodeNumber: number;
  title?: string;
  downloadLinks: Array<{
    title: string;
    size: string;
    url: string;
  }>;
}

interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

interface SeasonsSectionProps {
  seasons: Season[];
}

export function SeasonsSection({ seasons }: SeasonsSectionProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(
    seasons[0]?.seasonNumber || 1
  );
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  const currentSeason = seasons.find((s) => s.seasonNumber === selectedSeason);
  const currentEpisode = currentSeason?.episodes.find(
    (e) => e.episodeNumber === selectedEpisode
  );

  const episodeOptions = currentSeason?.episodes || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Season
          </label>
          <Select value={String(selectedSeason)} onValueChange={(val) => {
            setSelectedSeason(Number(val));
            setSelectedEpisode(1);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.seasonNumber} value={String(season.seasonNumber)}>
                  Season {season.seasonNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Episode
          </label>
          <Select value={String(selectedEpisode)} onValueChange={(val) => setSelectedEpisode(Number(val))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {episodeOptions.map((episode) => (
                <SelectItem key={episode.episodeNumber} value={String(episode.episodeNumber)}>
                  Episode {episode.episodeNumber}
                  {episode.title && ` - ${episode.title}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentEpisode ? (
        <div className="space-y-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Download Links
            </h3>
            <DownloadSection links={currentEpisode.downloadLinks} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-foreground/60">No episodes available</p>
        </div>
      )}
    </div>
  );
}
