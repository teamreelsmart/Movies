'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Send, Github, Mail } from 'lucide-react';

interface FooterLink {
  name: string;
  url: string;
  icon: string;
}

export function Footer() {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([
    {
      name: 'Telegram',
      url: 'https://t.me/orvixmovies',
      icon: 'send',
    },
  ]);

  useEffect(() => {
    // Fetch settings from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.footerLinks) {
          setFooterLinks(data.footerLinks);
        }
      })
      .catch(err => console.error('Failed to fetch footer links:', err));
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'send':
        return <Send className="h-5 w-5" />;
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'mail':
        return <Mail className="h-5 w-5" />;
      default:
        return <Send className="h-5 w-5" />;
    }
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-primary mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
              <span>OrvixMovies</span>
            </div>
            <p className="text-sm text-foreground/60">
              Download your favorite movies and web series in HD quality.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/movies" className="text-foreground/60 hover:text-primary transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-foreground/60 hover:text-primary transition-colors">
                  Series
                </Link>
              </li>
              <li>
                <Link href="/request" className="text-foreground/60 hover:text-primary transition-colors">
                  Request
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {footerLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-primary transition-colors p-2 rounded-lg hover:bg-background/50"
                  aria-label={link.name}
                >
                  {getIcon(link.icon)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} OrvixMovies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
