import { supabase } from './supabase';
import type { InvitationDocument, CreateInvitationInput, UpdateInvitationInput } from './schemas';

export class InvitationOperations {
	// Create a new invitation
	static async create(invitationData: CreateInvitationInput): Promise<InvitationDocument> {
		const { data, error } = await supabase.from('invitations').insert(invitationData).select().single();

		if (error) throw error;
		return data;
	}

	// Get invitation by token
	static async findByToken(token: string): Promise<InvitationDocument | null> {
		const { data, error } = await supabase.from('invitations').select('*').eq('invite_token', token).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Get invitation by ID
	static async findById(id: string): Promise<InvitationDocument | null> {
		const { data, error } = await supabase.from('invitations').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Get all invitations for a family
	static async findByFamilyId(familyId: string): Promise<InvitationDocument[]> {
		const { data, error } = await supabase
			.from('invitations')
			.select('*')
			.eq('family_id', familyId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Get invitations sent by a user
	static async findByInvitedBy(userId: string): Promise<InvitationDocument[]> {
		const { data, error } = await supabase
			.from('invitations')
			.select('*')
			.eq('invited_by', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Update invitation
	static async update(id: string, updateData: UpdateInvitationInput): Promise<InvitationDocument | null> {
		const { data, error } = await supabase.from('invitations').update(updateData).eq('id', id).select().single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Delete invitation
	static async delete(id: string): Promise<boolean> {
		const { error } = await supabase.from('invitations').delete().eq('id', id);

		if (error) throw error;
		return true;
	}

	// Accept invitation using RPC function
	static async accept(token: string): Promise<boolean> {
		const { data, error } = await supabase.rpc('accept_invitation', { p_token: token });

		if (error) throw error;
		return data;
	}

	// Create invitation using RPC function and send email
	static async createInvitation(email: string, familyId: string, role: string = 'member'): Promise<string> {
		const { data, error } = await supabase.rpc('create_invitation', {
			p_email: email,
			p_family_id: familyId,
			p_role: role,
		});

		if (error) throw error;

		// Send invitation email via Edge Function
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session?.access_token) {
				throw new Error('No authentication token available');
			}

			const response = await supabase.functions.invoke('send-invitation', {
				body: {
					email,
					family_id: familyId,
					role,
					invited_by: session.user.id,
				},
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (response.error) {
				console.warn('Failed to send invitation email:', response.error);
				// Don't throw here - invitation was created successfully
			}
		} catch (emailError) {
			console.warn('Failed to send invitation email:', emailError);
			// Don't throw here - invitation was created successfully
		}

		return data;
	}

	// Check if email is already invited to family
	static async isEmailInvited(email: string, familyId: string): Promise<boolean> {
		const { data, error } = await supabase
			.from('invitations')
			.select('id')
			.eq('email', email)
			.eq('family_id', familyId)
			.eq('status', 'pending')
			.limit(1);

		if (error) throw error;
		return (data || []).length > 0;
	}

	// Get pending invitations for current user (by email)
	static async findPendingForUser(): Promise<InvitationDocument[]> {
		// Get current user's email
		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError) throw userError;

		if (!userData.user?.email) return [];

		const { data, error } = await supabase
			.from('invitations')
			.select('*')
			.eq('email', userData.user.email)
			.eq('status', 'pending')
			.gt('expires_at', new Date().toISOString())
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}
}
