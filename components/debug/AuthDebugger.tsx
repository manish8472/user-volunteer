'use client';

import { useAuthStore } from '@/stores/authStore';

export default function AuthDebugger() {
  const { user, isAuthenticated, clearAuth, setAuth } = useAuthStore();

  const loginAsVolunteer = () => {
    setAuth('debug-token-volunteer', {
      id: '1',
      name: 'John Volunteer',
      email: 'john@example.com',
      role: 'volunteer',
    });
  };

  const loginAsNGO = () => {
    setAuth('debug-token-ngo', {
      id: '2',
      name: 'NGO Admin',
      email: 'admin@ngo.org',
      role: 'ngo',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-4 max-w-xs z-50">
      <h3 className="font-bold text-sm mb-3 text-gray-900">
        🔧 Auth Debugger
      </h3>
      
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="text-xs text-gray-600">
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p>{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-dark text-xs font-medium">
              {user?.role}
            </span>
          </div>
          <button
            onClick={clearAuth}
            className="w-full px-3 py-2 text-xs rounded-lg bg-danger hover:bg-danger-light text-white font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={loginAsVolunteer}
            className="w-full px-3 py-2 text-xs rounded-lg bg-primary hover:bg-primary-light text-white font-medium transition-colors"
          >
            Login as Volunteer
          </button>
          <button
            onClick={loginAsNGO}
            className="w-full px-3 py-2 text-xs rounded-lg bg-secondary hover:bg-secondary-light text-white font-medium transition-colors"
          >
            Login as NGO
          </button>
        </div>
      )}
      
      <p className="mt-3 text-xs text-gray-500">
        Use this to test different user roles
      </p>
    </div>
  );
}
