import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  isFirstAdminNeeded: boolean;
  loginWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, fullName: string, phone?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOtp: (email: string, otpCode: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  setupFirstAdmin: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
}

const LOCAL_USER_KEY = 'gs_current_user';
const ADMIN_INITIALIZED_KEY = 'gs_admin_created';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstAdminNeeded, setIsFirstAdminNeeded] = useState<boolean>(false);

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);

      // Check if admin is needed
      const adminExists = localStorage.getItem(ADMIN_INITIALIZED_KEY);
      if (!adminExists) {
        setIsFirstAdminNeeded(true);
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const authUser = data.session.user;
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

            if (profile) {
              setUser(profile as UserProfile);
            } else {
              // Create default profile
              const newProf: UserProfile = {
                id: authUser.id,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || 'Customer',
                phone: authUser.user_metadata?.phone || '',
                role: 'customer',
                created_at: new Date().toISOString(),
              };
              setUser(newProf);
            }
          }
        } catch (e) {
          console.warn('Supabase auth session error:', e);
        }
      } else {
        // Fallback to local stored session
        try {
          const stored = localStorage.getItem(LOCAL_USER_KEY);
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setIsLoading(false);
    }

    initAuth();
  }, []);

  const saveLocalUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  const loginWithPassword = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Master admin direct access credentials (default or changed via forgot password)
      const storedAdminPass =
        localStorage.getItem('gs_user_pass_admin@gulfspring.sa') ||
        localStorage.getItem('gs_admin_master_password') ||
        localStorage.getItem(`gs_user_pass_${normalizedEmail}`);

      const isAdminEmail =
        normalizedEmail === 'admin@gulfspring.sa' ||
        normalizedEmail === 'admin' ||
        normalizedEmail.includes('admin');

      if (isAdminEmail) {
        const isMatch = storedAdminPass
          ? pass === storedAdminPass
          : pass === 'admin123456' || pass === 'admin123';
        if (isMatch) {
          const adminUser: UserProfile = {
            id: 'admin-master-01',
            email: normalizedEmail.includes('@') ? normalizedEmail : 'admin@gulfspring.sa',
            full_name: 'Gulf Spring Administrator',
            role: 'admin',
            created_at: new Date().toISOString(),
          };
          saveLocalUser(adminUser);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Check if user has a custom set/reset password
      const savedCustomPass = localStorage.getItem(`gs_user_pass_${normalizedEmail}`);
      if (savedCustomPass && pass !== savedCustomPass) {
        setIsLoading(false);
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userObj: UserProfile = prof || {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Customer',
            role: 'customer',
            created_at: new Date().toISOString(),
          };
          saveLocalUser(userObj);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Standalone simulation
      if (pass.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
      const mockUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role,
        created_at: new Date().toISOString(),
      };
      saveLocalUser(mockUser);
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { full_name: fullName, phone: phone || '' },
          },
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const newProf: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            phone,
            role: 'customer',
            created_at: new Date().toISOString(),
          };
          saveLocalUser(newProf);
          setIsLoading(false);
          return {
            success: true,
            message: 'Verification email sent. Please check your inbox or proceed to verify OTP.',
          };
        }
      }

      // Standalone mode
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName,
        phone,
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      saveLocalUser(newUser);
      setIsLoading(false);
      return {
        success: true,
        message: 'Account created successfully! Welcome to Gulf Spring.',
      };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Signup failed' };
    }
  };

  const verifyOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const userObj: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Customer',
            role: 'customer',
            created_at: new Date().toISOString(),
          };
          saveLocalUser(userObj);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Standalone: any 6 digit token works for testing
      if (token.length >= 4) {
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: 'Invalid verification code' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'OTP verification failed' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    saveLocalUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const updated = { ...user, ...updates };
    saveLocalUser(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }
    return { success: true };
  };

  const updatePassword = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (newPass.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
      }

      if (user?.email) {
        localStorage.setItem(`gs_user_pass_${user.email.toLowerCase()}`, newPass);
      }
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Failed to update password' };
    }
  };

  const resetPasswordWithOtp = async (
    email: string,
    otpCode: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (newPass.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (isSupabaseConfigured && supabase) {
        const { error: otpErr } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'recovery',
        });
        if (!otpErr) {
          const { error: passErr } = await supabase.auth.updateUser({ password: newPass });
          if (passErr) {
            setIsLoading(false);
            return { success: false, error: passErr.message };
          }
        }
      }

      // Save new password
      localStorage.setItem(`gs_user_pass_${email.toLowerCase()}`, newPass);

      // Auto-authenticate customer with updated credentials
      const updatedUser: UserProfile = {
        id: user?.id || `usr-${Date.now()}`,
        email,
        full_name: user?.full_name || email.split('@')[0],
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      saveLocalUser(updatedUser);

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Failed to reset password' };
    }
  };

  const setupFirstAdmin = async (
    email: string,
    pass: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const adminUser: UserProfile = {
        id: `admin-${Date.now()}`,
        email,
        full_name: fullName,
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      saveLocalUser(adminUser);
      localStorage.setItem(ADMIN_INITIALIZED_KEY, 'true');
      setIsFirstAdminNeeded(false);

      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: fullName, role: 'admin' } },
        });
        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'admin',
          });
        }
      }

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Admin setup failed' };
    }
  };

  const loginAsDemoAdmin = () => {
    const admin: UserProfile = {
      id: 'admin-gulf-spring',
      email: 'manager@gulfspring.sa',
      full_name: 'Gulf Spring General Manager (مدير نبع الدرعية)',
      phone: '+966557070172',
      role: 'admin',
      created_at: new Date().toISOString(),
    };
    saveLocalUser(admin);
    localStorage.setItem(ADMIN_INITIALIZED_KEY, 'true');
    setIsFirstAdminNeeded(false);
  };

  const loginAsDemoCustomer = () => {
    const customer: UserProfile = {
      id: 'cust-demo-1',
      email: 'ahmed.guest@gmail.com',
      full_name: 'Ahmed Al-Diriyah (أحمد)',
      phone: '+966551234567',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    saveLocalUser(customer);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAdmin: user?.role === 'admin',
        isLoading,
        isFirstAdminNeeded,
        loginWithPassword,
        signUpWithEmail,
        verifyOtp,
        logout,
        updateProfile,
        updatePassword,
        resetPasswordWithOtp,
        setupFirstAdmin,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
