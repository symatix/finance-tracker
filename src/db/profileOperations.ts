import { supabase } from './supabase';
import type { ProfileDocument, CreateProfileInput, UpdateProfileInput } from './schemas';

export class ProfileOperations {
	// Create a new profile
	static async create(profileData: CreateProfileInput): Promise<ProfileDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('profiles')
			.insert({
				...profileData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get profile by user ID
	static async findByUserId(userId: string): Promise<ProfileDocument | null> {
		console.log('ProfileOperations.findByUserId called with userId:', userId);

		// Try using fetch directly to bypass supabase client issues
		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

		const url = `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`;
		console.log('Fetching from URL:', url);

		try {
			const response = await fetch(url, {
				headers: {
					apikey: supabaseAnonKey,
					'Content-Type': 'application/json',
				},
			});

			console.log('Response status:', response.status);

			if (!response.ok) {
				console.error('Response not ok:', response.statusText);
				return null;
			}

			const data = await response.json();
			console.log('Fetched data:', data);

			if (data && data.length > 0) {
				return data[0];
			}
			return null;
		} catch (error) {
			console.error('Fetch error:', error);
			throw error;
		}
	} // Update profile
	static async update(userId: string, updates: UpdateProfileInput): Promise<ProfileDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('profiles')
			.update({
				...updates,
				updated_at: now,
			})
			.eq('user_id', userId)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Create or update profile (upsert)
	static async upsert(userId: string, profileData: Omit<CreateProfileInput, 'user_id'>): Promise<ProfileDocument> {
		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

		// First check if profile exists
		const existing = await this.findByUserId(userId);

		const payload = {
			...profileData,
			updated_at: new Date().toISOString(),
		};

		console.log('Upserting profile:', { userId, payload, exists: !!existing });

		if (existing) {
			// Update existing profile
			const url = `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}`;
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					apikey: supabaseAnonKey,
					'Content-Type': 'application/json',
					Prefer: 'return=representation',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Update failed: ${response.status} ${errorText}`);
			}

			const data = await response.json();
			return data[0] || data;
		} else {
			// Insert new profile
			const url = `${supabaseUrl}/rest/v1/profiles`;
			const insertPayload = {
				user_id: userId,
				...payload,
			};

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					apikey: supabaseAnonKey,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(insertPayload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Insert failed: ${response.status} ${errorText}`);
			}

			const data = await response.json();
			return data[0] || data;
		}
	}

	// Delete profile
	static async delete(userId: string): Promise<void> {
		const { error } = await supabase.from('profiles').delete().eq('user_id', userId);

		if (error) throw error;
	}

	// Get display names for multiple users
	static async getDisplayNames(userIds: string[]): Promise<Record<string, string>> {
		const { data, error } = await supabase
			.from('profiles')
			.select('user_id, first_name, last_name, display_name, email')
			.in('user_id', userIds);

		if (error) throw error;

		const displayNames: Record<string, string> = {};
		for (const profile of data) {
			let name = profile.display_name;
			if (!name && profile.first_name && profile.last_name) {
				name = `${profile.first_name} ${profile.last_name}`;
			} else if (!name && profile.first_name) {
				name = profile.first_name;
			} else if (!name && profile.last_name) {
				name = profile.last_name;
			}
			// If still no name, use email as fallback
			if (!name && profile.email) {
				name = profile.email;
			}
			displayNames[profile.user_id] = name || 'Unknown User';
		}

		// Add fallback for users without profiles - this shouldn't happen with the new schema
		// but keeping for backward compatibility
		for (const userId of userIds) {
			if (!displayNames[userId]) {
				displayNames[userId] = 'Unknown User';
			}
		}

		return displayNames;
	}
}
