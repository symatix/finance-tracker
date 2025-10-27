import { FormControl, InputLabel, Select, MenuItem, Box, Typography, Chip } from '@mui/material';
import { FamilyRestroom } from '@mui/icons-material';
import { useEffect } from 'react';
import type { FamilyDocument } from '../../../db';

interface FamilySelectorProps {
	families: FamilyDocument[];
	currentFamilyId: string | null;
	onFamilyChange: (familyId: string | null) => void;
}

export function FamilySelector({ families, currentFamilyId, onFamilyChange }: FamilySelectorProps) {
	const currentFamily = families.find((f) => f.id === currentFamilyId);

	// Auto-select first family if none is selected and families exist
	useEffect(() => {
		if (!currentFamilyId && families.length > 0) {
			onFamilyChange(families[0].id);
		}
	}, [families, currentFamilyId, onFamilyChange]);

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			<FamilyRestroom color='primary' />
			<FormControl size='small' sx={{ minWidth: 200 }}>
				<InputLabel>Current Family</InputLabel>
				<Select
					value={currentFamilyId || ''}
					label='Current Family'
					onChange={(e) => onFamilyChange(e.target.value || null)}
				>
					<MenuItem value=''>
						<em>No family selected</em>
					</MenuItem>
					{families.map((family) => (
						<MenuItem key={family.id} value={family.id}>
							<Box>
								<Typography variant='body2' fontWeight='medium'>
									{family.name}
								</Typography>
								{/* <Typography variant='caption' color='text.secondary'>
									{family.description || 'No description'}
								</Typography> */}
							</Box>
						</MenuItem>
					))}
				</Select>
			</FormControl>
			{/* {currentFamily && <Chip label='Active' size='small' color='primary' variant='outlined' />} */}
		</Box>
	);
}
