'use client';

interface DownloadLink {
  title: string;
  size: string;
  url: string;
}

interface DownloadSectionProps {
  links: DownloadLink[];
}

export function DownloadSection({ links }: DownloadSectionProps) {
  const link = links?.find((item) => item?.url)?.url
    ? links.find((item) => item?.url)
    : null;

  if (!link) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-foreground/60">No download link available</p>
      </div>
    );
  }

  return (
    <div className="download-wrap">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="download-button"
      >
        {link.title || 'Download Now'}
      </a>
      {link.size && <p className="mt-4 text-sm text-foreground/70 text-center">{link.size}</p>}
    </div>
  );
}
