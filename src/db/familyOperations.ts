import { supabase } from './supabase';
import type {
	FamilyDocument,
	FamilyMemberDocument,
	CreateFamilyInput,
	UpdateFamilyInput,
	CreateFamilyMemberInput,
	UpdateFamilyMemberInput,
} from './schemas';

export class FamilyOperations {
	// Create a new family
	static async create(familyData: CreateFamilyInput): Promise<FamilyDocument> {
		const now = new Date().toISOString();

		const { data, error } = await supabase
			.from('families')
			.insert({
				...familyData,
				created_at: now,
				updated_at: now,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Get family by ID
	static async findById(id: string): Promise<FamilyDocument | null> {
		const { data, error } = await supabase.from('families').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Get all families for a user
	static async findByUserId(userId: string): Promise<FamilyDocument[]> {
		const { data, error } = await supabase
			.from('families')
			.select('*')
			.or(`owner_id.eq.${userId}`)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	// Update family
	static async update(id: string, updateData: UpdateFamilyInput): Promise<FamilyDocument | null> {
		const { data, error } = await supabase
			.from('families')
			.update({
				...updateData,
				updated_at: new Date().toISOString(),
			})
			.eq('id', id)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Delete family
	static async delete(id: string): Promise<boolean> {
		const { error } = await supabase.from('families').delete().eq('id', id);

		if (error) throw error;
		return true;
	}

	// Get family with members
	static async findWithMembers(familyId: string): Promise<{
		family: FamilyDocument;
		members: Array<FamilyMemberDocument & { email?: string }>;
	} | null> {
		// Get family
		const family = await this.findById(familyId);
		if (!family) return null;

		// Get members with user emails
		const { data: members, error } = await supabase
			.from('family_members')
			.select(
				`
				*,
				user:user_id (
					email
				)
			`
			)
			.eq('family_id', familyId);

		if (error) throw error;

		const membersWithEmails = (members || []).map((member) => ({
			...member,
			email: (member as FamilyMemberDocument & { user?: { email: string } }).user?.email || 'Unknown',
		}));

		return {
			family,
			members: membersWithEmails,
		};
	}
}

export class FamilyMemberOperations {
	// Add member to family
	static async create(memberData: CreateFamilyMemberInput): Promise<FamilyMemberDocument> {
		const { data, error } = await supabase.from('family_members').insert(memberData).select().single();

		if (error) throw error;
		return data;
	}

	// Get member by ID
	static async findById(id: string): Promise<FamilyMemberDocument | null> {
		const { data, error } = await supabase.from('family_members').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Get user's family memberships
	static async findByUserId(userId: string): Promise<Array<FamilyMemberDocument & { family: FamilyDocument }>> {
		const { data, error } = await supabase
			.from('family_members')
			.select(
				`
				*,
				family:families(*)
			`
			)
			.eq('user_id', userId);

		if (error) throw error;
		return data || [];
	}

	// Get all members of a family
	static async findByFamilyId(familyId: string): Promise<FamilyMemberDocument[]> {
		const { data, error } = await supabase
			.from('family_members')
			.select('*')
			.eq('family_id', familyId)
			.order('joined_at', { ascending: true });

		if (error) throw error;
		return data || [];
	}

	// Update member role
	static async update(id: string, updateData: UpdateFamilyMemberInput): Promise<FamilyMemberDocument | null> {
		const { data, error } = await supabase.from('family_members').update(updateData).eq('id', id).select().single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data;
	}

	// Remove member from family
	static async delete(id: string): Promise<boolean> {
		const { error } = await supabase.from('family_members').delete().eq('id', id);

		if (error) throw error;
		return true;
	}

	// Check if user is member of family
	static async isMember(familyId: string, userId: string): Promise<boolean> {
		const { data, error } = await supabase
			.from('family_members')
			.select('id')
			.eq('family_id', familyId)
			.eq('user_id', userId)
			.limit(1);

		if (error) throw error;
		return (data || []).length > 0;
	}

	// Get user's role in family
	static async getUserRole(familyId: string, userId: string): Promise<string | null> {
		const { data, error } = await supabase
			.from('family_members')
			.select('role')
			.eq('family_id', familyId)
			.eq('user_id', userId)
			.limit(1)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}
		return data.role;
	}
}
