import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moderationService } from '../services/moderation';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  user: {
    id: string;
    username: string;
  };
  video: {
    id: string;
    title: string;
    thumbnail_url: string;
    user_id: string;
  };
}

interface Stats {
  pendingReports: number;
  totalVideos: number;
  totalUsers: number;
  totalComments: number;
}

export function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportsResult, statsResult] = await Promise.all([
        moderationService.getReports(50, 0, statusFilter),
        moderationService.getStats(),
      ]);
      setReports(reportsResult.reports);
      setStats(statsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    setUpdating(reportId);
    setError(null);

    try {
      const updated = await moderationService.updateReport(reportId, status);
      setReports(reports.map((r) => (r.id === reportId ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Moderation Dashboard</h1>
            <p className="text-muted-foreground">
              Manage reported content and monitor community health
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.pendingReports}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalVideos}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalComments}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex space-x-2">
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'reviewed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('reviewed')}
              size="sm"
            >
              Reviewed
            </Button>
            <Button
              variant={statusFilter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('resolved')}
              size="sm"
            >
              Resolved
            </Button>
            <Button
              variant={statusFilter === 'dismissed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('dismissed')}
              size="sm"
            >
              Dismissed
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              All
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No {statusFilter !== 'all' ? statusFilter : ''} reports
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === 'pending' ? 'All caught up!' : 'No reports found with this status'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">Video Report</CardTitle>
                        <CardDescription>
                          Reported by {report.user.username} •{' '}
                          {new Date(report.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                            : report.status === 'resolved'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : report.status === 'dismissed'
                            ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="md:flex space-y-4 md:space-y-0 md:space-x-4">
                      <div className="md:w-1/3">
                        <img
                          src={report.video.thumbnail_url || 'https://via.placeholder.com/320x180'}
                          alt={report.video.title}
                          className="w-full rounded"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <h4 className="font-semibold text-foreground mb-2">{report.video.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          <strong>Reason:</strong> {report.reason}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Link to={`/video/${report.video.id}`}>
                            <Button size="sm" variant="outline">
                              View Video
                            </Button>
                          </Link>

                          {report.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                                disabled={updating === report.id}
                              >
                                {updating === report.id ? 'Updating...' : 'Mark Reviewed'}
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                disabled={updating === report.id}
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                disabled={updating === report.id}
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

