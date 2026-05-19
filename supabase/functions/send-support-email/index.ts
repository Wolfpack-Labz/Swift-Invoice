import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY secret.' }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const {
      name,
      email,
      requestType,
      appName,
      subject,
      message,
      isBugReport,
    } = await req.json();

    if (!name || !email || !message || !requestType || !subject) {
      return new Response(
        JSON.stringify({
          error: 'Name, email, request type, subject, and message are required.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const cleanRequestType = String(requestType).trim();
    const cleanAppName = String(appName || 'Not provided').trim();
    const cleanSubject = String(subject).trim();

    const emailSubject = `${cleanRequestType}: ${cleanSubject}`;

    const html = `
      <h2>${emailSubject}</h2>
      <p><strong>Request Type:</strong> ${cleanRequestType}</p>
      <p><strong>App:</strong> ${cleanAppName}</p>
      <p><strong>Name:</strong> ${String(name).trim()}</p>
      <p><strong>Email:</strong> ${String(email).trim()}</p>
      <p><strong>Bug Report:</strong> ${isBugReport ? 'Yes' : 'No'}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${String(message).trim().replaceAll('\n', '<br />')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wolfpack Labs <support@wolfpack-labs.com>',
        to: ['support@wolfpack-labs.com'],
        reply_to: String(email).trim(),
        subject: emailSubject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({
          error: resendData?.message || 'Failed to send email.',
          details: resendData,
        }),
        {
          status: resendResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(JSON.stringify({ success: true, data: resendData }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected error.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
