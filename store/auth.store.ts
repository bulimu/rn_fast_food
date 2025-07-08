import { create } from 'zustand';
import { User } from '@/types'
import { getCurrentUser } from '@/lib/appwrite';

type AuthStore = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser(); 
      if(user) set({ user: user as User, isAuthenticated: true })
        else set({ user: null, isAuthenticated: false });
      
    } catch (error) {
      console.error('Failed to fetch authenticated user:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  } 
}));
export default useAuthStore;
