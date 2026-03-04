export interface User {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'MODERATOR' | 'ADMIN';
    avatar?: string;
    bio?: string;
    createdAt: string;
}
interface AuthStore {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthStore>>;
export {};
//# sourceMappingURL=auth.d.ts.map