'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScreenshotsGalleryProps {
  screenshots: string[];
  title: string;
}

export function ScreenshotsGallery({ screenshots, title }: ScreenshotsGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const currentImage = selectedIndex !== null ? screenshots[selectedIndex] : null;

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? screenshots.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === screenshots.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Screenshots</h3>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {screenshots.map((screenshot, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative h-24 overflow-hidden rounded-lg border-2 transition-all ${
              selectedIndex === index
                ? 'border-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Image
              src={screenshot}
              alt={`${title} screenshot ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute right-4 top-4 text-white hover:text-gray-300"
          >
            <X className="h-8 w-8" />
          </button>

          <div className="relative flex h-[70vh] w-full max-w-4xl items-center justify-center">
            <Image
              src={currentImage}
              alt={`${title} screenshot ${selectedIndex! + 1}`}
              fill
              className="object-contain"
            />

            {screenshots.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 hover:bg-black/75"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 hover:bg-black/75"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              {selectedIndex! + 1} / {screenshots.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
