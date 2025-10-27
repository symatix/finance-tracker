import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationData {
	email: string;
	family_id: string;
	role: string;
	invited_by: string;
}

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: corsHeaders,
		});
	}

	try {
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			{
				global: {
					headers: { Authorization: req.headers.get('Authorization')! },
				},
			}
		);

		const { email, family_id, role, invited_by } = (await req.json()) as InvitationData;

		// Get the invitation token from the database
		const { data: invitation, error: inviteError } = await supabaseClient
			.from('invitations')
			.select('invite_token')
			.eq('email', email)
			.eq('family_id', family_id)
			.eq('invited_by', invited_by)
			.eq('role', role)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();

		if (inviteError || !invitation) {
			throw new Error('Invitation not found');
		}

		// Get family name for the email
		const { data: family, error: familyError } = await supabaseClient
			.from('families')
			.select('name')
			.eq('id', family_id)
			.single();

		if (familyError || !family) {
			throw new Error('Family not found');
		}

		// Get inviter's name
		const { data: inviter, error: inviterError } = await supabaseClient.auth.getUser();
		const inviterName = inviter?.user?.email?.split('@')[0] || 'Someone';

		// Create invitation URL
		const baseUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
		const inviteUrl = `${baseUrl}/accept-invite?token=${invitation.invite_token}`;

		// Send email using Resend (you'll need to set up Resend)
		const resendApiKey = Deno.env.get('RESEND_API_KEY');
		if (!resendApiKey) {
			console.warn('RESEND_API_KEY not set, skipping email send');
			return new Response(
				JSON.stringify({
					success: true,
					message: 'Invitation created (email not sent - RESEND_API_KEY not configured)',
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					status: 200,
				}
			);
		}

		// Determine sender email based on environment
		let fromEmail = 'Finance Tracker <invites@yourdomain.com>';

		if (baseUrl.includes('github.io')) {
			fromEmail = 'Finance Tracker <invites@symatix.github.io>';
		} else if (baseUrl.includes('localhost')) {
			// For localhost development, skip email or use a test service
			console.log('Development mode: skipping email send for localhost');
			return new Response(
				JSON.stringify({
					success: true,
					message: 'Invitation created (email not sent - localhost development mode)',
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					status: 200,
				}
			);
		}

		const emailResponse = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${resendApiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: fromEmail,
				to: [email],
				subject: `You're invited to join ${family.name} on Finance Tracker`,
				html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Finance Tracker Invitation</h1>
            <p>Hi there!</p>
            <p><strong>${inviterName}</strong> has invited you to join their financial account <strong>"${family.name}"</strong> on Finance Tracker.</p>
            <p>As a <strong>${role}</strong>, you'll be able to collaborate on financial planning and tracking.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>This invitation will expire in 7 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Finance Tracker - Collaborative Financial Management
            </p>
          </div>
        `,
			}),
		});

		if (!emailResponse.ok) {
			const errorText = await emailResponse.text();
			console.error('Failed to send email:', errorText);
			throw new Error('Failed to send invitation email');
		}

		return new Response(JSON.stringify({ success: true, message: 'Invitation sent successfully' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 200,
		});
	} catch (error: unknown) {
		console.error('Error sending invitation:', error);
		return new Response(JSON.stringify({ error: (error as Error).message || 'Failed to send invitation' }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 500,
		});
	}
});
