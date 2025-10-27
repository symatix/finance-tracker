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
		const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Update profile
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
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('profiles')
			.upsert(
				{
					user_id: userId,
					...profileData,
					updated_at: now,
				},
				{
					onConflict: 'user_id',
				}
			)
			.select()
			.single();

		if (error) throw error;
		return data;
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
