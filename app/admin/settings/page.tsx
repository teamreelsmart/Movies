'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface FooterLink {
  name: string;
  url: string;
  icon: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.footerLinks) {
          setFooterLinks(data.footerLinks);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...footerLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterLinks(newLinks);
  };

  const addLink = () => {
    setFooterLinks([...footerLinks, { name: '', url: '', icon: 'send' }]);
  };

  const removeLink = (index: number) => {
    setFooterLinks(footerLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footerLinks }),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>

          <div className="space-y-8">
            {/* Footer Links */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Footer Links</h2>
                  <p className="mt-1 text-sm text-foreground/60">
                    Manage social media and external links in the footer
                  </p>
                </div>
                <Button onClick={addLink} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-4">
                {footerLinks.map((link, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor={`name-${idx}`}>Link Name</FieldLabel>
                          <Input
                            id={`name-${idx}`}
                            value={link.name}
                            onChange={(e) => handleLinkChange(idx, 'name', e.target.value)}
                            placeholder="e.g., Telegram"
                            className="bg-background border-border"
                          />
                        </Field>
                      </FieldGroup>

                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor={`url-${idx}`}>URL</FieldLabel>
                          <Input
                            id={`url-${idx}`}
                            type="url"
                            value={link.url}
                            onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                            placeholder="https://t.me/orvixmovies"
                            className="bg-background border-border"
                          />
                        </Field>
                      </FieldGroup>

                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor={`icon-${idx}`}>Icon</FieldLabel>
                          <select
                            id={`icon-${idx}`}
                            value={link.icon}
                            onChange={(e) => handleLinkChange(idx, 'icon', e.target.value)}
                            className="w-full rounded-md bg-background border border-border px-3 py-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="send">Telegram (send)</option>
                            <option value="github">GitHub</option>
                            <option value="mail">Email</option>
                          </select>
                        </Field>
                      </FieldGroup>
                    </div>

                    {footerLinks.length > 1 && (
                      <Button
                        onClick={() => removeLink(idx)}
                        size="sm"
                        variant="ghost"
                        className="mt-3 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Settings Sections */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Other Settings</h2>
              <div className="rounded-lg border border-border bg-background/50 p-4">
                <p className="text-sm text-foreground/60">
                  Additional settings will be added soon:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-foreground/60">
                  <li>• Site title and description</li>
                  <li>• SEO configuration</li>
                  <li>• Notification settings</li>
                  <li>• API key management</li>
                </ul>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
