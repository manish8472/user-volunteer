'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Profile Card */}
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Profile</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground mt-2">Email</p>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-2">Role</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user?.role || 'User'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  Edit Profile
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  View Notifications
                </button>
              </div>
            </div>

            {/* Stats or Info */}
            <div className="p-6 bg-card rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                <span className="font-medium">Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Last login: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
