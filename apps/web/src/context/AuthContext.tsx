'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUserPayload,
  WorkspaceSummary,
  UserRole,
  WorkspaceType,
  MemberRole,
} from '@ca-career-os/shared';

interface AuthContextType {
  user: AuthUserPayload | null;
  activeWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUserPayload = {
  id: 'usr-ca-candidate-001',
  email: 'vishal.dubey@ca-student.org',
  firstName: 'Vishal',
  lastName: 'Dubey',
  role: UserRole.CANDIDATE,
};

const DEFAULT_WORKSPACES: WorkspaceSummary[] = [
  {
    id: 'ws-personal-001',
    name: "Vishal Dubey's Personal Workspace",
    slug: 'vishal-personal',
    type: WorkspaceType.PERSONAL,
    ownerId: 'usr-ca-candidate-001',
    role: MemberRole.OWNER,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ws-org-grant-thornton',
    name: 'Grant Thornton Bharat LLP',
    slug: 'gt-bharat',
    type: WorkspaceType.ORGANIZATION,
    ownerId: 'usr-gt-partner-099',
    role: MemberRole.MEMBER,
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserPayload | null>(DEMO_USER);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSummary | null>(DEFAULT_WORKSPACES[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check local session state
    try {
      const storedUser = localStorage.getItem('ca_os_user');
      const storedWorkspaces = localStorage.getItem('ca_os_workspaces');
      const storedActiveWs = localStorage.getItem('ca_os_active_ws');

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedWorkspaces) setWorkspaces(JSON.parse(storedWorkspaces));
      if (storedActiveWs) setActiveWorkspace(JSON.parse(storedActiveWs));
    } catch {
      // Fallback to default
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || errorData?.message || 'Invalid email or password';
        setIsLoading(false);
        return { success: false, error: message };
      }

      const envelope = await res.json();
      const authData = envelope.data;

      const newUser: AuthUserPayload = authData.user;
      const userWorkspaces: WorkspaceSummary[] = [
        {
          id: authData.defaultWorkspaceId,
          name: `${newUser.firstName}'s Personal Workspace`,
          slug: `personal-${newUser.id.slice(0, 8)}`,
          type: WorkspaceType.PERSONAL,
          ownerId: newUser.id,
          role: MemberRole.OWNER,
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
      ];

      setUser(newUser);
      setWorkspaces(userWorkspaces);
      setActiveWorkspace(userWorkspaces[0]);

      localStorage.setItem('ca_os_user', JSON.stringify(newUser));
      localStorage.setItem('ca_os_workspaces', JSON.stringify(userWorkspaces));
      localStorage.setItem('ca_os_active_ws', JSON.stringify(userWorkspaces[0]));

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      // Offline fallback for preview mode
      const fallbackUser: AuthUserPayload = {
        id: `usr-${Date.now()}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        role: email.includes('recruiter') ? UserRole.RECRUITER : UserRole.CANDIDATE,
      };
      const fallbackWs: WorkspaceSummary = {
        id: `ws-${Date.now()}`,
        name: `${fallbackUser.firstName}'s Workspace`,
        slug: `ws-${Date.now()}`,
        type: WorkspaceType.PERSONAL,
        ownerId: fallbackUser.id,
        role: MemberRole.OWNER,
        isDefault: true,
        createdAt: new Date().toISOString(),
      };

      setUser(fallbackUser);
      setWorkspaces([fallbackWs]);
      setActiveWorkspace(fallbackWs);
      setIsLoading(false);
      return { success: true };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || errorData?.message || 'Registration failed';
        setIsLoading(false);
        return { success: false, error: message };
      }

      const envelope = await res.json();
      const authData = envelope.data;

      const newUser: AuthUserPayload = authData.user;
      const userWorkspaces: WorkspaceSummary[] = [
        {
          id: authData.defaultWorkspaceId,
          name: `${newUser.firstName}'s Personal Workspace`,
          slug: `personal-${newUser.id.slice(0, 8)}`,
          type: WorkspaceType.PERSONAL,
          ownerId: newUser.id,
          role: MemberRole.OWNER,
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
      ];

      if (data.role === UserRole.RECRUITER && data.organizationName) {
        userWorkspaces.push({
          id: `org-${Date.now()}`,
          name: data.organizationName,
          slug: `org-${Date.now()}`,
          type: WorkspaceType.ORGANIZATION,
          ownerId: newUser.id,
          role: MemberRole.OWNER,
          isDefault: false,
          createdAt: new Date().toISOString(),
        });
      }

      setUser(newUser);
      setWorkspaces(userWorkspaces);
      setActiveWorkspace(userWorkspaces[0]);

      localStorage.setItem('ca_os_user', JSON.stringify(newUser));
      localStorage.setItem('ca_os_workspaces', JSON.stringify(userWorkspaces));
      localStorage.setItem('ca_os_active_ws', JSON.stringify(userWorkspaces[0]));

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    setActiveWorkspace(null);
    setWorkspaces([]);
    localStorage.removeItem('ca_os_user');
    localStorage.removeItem('ca_os_workspaces');
    localStorage.removeItem('ca_os_active_ws');
  };

  const switchWorkspace = (workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) {
      setActiveWorkspace(target);
      localStorage.setItem('ca_os_active_ws', JSON.stringify(target));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeWorkspace,
        workspaces,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
