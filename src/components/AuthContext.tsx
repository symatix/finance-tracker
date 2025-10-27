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
			console.log('Ensuring profile exists for user:', authUser.email);

			// Check if profile already exists
			const existingProfile = await ProfileOperations.findByUserId(authUser.id);
			console.log('Existing profile result:', existingProfile);

			if (!existingProfile) {
				console.log('Creating profile for user:', authUser.email);
				// Create a basic profile with email
				await ProfileOperations.upsert(authUser.id, {
					email: authUser.email,
				});
				console.log('Created profile for user:', authUser.email);
			} else {
				console.log('Profile already exists for user:', authUser.email);
			}
		} catch (error) {
			console.error('Error ensuring profile exists:', error);
			// Don't throw - this shouldn't block authentication
			console.warn('⚠️ Profile check failed - continuing without profile creation');
		}
	};

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);

			// TEMPORARILY DISABLED: Create profile if user is authenticated and doesn't have one
			// if (session?.user) {
			// 	await ensureProfileExists(session.user);
			// }

			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
			setSession(session);
			setUser(session?.user ?? null);

			// TEMPORARILY DISABLED: Create profile if user is authenticated and doesn't have one
			// if (session?.user) {
			// 	await ensureProfileExists(session.user);
			// }

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
