import { Box, Divider, Typography, Stack, Button, Card, CardContent } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useShoppingLists } from './hooks/useShoppingLists';
import { ShoppingListModal } from './components/ShoppingListModal';
import { ListDetailModal } from './components/ListDetailModal';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import type { ShoppingListDocument } from '../../db';
import { ShoppingListOperations } from '../../db';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useBudgetStore } from '../../store';

export default function ShoppingListView() {
	const { user } = useAuth();
	const [listFilter, setListFilter] = useState<'active' | 'completed' | 'all'>('active');
	const { shoppingLists, loading, createList, updateList, deleteList, refetch } = useShoppingLists(listFilter);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingList, setEditingList] = useState<ShoppingListDocument | undefined>(undefined);

	const handleCreateList = () => {
		setEditingList(undefined);
		setModalOpen(true);
	};

	const handleEditList = (list: ShoppingListDocument) => {
		setEditingList(list);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setEditingList(undefined);
	};

	const handleModalSubmit = async (listData: {
		name: string;
		category_id: string;
		subcategory?: string;
		items: { name: string; quantity: number; estimated_price?: number }[];
	}) => {
		if (editingList) {
			await updateList(editingList.id, {
				name: listData.name,
				category_id: listData.category_id,
				subcategory: listData.subcategory,
			});
		} else {
			await createList(listData);
		}
		handleModalClose();
	};

	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [selectedList, setSelectedList] = useState<ShoppingListDocument | null>(null);

	const handleOpenList = (list: ShoppingListDocument) => {
		setSelectedList(list);
		setDetailModalOpen(true);
	};

	const handleCloseDetailModal = () => {
		setDetailModalOpen(false);
		setSelectedList(null);
	};

	const handleDeleteList = async (listId: string) => {
		if (confirm('Are you sure you want to delete this shopping list?')) {
			await deleteList(listId);
		}
	};

	const handleCompleteList = async (listId: string, totalAmount: number) => {
		if (!user) return;
		try {
			const result = await ShoppingListOperations.completeList(listId, totalAmount, user.id);
			if (result) {
				// Add the created transaction to the global store state
				useBudgetStore.setState((state) => ({
					transactions: [
						...state.transactions,
						{
							id: result.transaction.id,
							type: result.transaction.type,
							amount: result.transaction.amount,
							categoryId: result.transaction.category_id,
							subcategory: result.transaction.subcategory,
							note: result.transaction.note,
							date: result.transaction.date,
						},
					],
				}));
			}
			// Refresh lists
			await refetch();
		} catch (error) {
			console.error('Error completing list:', error);
			alert('Failed to complete list. Please try again.');
		}
	};

	if (!user) return null;

	return (
		<Box p={4}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				mb={1}
				spacing={2}
			>
				<Typography variant='h5'>Shopping Lists</Typography>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2}
					alignItems='center'
					width={{ xs: '100%', sm: 'auto' }}
				>
					<FormControl size='small' sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
						<InputLabel>Filter</InputLabel>
						<Select
							value={listFilter}
							label='Filter'
							onChange={(e) => setListFilter(e.target.value as 'active' | 'completed' | 'all')}
						>
							<MenuItem value='active'>Active</MenuItem>
							<MenuItem value='completed'>Completed</MenuItem>
							<MenuItem value='all'>All</MenuItem>
						</Select>
					</FormControl>
					<Button
						variant='contained'
						startIcon={<AddIcon />}
						onClick={handleCreateList}
						sx={{ width: { xs: '100%', sm: 'auto' } }}
					>
						New List
					</Button>
				</Stack>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			{loading ? (
				<Typography>Loading...</Typography>
			) : (
				<Stack spacing={2}>
					{shoppingLists.map(
						(list: ShoppingListDocument & { categoryName?: string; categoryType?: string }) => (
							<Card key={list.id} sx={{ opacity: list.status === 'completed' ? 0.7 : 1 }}>
								<CardContent>
									<Typography variant='h6'>{list.name}</Typography>
									<Typography variant='body2' color='text.secondary'>
										Category: {list.categoryName} {list.subcategory && ` - ${list.subcategory}`}
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										Status: {list.status === 'active' ? 'Active' : 'Completed'}
									</Typography>
									<Stack direction='row' spacing={1} mt={2}>
										<Button size='small' onClick={() => handleOpenList(list)}>
											Open
										</Button>
										<Button size='small' onClick={() => handleEditList(list)}>
											Edit
										</Button>
										<Button size='small' color='error' onClick={() => handleDeleteList(list.id)}>
											Delete
										</Button>
									</Stack>
								</CardContent>
							</Card>
						)
					)}
				</Stack>
			)}

			<ShoppingListModal
				open={modalOpen}
				onClose={handleModalClose}
				onSubmit={handleModalSubmit}
				editingList={editingList}
			/>

			<ListDetailModal
				open={detailModalOpen}
				onClose={handleCloseDetailModal}
				list={selectedList}
				onCompleteList={handleCompleteList}
			/>
		</Box>
	);
}
