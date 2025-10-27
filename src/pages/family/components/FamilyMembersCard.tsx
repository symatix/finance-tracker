import {
	Card,
	CardContent,
	Typography,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Chip,
	Avatar,
	Box,
	Button,
} from '@mui/material';
import { PersonAdd, PersonRemove, AdminPanelSettings } from '@mui/icons-material';
import type { FamilyDocument, FamilyMemberDocument } from '../../../db';

interface FamilyWithMembers extends FamilyDocument {
	members?: FamilyMemberDocument[];
}

interface FamilyMembersCardProps {
	family: FamilyWithMembers;
	onAddMember: () => void;
	onRemoveMember: (memberId: string) => void;
}

export function FamilyMembersCard({ family, onAddMember, onRemoveMember }: FamilyMembersCardProps) {
	const members = family.members || [];

	return (
		<Card>
			<CardContent>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant='h6'>Account Members</Typography>
					<Button size='small' startIcon={<PersonAdd />} onClick={onAddMember} variant='outlined'>
						Add Member
					</Button>
				</Box>

				{members.length === 0 ? (
					<Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 2 }}>
						No members yet. Add account members to start collaborating.
					</Typography>
				) : (
					<List dense>
						{members.map((member) => (
							<ListItem key={member.id}>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'primary.main' }}>
										{member.user_id.charAt(0).toUpperCase()}
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary={
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											{`User ${member.user_id.slice(0, 8)}`}
											{member.role === 'owner' && (
												<AdminPanelSettings fontSize='small' color='primary' />
											)}
										</Box>
									}
									secondary={
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
											<Chip
												label={member.role}
												size='small'
												color={member.role === 'owner' ? 'primary' : 'default'}
												variant={member.role === 'owner' ? 'filled' : 'outlined'}
											/>
											<Typography variant='caption' color='text.secondary'>
												Joined {new Date(member.joined_at).toLocaleDateString()}
											</Typography>
										</Box>
									}
								/>
								<ListItemSecondaryAction>
									{member.role !== 'owner' && (
										<IconButton
											edge='end'
											size='small'
											onClick={() => onRemoveMember(member.id)}
											color='error'
										>
											<PersonRemove fontSize='small' />
										</IconButton>
									)}
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				)}
			</CardContent>
		</Card>
	);
}
