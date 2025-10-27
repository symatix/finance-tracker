import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	Button,
	IconButton,
	Chip,
	Avatar,
} from '@mui/material';
import { PersonAdd, PersonRemove, AdminPanelSettings } from '@mui/icons-material';
import type { FamilyDocument, FamilyMemberDocument } from '../../../db';

interface FamilyWithMembers extends FamilyDocument {
	members?: FamilyMemberDocument[];
}

interface FamilyMembersTableProps {
	family: FamilyWithMembers;
	onAddMember: () => void;
	onRemoveMember: (memberId: string) => void;
}

export function FamilyMembersTable({ family, onAddMember, onRemoveMember }: FamilyMembersTableProps) {
	const members = family.members || [];

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
				<Typography variant='h6'>Account Members</Typography>
				<Button size='small' startIcon={<PersonAdd />} onClick={onAddMember} variant='outlined'>
					Add Member
				</Button>
			</Box>

			{members.length === 0 ? (
				<Paper sx={{ p: 3, textAlign: 'center' }}>
					<Typography variant='body2' color='text.secondary'>
						No members yet. Add account members to start collaborating.
					</Typography>
				</Paper>
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Member</TableCell>
								<TableCell>Role</TableCell>
								<TableCell>Joined</TableCell>
								<TableCell align='right'>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{members.map((member) => (
								<TableRow key={member.id}>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
												{member.user_id.charAt(0).toUpperCase()}
											</Avatar>
											<Box>
												<Typography variant='body2' fontWeight='medium'>
													User {member.user_id.slice(0, 8)}
												</Typography>
												{member.role === 'owner' && (
													<Box
														sx={{
															display: 'flex',
															alignItems: 'center',
															gap: 0.5,
															mt: 0.5,
														}}
													>
														<AdminPanelSettings fontSize='small' color='primary' />
														<Typography variant='caption' color='primary'>
															Owner
														</Typography>
													</Box>
												)}
											</Box>
										</Box>
									</TableCell>
									<TableCell>
										<Chip
											label={member.role}
											size='small'
											color={member.role === 'owner' ? 'primary' : 'default'}
											variant={member.role === 'owner' ? 'filled' : 'outlined'}
										/>
									</TableCell>
									<TableCell>
										<Typography variant='body2' color='text.secondary'>
											{new Date(member.joined_at).toLocaleDateString()}
										</Typography>
									</TableCell>
									<TableCell align='right'>
										{member.role !== 'owner' && (
											<IconButton
												size='small'
												onClick={() => onRemoveMember(member.id)}
												color='error'
												title='Remove member'
											>
												<PersonRemove fontSize='small' />
											</IconButton>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
}
