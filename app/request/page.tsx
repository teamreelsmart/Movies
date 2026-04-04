'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel, FieldHint } from '@/components/ui/field';
import { useToast } from '@/hooks/use-toast';

export default function RequestPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    screenshotUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit request');
      }

      toast({
        title: 'Request submitted!',
        description: 'Thank you! We will check your request soon.',
      });

      setFormData({
        title: '',
        year: new Date().getFullYear(),
        screenshotUrl: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Request a Movie or Series</h1>
              <p className="mt-2 text-foreground/60">
                Can&apos;t find what you&apos;re looking for? Request it here and we&apos;ll add it soon.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title *</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Movie or series title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="bg-background border-border"
                  />
                  <FieldHint>The name of the movie or series you want</FieldHint>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="year">Release Year *</FieldLabel>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="bg-background border-border"
                  />
                  <FieldHint>The year it was released or will be released</FieldHint>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="screenshotUrl">Screenshot URL (Optional)</FieldLabel>
                  <Input
                    id="screenshotUrl"
                    name="screenshotUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.screenshotUrl}
                    onChange={handleChange}
                    className="bg-background border-border"
                  />
                  <FieldHint>A screenshot or poster image URL for reference</FieldHint>
                </Field>
              </FieldGroup>

              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>

            <div className="mt-8 rounded-lg border border-border bg-card/50 px-6 py-4">
              <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Your request will be reviewed by our team</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>We&apos;ll add it to our collection if available</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Follow our Telegram for updates on new additions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
