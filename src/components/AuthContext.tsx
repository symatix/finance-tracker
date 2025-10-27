import React, { createContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileOperations } from '../db';

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
	signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	// Ensure a profile exists for the authenticated user
	const ensureProfileExists = async (authUser: User) => {
		try {
			console.log('Starting ensureProfileExists for user:', authUser.email, 'id:', authUser.id);

			// Check if profile already exists
			console.log('Calling findByUserId...');
			const existingProfile = await ProfileOperations.findByUserId(authUser.id);
			console.log('findByUserId result:', existingProfile);

			if (!existingProfile) {
				console.log('Profile not found, calling upsert...');
				// Create a basic profile with email
				await ProfileOperations.upsert(authUser.id, {
					email: authUser.email,
				});
				console.log('Upsert completed');
			} else {
				console.log('Profile already exists');
			}
		} catch (error) {
			console.error('Error ensuring profile exists:', error);
			// Don't throw - this shouldn't block authentication
			console.warn('⚠️ Profile check failed - continuing without profile creation');
		}
	};

	useEffect(() => {
		// Listen for auth changes (including initial session)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
			console.log('Auth state change - event:', _event, 'session:', session ? 'exists' : 'null');
			setSession(session);
			setUser(session?.user ?? null);

			// Create profile if user is authenticated and doesn't have one
			if (session?.user) {
				await ensureProfileExists(session.user);
			}

			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);
	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { error };
	};

	const signUp = async (email: string, password: string) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
		});
		return { error };
	};

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	const value = {
		user,
		session,
		loading,
		signIn,
		signUp,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
