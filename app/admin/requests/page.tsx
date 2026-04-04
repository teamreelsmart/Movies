'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Request {
  _id: string;
  title: string;
  year: number;
  screenshotUrl?: string;
  createdAt: string;
}

export default function RequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '10');

        const res = await fetch(`/api/requests?${params}`);
        const data = await res.json();
        setRequests(data.requests || []);
        setTotal(data.pagination?.total || 0);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">User Requests</h1>
            <p className="mt-2 text-foreground/60">Manage movie and series requests from users</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-foreground/60">Loading...</p>
            </div>
          ) : requests.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => (
                  <div key={request._id} className="rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors">
                    <h3 className="font-semibold text-foreground mb-2">{request.title}</h3>
                    <p className="text-sm text-foreground/60 mb-3">Year: {request.year}</p>
                    {request.screenshotUrl && (
                      <div className="mb-3 relative aspect-video overflow-hidden rounded-lg bg-muted">
                        <img
                          src={request.screenshotUrl}
                          alt={request.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs text-foreground/50 mb-3">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      {request.screenshotUrl && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <a href={request.screenshotUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3 w-3 mr-1" />
                            View Image
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-foreground/60">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
              <p className="text-foreground/60">No requests yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-card p-6">
            <h2 className="mb-4 text-2xl font-bold text-foreground">{selectedRequest.title}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground/60 mb-1">Year</p>
                <p className="text-foreground">{selectedRequest.year}</p>
              </div>
              {selectedRequest.screenshotUrl && (
                <div>
                  <p className="text-sm font-medium text-foreground/60 mb-2">Screenshot</p>
                  <img
                    src={selectedRequest.screenshotUrl}
                    alt={selectedRequest.title}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground/60 mb-1">Requested</p>
                <p className="text-foreground">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                onClick={() => setSelectedRequest(null)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
