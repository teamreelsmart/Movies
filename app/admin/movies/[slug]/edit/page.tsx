'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { useToast } from '@/hooks/use-toast';

interface DownloadLink {
  title: string;
  size: string;
  url: string;
}

interface MovieFormData {
  title: string;
  storyline: string;
  imdbRating: number;
  releaseDate: string;
  genres: string[];
  language: string;
  runtime: string;
  qualityType: string;
  availableQualities: string[];
  type: 'movie' | 'series';
  posterUrl: string;
  screenshots: string[];
  downloadLinks: DownloadLink[];
  isTrending?: boolean;
}

export default function EditMoviePage() {
  const params = useParams<{ slug?: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MovieFormData | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movies/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Movie not found');

        const data = await res.json();

        setFormData({
          title: data.title || '',
          storyline: data.storyline || '',
          imdbRating: Number(data.imdbRating || 0),
          releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : '',
          genres: data.genres || [''],
          language: data.language || '',
          runtime: data.runtime || '',
          qualityType: data.qualityType || '',
          availableQualities: data.availableQualities || [],
          type: data.type || 'movie',
          posterUrl: data.posterUrl || '',
          screenshots: data.screenshots || [''],
          downloadLinks: data.downloadLinks?.length
            ? [{
                title: data.downloadLinks[0]?.title || '',
                size: data.downloadLinks[0]?.size || '',
                url: data.downloadLinks[0]?.url || '',
              }]
            : [{ title: '', size: '', url: '' }],
          isTrending: Boolean(data.isTrending),
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Content not found',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [slug, toast]);

  const handleChange = (field: keyof MovieFormData, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !slug) return;

    setSaving(true);

    try {
      const payload = {
        ...formData,
        genres: formData.genres.filter(Boolean),
        screenshots: formData.screenshots.filter(Boolean),
        downloadLinks: formData.downloadLinks.filter((l) => l.url),
      };

      const res = await fetch(`/api/movies/${encodeURIComponent(slug)}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update content');
      }

      toast({
        title: 'Updated',
        description: `${formData.type === 'series' ? 'Series' : 'Movie'} updated successfully`,
      });

      router.push('/admin/movies');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Edit Content</h1>

          {loading ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-foreground/70">
              Loading...
            </div>
          ) : !formData ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-foreground/70">
              Content not found.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="storyline">Storyline</FieldLabel>
                  <textarea
                    id="storyline"
                    value={formData.storyline}
                    onChange={(e) => handleChange('storyline', e.target.value)}
                    rows={5}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    required
                  />
                </Field>
              </FieldGroup>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="imdbRating">IMDb Rating</FieldLabel>
                    <Input id="imdbRating" type="number" min="0" max="10" step="0.1" value={formData.imdbRating} onChange={(e) => handleChange('imdbRating', parseFloat(e.target.value || '0'))} />
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="releaseDate">Release Date</FieldLabel>
                    <Input id="releaseDate" type="date" value={formData.releaseDate} onChange={(e) => handleChange('releaseDate', e.target.value)} required />
                  </Field>
                </FieldGroup>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="language">Language</FieldLabel>
                    <Input id="language" value={formData.language} onChange={(e) => handleChange('language', e.target.value)} required />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="runtime">Runtime</FieldLabel>
                    <Input id="runtime" value={formData.runtime} onChange={(e) => handleChange('runtime', e.target.value)} />
                  </Field>
                </FieldGroup>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="qualityType">Quality Type</FieldLabel>
                  <Input id="qualityType" value={formData.qualityType} onChange={(e) => handleChange('qualityType', e.target.value)} required />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="posterUrl">Poster URL</FieldLabel>
                  <Input id="posterUrl" type="url" value={formData.posterUrl} onChange={(e) => handleChange('posterUrl', e.target.value)} required />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="genres">Genres (comma separated)</FieldLabel>
                  <Input id="genres" value={formData.genres.join(', ')} onChange={(e) => handleChange('genres', e.target.value.split(',').map((g) => g.trim()))} />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="downloadTitle">Download Button Text</FieldLabel>
                  <Input
                    id="downloadTitle"
                    value={formData.downloadLinks[0]?.title || ''}
                    onChange={(e) =>
                      handleChange('downloadLinks', [{
                        title: e.target.value,
                        size: formData.downloadLinks[0]?.size || '',
                        url: formData.downloadLinks[0]?.url || '',
                      }])
                    }
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="downloadUrl">Download URL</FieldLabel>
                  <Input
                    id="downloadUrl"
                    type="url"
                    value={formData.downloadLinks[0]?.url || ''}
                    onChange={(e) =>
                      handleChange('downloadLinks', [{
                        title: formData.downloadLinks[0]?.title || '',
                        size: formData.downloadLinks[0]?.size || '',
                        url: e.target.value,
                      }])
                    }
                    required
                  />
                </Field>
              </FieldGroup>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/movies')}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
