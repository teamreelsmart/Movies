'use client';

import { useEffect, useRef, useState } from 'react';

interface DownloadLink {
  title: string;
  size: string;
  url: string;
}

interface DownloadSectionProps {
  links: DownloadLink[];
}

export function DownloadSection({ links }: DownloadSectionProps) {
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  const link = links?.find((item) => item?.url)?.url
    ? links.find((item) => item?.url)
    : null;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleDownloadClick = () => {
    if (!link?.url || isPreparingDownload) return;

    setIsPreparingDownload(true);
    redirectTimeoutRef.current = window.setTimeout(() => {
      window.location.href = link.url;
    }, 5000);
  };

  if (!link) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-foreground/60">No download link available</p>
      </div>
    );
  }

  return (
    <>
      <div className="download-wrap">
        <button
          type="button"
          className="download-button"
          onClick={handleDownloadClick}
          disabled={isPreparingDownload}
        >
          {link.title || 'Download Now'}
        </button>
        {link.size && <p className="mt-4 text-sm text-foreground/70 text-center">{link.size}</p>}
      </div>

      {isPreparingDownload && (
        <div className="download-loader-overlay">
          <div className="download-loader-shell">
            <div className="download-loader-dashes" aria-hidden="true">
              <div className="download-dash uno"></div>
              <div className="download-dash dos"></div>
              <div className="download-dash tres"></div>
              <div className="download-dash cuatro"></div>
            </div>
            <p className="download-loader-text">Getting Your Requested Files</p>
          </div>
        </div>
      )}
    </>
  );
}
