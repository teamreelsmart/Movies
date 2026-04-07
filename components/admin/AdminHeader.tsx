'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AdminHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="liquid-glass border-b border-border bg-card/70 backdrop-blur-xl">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Image src="/icon.svg" alt="Movies Entertainment logo" width={34} height={34} />
          <span>Movies Entertainment Admin</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/admin" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/admin/movies" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Content
          </Link>
          <Link href="/admin/requests" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Requests
          </Link>
          <Link href="/admin/settings" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
