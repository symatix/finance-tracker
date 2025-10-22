import {
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Stack,
	IconButton,
	Chip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import type { Category } from '../../../store/store';

interface CategoryTableProps {
	categories: Category[];
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>Type</TableCell>
						<TableCell>Subcategories</TableCell>
						<TableCell align='right'>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{categories.map((category) => (
						<TableRow key={category.id}>
							<TableCell>{category.name}</TableCell>
							<TableCell>{category.type}</TableCell>
							<TableCell>
								<Stack direction='row' spacing={1} flexWrap='wrap'>
									{category.subcategories?.map((sub) => (
										<Chip key={sub} label={sub} size='small' />
									))}
									{(!category.subcategories || category.subcategories.length === 0) && (
										<Typography variant='body2' color='text.secondary'>
											No subcategories
										</Typography>
									)}
								</Stack>
							</TableCell>
							<TableCell align='right'>
								<Stack direction='row' spacing={1} justifyContent='flex-end'>
									<IconButton color='primary' onClick={() => onEdit(category.id)}>
										<Edit />
									</IconButton>
									<IconButton color='error' onClick={() => onDelete(category.id)}>
										<Delete />
									</IconButton>
								</Stack>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
