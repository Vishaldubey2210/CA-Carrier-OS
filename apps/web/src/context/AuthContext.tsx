'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUserPayload,
  WorkspaceSummary,
  UserRole,
  WorkspaceType,
  MemberRole,
} from '@ca-career-os/shared';

export interface LoginResult {
  success: boolean;
  requiresOtp?: boolean;
  challengeId?: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
  error?: string;
}

interface AuthContextType {
  user: AuthUserPayload | null;
  activeWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<LoginResult>;
  demoLogin: (role?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (challengeId: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (challengeId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string }>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserPayload | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local session state
    try {
      const storedUser = localStorage.getItem('ca_os_user');
      const storedWorkspaces = localStorage.getItem('ca_os_workspaces');
      const storedActiveWs = localStorage.getItem('ca_os_active_ws');

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Purge old mock / fake demo user session
        if (parsed.id === 'usr-ca-candidate-001' || parsed.email === 'vishal.dubey@ca-student.org') {
          localStorage.removeItem('ca_os_user');
          localStorage.removeItem('ca_os_workspaces');
          localStorage.removeItem('ca_os_active_ws');
        } else {
          setUser(parsed);
          if (storedWorkspaces) setWorkspaces(JSON.parse(storedWorkspaces));
          if (storedActiveWs) setActiveWorkspace(JSON.parse(storedActiveWs));

          if (!localStorage.getItem('ca_os_token')) {
            fetch('/api/v1/auth/demo-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: parsed.role || 'CANDIDATE' }),
            })
              .then((res) => res.json())
              .then((env) => {
                if (env.data?.accessToken) {
                  localStorage.setItem('ca_os_token', env.data.accessToken);
                }
              })
              .catch(() => {});
          }
        }
      }
    } catch {
      // Fallback to unauthenticated state
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Step 1 of Authentication: Validate credentials and receive OTP challenge
   */
  const login = async (email: string, pass: string): Promise<LoginResult> => {
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

      setIsLoading(false);

      if (authData?.requiresOtp) {
        // Step 1 complete! Pending OTP challenge issued. No session established yet.
        return {
          success: true,
          requiresOtp: true,
          challengeId: authData.challengeId,
          maskedEmail: authData.maskedEmail,
          expiresInSeconds: authData.expiresInSeconds,
          resendCooldownSeconds: authData.resendCooldownSeconds,
        };
      }

      // If backend direct-authenticated
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

      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: 'Network error connecting to authentication server. Please check your connection.' };
    }
  };

  /**
   * 1-Click Demo Login (Candidate, Recruiter, Admin)
   */
  const demoLogin = async (role: string = 'CANDIDATE'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || errorData?.message || 'Demo login failed';
        setIsLoading(false);
        return { success: false, error: message };
      }

      const envelope = await res.json();
      const authData = envelope.data;
      const newUser: AuthUserPayload = authData.user;
      const userWorkspaces: WorkspaceSummary[] = [
        {
          id: authData.defaultWorkspaceId,
          name: `${newUser.firstName}'s Workspace`,
          slug: `ws-${newUser.id.slice(0, 8)}`,
          type: newUser.role === UserRole.CANDIDATE ? WorkspaceType.PERSONAL : WorkspaceType.ORGANIZATION,
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
      if (authData?.accessToken) {
        localStorage.setItem('ca_os_token', authData.accessToken);
      }

      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Connection error during demo login.' };
    }
  };

  /**
   * Step 2 of Authentication: Verify OTP and establish authenticated session
   */
  const verifyOtp = async (challengeId: string, code: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || errorData?.message || 'Verification failed. Please check the code.';
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
      if (authData?.accessToken) {
        localStorage.setItem('ca_os_token', authData.accessToken);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: 'Connection error while verifying security code.' };
    }
  };

  /**
   * Resend login OTP
   */
  const resendOtp = async (challengeId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || errorData?.message || 'Failed to resend code.';
        return { success: false, error: message };
      }

      const envelope = await res.json();
      return { success: true, message: envelope?.data?.message || 'Verification code resent.' };
    } catch {
      return { success: false, error: 'Network error requesting fresh verification code.' };
    }
  };

  /**
   * Verify email on registration
   */
  const verifyEmail = async (token: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || errorData?.message || 'Invalid or expired email verification link.';
        return { success: false, error: message };
      }

      const envelope = await res.json();
      return { success: true, message: envelope?.data?.message || 'Email verified successfully.' };
    } catch {
      return { success: false, error: 'Network error verifying email address.' };
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

      setUser(newUser);
      setWorkspaces(userWorkspaces);
      setActiveWorkspace(userWorkspaces[0]);

      localStorage.setItem('ca_os_user', JSON.stringify(newUser));
      localStorage.setItem('ca_os_workspaces', JSON.stringify(userWorkspaces));
      localStorage.setItem('ca_os_active_ws', JSON.stringify(userWorkspaces[0]));
      if (authData?.accessToken) {
        localStorage.setItem('ca_os_token', authData.accessToken);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: 'Network error connecting to registration server.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      localStorage.removeItem('ca_os_user');
      localStorage.removeItem('ca_os_workspaces');
      localStorage.removeItem('ca_os_active_ws');
      localStorage.removeItem('ca_os_token');
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
      localStorage.setItem('ca_os_active_ws', JSON.stringify(ws));
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
        demoLogin,
        verifyOtp,
        resendOtp,
        verifyEmail,
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
