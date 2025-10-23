import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

export async function processRecurring() {
	const { data, error } = await supabase.rpc('process_recurring_transactions');

	if (error) {
		console.error('Error processing recurring transactions:', error);
		return new Response(JSON.stringify({ error }), { status: 500 });
	}

	console.log(
		`Processed ${data[0].processed_count} recurring transactions, created ${data[0].created_transactions} transactions`
	);

	return new Response(
		JSON.stringify({
			success: true,
			processed: data[0].processed_count,
			created: data[0].created_transactions,
		})
	);
}
