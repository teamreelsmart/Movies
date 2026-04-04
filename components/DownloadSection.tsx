'use client';

import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DownloadLink {
  title: string;
  size: string;
  url: string;
}

interface DownloadSectionProps {
  links: DownloadLink[];
}

export function DownloadSection({ links }: DownloadSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!links || links.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-foreground/60">No download links available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
        >
          <div className="flex-1">
            <p className="font-medium text-foreground">{link.title}</p>
            <p className="text-sm text-foreground/60">{link.size}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(link.url, index)}
            >
              {copiedIndex === index ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              asChild
              variant="default"
              size="sm"
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
