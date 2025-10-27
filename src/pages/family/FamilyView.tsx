import {
	Box,
	Stack,
	Button,
	Typography,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Card,
	CardContent,
} from '@mui/material';
import { GroupAdd, Edit, Delete, FamilyRestroom } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useBudgetStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { useFamilyManagement } from './hooks/useFamilyManagement';
import { FamilySelector } from './components/FamilySelector';
import { FamilyModal } from './components/FamilyModal';
import { FamilyMembersTable } from './components/FamilyMembersTable';
import { InvitationsTable } from './components/InvitationsTable';
import { AddMemberModal } from './components/AddMemberModal';
import type { FamilyDocument, CreateFamilyInput, FamilyMemberDocument } from '../../db';

interface FamilyWithMembers extends FamilyDocument {
	members?: FamilyMemberDocument[];
}

export default function FamilyView() {
	const { user } = useAuth();
	const { families, currentFamilyId, isLoading, loadFamilies, setCurrentFamily } = useBudgetStore();
	const [invitationsKey, setInvitationsKey] = useState(0);
	const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);

	useEffect(() => {
		if (user && families.length === 0) {
			loadFamilies(user.id);
		}
	}, [user, families.length, loadFamilies]);

	const {
		modalOpen,
		familyToEdit,
		openCreateModal,
		openEditModal,
		closeModal,
		handleCreateFamily,
		handleUpdateFamily,
		handleDeleteFamily,
	} = useFamilyManagement({
		onCreate: async () => {
			if (user) {
				await loadFamilies(user.id);
			}
		},
		onUpdate: async () => {
			if (user) {
				await loadFamilies(user.id);
			}
		},
		onDelete: async () => {
			if (user) {
				await loadFamilies(user.id);
			}
		},
	});

	const handleAddMember = () => {
		setAddMemberModalOpen(true);
	};

	const handleMemberAdded = async () => {
		if (user) {
			await loadFamilies(user.id);
		}
		// Refresh invitations list
		setInvitationsKey((prev) => prev + 1);
	};

	const handleRemoveMember = async (memberId: string) => {
		try {
			await useBudgetStore.getState().removeFamilyMember(memberId);
			if (user) {
				await loadFamilies(user.id);
			}
		} catch (error) {
			console.error('Failed to remove member:', error);
		}
	};

	const currentFamily = families.find((f) => f.id === currentFamilyId) as FamilyWithMembers | undefined;

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		setDeleteDialogOpen(false);
		if (currentFamily) {
			handleDeleteFamily(currentFamily.id);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
	};

	return (
		<Box p={4}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
				alignItems='center'
				mb={1}
			>
				<Typography variant='h5'>Account Management</Typography>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='flex-end'>
					<Button
						variant='contained'
						startIcon={<FamilyRestroom />}
						onClick={openCreateModal}
						disabled={isLoading}
					>
						Create Family Account
					</Button>
				</Stack>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			{/* Family Selector */}
			{families.length > 0 && (
				<>
					<Box mb={3} sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
						<FamilySelector
							families={families}
							currentFamilyId={currentFamilyId}
							onFamilyChange={setCurrentFamily}
						/>
						<Box>
							<Button
								sx={{ mr: 2 }}
								variant='outlined'
								startIcon={<Edit />}
								onClick={() => openEditModal(currentFamily!)}
							>
								Edit Family
							</Button>
							<Button variant='outlined' color='error' startIcon={<Delete />} onClick={handleDeleteClick}>
								Delete Family
							</Button>
						</Box>
					</Box>
				</>
			)}

			{/* Family Overview */}
			{currentFamily ? (
				<Stack spacing={3}>
					{/* Members Table */}
					<FamilyMembersTable
						family={currentFamily}
						onAddMember={handleAddMember}
						onRemoveMember={handleRemoveMember}
					/>

					{/* Invitations Table (only shown if there are pending invitations) */}
					<InvitationsTable key={invitationsKey} familyId={currentFamily.id} />
				</Stack>
			) : (
				<Card>
					<CardContent sx={{ textAlign: 'center', py: 6 }}>
						<FamilyRestroom sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
						<Typography variant='h6' color='text.secondary' gutterBottom>
							No Account Selected
						</Typography>
						<Typography variant='body2' color='text.secondary' mb={3}>
							Create or join an account to start collaborating on your finances.
						</Typography>
						<Button
							variant='contained'
							startIcon={<GroupAdd />}
							onClick={openCreateModal}
							disabled={isLoading}
						>
							Create Your First Account
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Family Modal */}
			<FamilyModal
				open={modalOpen}
				onClose={closeModal}
				onSave={async (familyData) => {
					if (familyToEdit) {
						const updateData = familyData as { id: string; updates: Partial<FamilyDocument> };
						await handleUpdateFamily(updateData.id, updateData.updates);
					} else {
						await handleCreateFamily(familyData as CreateFamilyInput);
					}
				}}
				initialData={familyToEdit}
				userId={user?.id || ''}
			/>

			{/* Add Member Modal */}
			{currentFamily && (
				<AddMemberModal
					open={addMemberModalOpen}
					onClose={() => setAddMemberModalOpen(false)}
					familyId={currentFamily.id}
					onMemberAdded={handleMemberAdded}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			{currentFamily && (
				<Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
					<DialogTitle>Delete Family</DialogTitle>
					<DialogContent>
						<Typography>Are you sure you want to delete the family "{currentFamily.name}"?</Typography>
						<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
							This action cannot be undone. All family members will be removed and shared resources will
							no longer be accessible.
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleDeleteCancel}>Cancel</Button>
						<Button onClick={handleDeleteConfirm} color='error' variant='contained'>
							Delete Family
						</Button>
					</DialogActions>
				</Dialog>
			)}
		</Box>
	);
}
