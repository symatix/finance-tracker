import { Card, Typography, Box, Alert, Chip } from '@mui/material';
import type { BudgetAlert } from '../../../hooks/useBudgetAlerts';

interface BudgetAlertsSectionProps {
	alerts: BudgetAlert[];
}

export function BudgetAlertsSection({ alerts }: BudgetAlertsSectionProps) {
	if (alerts.length === 0) {
		return (
			<Card sx={{ p: 2, mb: 3 }}>
				<Typography variant='h6' fontWeight='bold' mb={2}>
					Budget Alerts
				</Typography>
				<Box sx={{ textAlign: 'center', py: 2 }}>
					<Typography color='text.secondary'>No budget alerts at this time</Typography>
				</Box>
			</Card>
		);
	}

	return (
		<Card sx={{ p: 2, mb: 3 }}>
			<Typography variant='h6' fontWeight='bold' mb={2}>
				Budget Alerts
				<Chip
					label={alerts.length}
					size='small'
					color={alerts.some((a) => a.type === 'danger') ? 'error' : 'warning'}
					sx={{ ml: 1 }}
				/>
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				{alerts.map((alert, index) => (
					<Alert
						key={index}
						severity={alert.type === 'danger' ? 'error' : alert.type}
						variant='outlined'
						sx={{ mb: 1 }}
					>
						{alert.message}
						{alert.dueDate && (
							<Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
								Due: {new Date(alert.dueDate).toLocaleDateString()}
							</Typography>
						)}
					</Alert>
				))}
			</Box>
		</Card>
	);
}
