'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      toast({
        title: 'Login successful!',
        description: 'Welcome to OrvixMovies Admin Panel',
      });

      router.push('/admin');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-card p-8">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">OrvixMovies</h1>
            <p className="mt-2 text-sm text-foreground/60">Admin Panel Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="bg-background border-border"
                />
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-background/50 p-4 text-center text-xs text-foreground/60">
            <p>Demo Credentials:</p>
            <p className="mt-1">Username: <code className="text-primary">admin</code></p>
            <p>Password: <code className="text-primary">admin123</code></p>
            <p className="mt-2 text-xs">Change these in your environment variables in production</p>
          </div>
        </div>
      </div>
    </div>
  );
}
