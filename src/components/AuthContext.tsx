import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../assets/exampleData';
import { exampleUsers } from '../assets/exampleData';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => Promise<string | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUsersFromStorage(): User[] {
  const raw = localStorage.getItem('users');
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      return arr.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) }));
    } catch {
      return [];
    }
  }
  // If not present, seed with example users
  localStorage.setItem('users', JSON.stringify(exampleUsers));
  return exampleUsers;
}

function saveUsersToStorage(users: User[]) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getUserFromStorage(): User | null {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    return { ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) };
  } catch {
    return null;
  }
}

function saveUserToStorage(user: User | null) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getUserFromStorage());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveUserToStorage(user);
  }, [user]);

  const login = async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    const users = getUsersFromStorage();
    const found = users.find(u => u.email === email && u.password === password);
    setLoading(false);
    if (found) {
      setUser(found);
      return null;
    }
    return 'Invalid email or password';
  };

  const register = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<string | null> => {
    setLoading(true);
    let users = getUsersFromStorage();
    if (users.some(u => u.email === data.email)) {
      setLoading(false);
      return 'Email already registered';
    }
    const newUser: User = {
      ...data,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users = [...users, newUser];
    saveUsersToStorage(users);
    setUser(newUser);
    setLoading(false);
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
} 