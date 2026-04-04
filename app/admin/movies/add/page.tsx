'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface DownloadLink {
  title: string;
  size: string;
  url: string;
}

interface Episode {
  episodeNumber: number;
  title: string;
  downloadLinks: DownloadLink[];
}

interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

function AddMovieContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isSeries = searchParams.get('type') === 'series';
  const [loading, setLoading] = useState(false);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    storyline: '',
    imdbRating: 0,
    releaseDate: new Date().toISOString().split('T')[0],
    genres: [''],
    language: 'English',
    runtime: '',
    qualityType: '1080p',
    availableQualities: ['1080p'],
    type: isSeries ? 'series' : 'movie',
    posterUrl: '',
    screenshots: [''],
    downloadLinks: [{ title: '', size: '', url: '' }] as DownloadLink[],
    seasons: isSeries ? [{ seasonNumber: 1, episodes: [{ episodeNumber: 1, title: '', downloadLinks: [{ title: '', size: '', url: '' }] }] }] : [],
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: string,
    index: number,
    subField: string,
    value: any
  ) => {
    setFormData((prev) => {
      const arr = [...(prev[field as keyof typeof prev] as any[])];
      if (subField) {
        arr[index] = { ...arr[index], [subField]: value };
      } else {
        arr[index] = value;
      }
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: string, defaultItem: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[]), defaultItem],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index),
    }));
  };


  const selectedSeason = formData.seasons.find((s) => s.seasonNumber === selectedSeasonNumber);
  const selectedEpisode = selectedSeason?.episodes.find(
    (e) => e.episodeNumber === selectedEpisodeNumber
  );

  const addSeason = () => {
    const nextSeasonNumber =
      formData.seasons.length > 0
        ? Math.max(...formData.seasons.map((s) => s.seasonNumber)) + 1
        : 1;

    const nextSeasons = [
      ...formData.seasons,
      {
        seasonNumber: nextSeasonNumber,
        episodes: [
          {
            episodeNumber: 1,
            title: '',
            downloadLinks: [{ title: '', size: '', url: '' }],
          },
        ],
      },
    ];

    handleChange('seasons', nextSeasons);
    setSelectedSeasonNumber(nextSeasonNumber);
    setSelectedEpisodeNumber(1);
  };

  const addEpisodeToSeason = (seasonNumber: number) => {
    const nextSeasons = formData.seasons.map((season) => {
      if (season.seasonNumber !== seasonNumber) return season;

      const nextEpisodeNumber =
        season.episodes.length > 0
          ? Math.max(...season.episodes.map((e) => e.episodeNumber)) + 1
          : 1;

      return {
        ...season,
        episodes: [
          ...season.episodes,
          {
            episodeNumber: nextEpisodeNumber,
            title: '',
            downloadLinks: [{ title: '', size: '', url: '' }],
          },
        ],
      };
    });

    handleChange('seasons', nextSeasons);
    setSelectedEpisodeNumber(
      nextSeasons.find((s) => s.seasonNumber === seasonNumber)?.episodes.slice(-1)[0]?.episodeNumber || 1
    );
  };

  const removeSeason = (seasonNumber: number) => {
    const nextSeasons = formData.seasons.filter((s) => s.seasonNumber !== seasonNumber);
    handleChange('seasons', nextSeasons);

    if (!nextSeasons.length) {
      setSelectedSeasonNumber(1);
      setSelectedEpisodeNumber(1);
      return;
    }

    const fallbackSeason = nextSeasons[0];
    setSelectedSeasonNumber(fallbackSeason.seasonNumber);
    setSelectedEpisodeNumber(fallbackSeason.episodes[0]?.episodeNumber || 1);
  };

  const removeEpisode = (seasonNumber: number, episodeNumber: number) => {
    const nextSeasons = formData.seasons.map((season) => {
      if (season.seasonNumber !== seasonNumber) return season;
      return {
        ...season,
        episodes: season.episodes.filter((e) => e.episodeNumber !== episodeNumber),
      };
    });

    handleChange('seasons', nextSeasons);
    const fallbackEpisode =
      nextSeasons
        .find((s) => s.seasonNumber === seasonNumber)
        ?.episodes[0]?.episodeNumber || 1;
    setSelectedEpisodeNumber(fallbackEpisode);
  };

  const updateEpisodeField = (
    seasonNumber: number,
    episodeNumber: number,
    field: 'title' | 'episodeNumber',
    value: string | number
  ) => {
    const nextSeasons = formData.seasons.map((season) => {
      if (season.seasonNumber !== seasonNumber) return season;

      return {
        ...season,
        episodes: season.episodes.map((episode) =>
          episode.episodeNumber === episodeNumber
            ? {
                ...episode,
                [field]: value,
              }
            : episode
        ),
      };
    });

    handleChange('seasons', nextSeasons);
  };

  const updateEpisodeDownloadLink = (
    seasonNumber: number,
    episodeNumber: number,
    linkIndex: number,
    field: keyof DownloadLink,
    value: string
  ) => {
    const nextSeasons = formData.seasons.map((season) => {
      if (season.seasonNumber !== seasonNumber) return season;

      return {
        ...season,
        episodes: season.episodes.map((episode) => {
          if (episode.episodeNumber !== episodeNumber) return episode;

          return {
            ...episode,
            downloadLinks: episode.downloadLinks.map((link, idx) =>
              idx === linkIndex ? { ...link, [field]: value } : link
            ),
          };
        }),
      };
    });

    handleChange('seasons', nextSeasons);
  };

  const addEpisodeDownloadLink = (seasonNumber: number, episodeNumber: number) => {
    const nextSeasons = formData.seasons.map((season) => {
      if (season.seasonNumber !== seasonNumber) return season;

      return {
        ...season,
        episodes: season.episodes.map((episode) =>
          episode.episodeNumber === episodeNumber
            ? {
                ...episode,
                downloadLinks: [...episode.downloadLinks, { title: '', size: '', url: '' }],
              }
            : episode
        ),
      };
    });

    handleChange('seasons', nextSeasons);
  };

  const removeEpisodeDownloadLink = (
    seasonNumber: number,
    episodeNumber: number,
    linkIndex: number
  ) => {
    const nextSeasons = formData.seasons.map((season) => {
      if (season.seasonNumber !== seasonNumber) return season;

      return {
        ...season,
        episodes: season.episodes.map((episode) =>
          episode.episodeNumber === episodeNumber
            ? {
                ...episode,
                downloadLinks: episode.downloadLinks.filter((_, idx) => idx !== linkIndex),
              }
            : episode
        ),
      };
    });

    handleChange('seasons', nextSeasons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/movies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create movie');
      }

      toast({
        title: 'Success',
        description: `${isSeries ? 'Series' : 'Movie'} created successfully!`,
      });

      router.push('/admin/movies');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create movie',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Add {isSeries ? 'Series' : 'Movie'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 rounded-lg border border-border bg-card p-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-3">
                Basic Information
              </h2>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title *</FieldLabel>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    className="bg-background border-border"
                    placeholder="Movie/Series title"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="storyline">Storyline *</FieldLabel>
                  <textarea
                    id="storyline"
                    value={formData.storyline}
                    onChange={(e) => handleChange('storyline', e.target.value)}
                    required
                    className="w-full rounded-md bg-background border border-border px-3 py-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Full storyline/plot"
                    rows={5}
                  />
                </Field>
              </FieldGroup>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="imdbRating">IMDB Rating</FieldLabel>
                    <Input
                      id="imdbRating"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.imdbRating}
                      onChange={(e) => handleChange('imdbRating', parseFloat(e.target.value))}
                      className="bg-background border-border"
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="releaseDate">Release Date *</FieldLabel>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => handleChange('releaseDate', e.target.value)}
                      required
                      className="bg-background border-border"
                    />
                  </Field>
                </FieldGroup>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="language">Language *</FieldLabel>
                    <Input
                      id="language"
                      value={formData.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      required
                      className="bg-background border-border"
                      placeholder="English, Hindi, etc."
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="runtime">Runtime</FieldLabel>
                    <Input
                      id="runtime"
                      value={formData.runtime}
                      onChange={(e) => handleChange('runtime', e.target.value)}
                      className="bg-background border-border"
                      placeholder="2h 30m"
                    />
                  </Field>
                </FieldGroup>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="posterUrl">Poster URL *</FieldLabel>
                  <Input
                    id="posterUrl"
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => handleChange('posterUrl', e.target.value)}
                    required
                    className="bg-background border-border"
                    placeholder="https://example.com/poster.jpg"
                  />
                </Field>
              </FieldGroup>
            </div>

            {/* Genres */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-semibold text-foreground">Genres</h2>
                <Button
                  type="button"
                  onClick={() => addArrayItem('genres', '')}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Genre
                </Button>
              </div>

              {formData.genres.map((genre, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={genre}
                    onChange={(e) => handleArrayChange('genres', idx, '', e.target.value)}
                    className="bg-background border-border"
                    placeholder="Genre name"
                  />
                  {formData.genres.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeArrayItem('genres', idx)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Quality & Availability */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-semibold text-foreground">Quality & Availability</h2>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="qualityType">Primary Quality *</FieldLabel>
                  <Input
                    id="qualityType"
                    value={formData.qualityType}
                    onChange={(e) => handleChange('qualityType', e.target.value)}
                    required
                    className="bg-background border-border"
                    placeholder="1080p, 720p, etc."
                  />
                </Field>
              </FieldGroup>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Available Qualities</label>
                <div className="flex flex-wrap gap-2">
                  {['480p', '720p', '1080p', '2K', '4K'].map((quality) => (
                    <button
                      key={quality}
                      type="button"
                      onClick={() => {
                        const arr = formData.availableQualities.includes(quality)
                          ? formData.availableQualities.filter((q) => q !== quality)
                          : [...formData.availableQualities, quality];
                        handleChange('availableQualities', arr);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.availableQualities.includes(quality)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {isSeries ? 'Combined Series Download Links (Optional)' : 'Download Links'}
                </h2>
                <Button
                  type="button"
                  onClick={() => addArrayItem('downloadLinks', { title: '', size: '', url: '' })}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              {formData.downloadLinks.map((link, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border bg-background/50 p-4">
                  <Input
                    value={link.title}
                    onChange={(e) =>
                      handleArrayChange('downloadLinks', idx, 'title', e.target.value)
                    }
                    className="bg-background border-border"
                    placeholder="Link title (e.g., '1080p BluRay')"
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      value={link.size}
                      onChange={(e) =>
                        handleArrayChange('downloadLinks', idx, 'size', e.target.value)
                      }
                      className="bg-background border-border"
                      placeholder="File size (e.g., '2.5 GB')"
                    />
                    <Input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        handleArrayChange('downloadLinks', idx, 'url', e.target.value)
                      }
                      className="bg-background border-border"
                      placeholder="Download URL"
                    />
                  </div>
                  {formData.downloadLinks.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeArrayItem('downloadLinks', idx)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>


            {isSeries && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-xl font-semibold text-foreground">Seasons & Episodes</h2>
                  <Button type="button" onClick={addSeason} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Season
                  </Button>
                </div>

                {formData.seasons.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="selectedSeason">Select Season</FieldLabel>
                        <select
                          id="selectedSeason"
                          value={selectedSeasonNumber}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setSelectedSeasonNumber(value);
                            const fallbackEpisode =
                              formData.seasons.find((s) => s.seasonNumber === value)?.episodes[0]
                                ?.episodeNumber || 1;
                            setSelectedEpisodeNumber(fallbackEpisode);
                          }}
                          className="w-full rounded-md bg-background border border-border px-3 py-2 text-foreground"
                        >
                          {formData.seasons.map((season) => (
                            <option key={season.seasonNumber} value={season.seasonNumber}>
                              Season {season.seasonNumber}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </FieldGroup>

                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="selectedEpisode">Select Episode</FieldLabel>
                        <select
                          id="selectedEpisode"
                          value={selectedEpisodeNumber}
                          onChange={(e) => setSelectedEpisodeNumber(Number(e.target.value))}
                          className="w-full rounded-md bg-background border border-border px-3 py-2 text-foreground"
                        >
                          {(selectedSeason?.episodes || []).map((episode) => (
                            <option key={episode.episodeNumber} value={episode.episodeNumber}>
                              Episode {episode.episodeNumber}{episode.title ? ` - ${episode.title}` : ''}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </FieldGroup>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addEpisodeToSeason(selectedSeasonNumber)}
                    disabled={!selectedSeason}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Episode
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeSeason(selectedSeasonNumber)}
                    disabled={formData.seasons.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Season
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeEpisode(selectedSeasonNumber, selectedEpisodeNumber)}
                    disabled={!selectedSeason || (selectedSeason?.episodes.length || 0) <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Episode
                  </Button>
                </div>

                {selectedEpisode && (
                  <div className="space-y-4 rounded-lg border border-border bg-background/50 p-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="episodeTitle">Episode Title</FieldLabel>
                        <Input
                          id="episodeTitle"
                          value={selectedEpisode.title}
                          onChange={(e) =>
                            updateEpisodeField(
                              selectedSeasonNumber,
                              selectedEpisodeNumber,
                              'title',
                              e.target.value,
                            )
                          }
                          className="bg-background border-border"
                          placeholder="Episode name"
                        />
                      </Field>
                    </FieldGroup>

                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Episode Download Links</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addEpisodeDownloadLink(selectedSeasonNumber, selectedEpisodeNumber)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Link
                      </Button>
                    </div>

                    {selectedEpisode.downloadLinks.map((link, idx) => (
                      <div key={idx} className="space-y-2 rounded-lg border border-border bg-card p-3">
                        <Input
                          value={link.title}
                          onChange={(e) =>
                            updateEpisodeDownloadLink(
                              selectedSeasonNumber,
                              selectedEpisodeNumber,
                              idx,
                              'title',
                              e.target.value,
                            )
                          }
                          className="bg-background border-border"
                          placeholder="Link title"
                        />
                        <div className="grid gap-2 md:grid-cols-2">
                          <Input
                            value={link.size}
                            onChange={(e) =>
                              updateEpisodeDownloadLink(
                                selectedSeasonNumber,
                                selectedEpisodeNumber,
                                idx,
                                'size',
                                e.target.value,
                              )
                            }
                            className="bg-background border-border"
                            placeholder="File size"
                          />
                          <Input
                            type="url"
                            value={link.url}
                            onChange={(e) =>
                              updateEpisodeDownloadLink(
                                selectedSeasonNumber,
                                selectedEpisodeNumber,
                                idx,
                                'url',
                                e.target.value,
                              )
                            }
                            className="bg-background border-border"
                            placeholder="Download URL"
                          />
                        </div>
                        {selectedEpisode.downloadLinks.length > 1 && (
                          <Button
                            type="button"
                            onClick={() =>
                              removeEpisodeDownloadLink(selectedSeasonNumber, selectedEpisodeNumber, idx)
                            }
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Link
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Screenshots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xl font-semibold text-foreground">Screenshots</h2>
                <Button
                  type="button"
                  onClick={() => addArrayItem('screenshots', '')}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Screenshot
                </Button>
              </div>

              {formData.screenshots.map((screenshot, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    type="url"
                    value={screenshot}
                    onChange={(e) => handleArrayChange('screenshots', idx, '', e.target.value)}
                    className="bg-background border-border"
                    placeholder="Screenshot URL"
                  />
                  {formData.screenshots.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeArrayItem('screenshots', idx)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-2 border-t border-border pt-6">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? 'Creating...' : `Create ${isSeries ? 'Series' : 'Movie'}`}
              </Button>
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AddMoviePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddMovieContent />
    </Suspense>
  );
}
