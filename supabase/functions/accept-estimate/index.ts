import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

type EstimateAction = 'accept' | 'decline';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function getRequestPayload(req: Request) {
  if (req.method === 'GET') {
    const url = new URL(req.url);

    return {
      token: url.searchParams.get('token')?.trim() ?? '',
      action: (url.searchParams.get('action')?.trim().toLowerCase() || 'accept') as EstimateAction,
    };
  }

  const body = await req.json().catch(() => ({}));

  return {
    token: String(body.token ?? '').trim(),
    action: String(body.action ?? 'accept').trim().toLowerCase() as EstimateAction,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Supabase environment variables are not configured.' }, 500);
    }

    if (!['GET', 'POST'].includes(req.method)) {
      return jsonResponse({ error: 'Method not allowed.' }, 405);
    }

    const { token, action } = await getRequestPayload(req);

    if (!token || token.length < 32) {
      return jsonResponse({ error: 'Invalid estimate response link.' }, 400);
    }

    if (!['accept', 'decline'].includes(action)) {
      return jsonResponse({ error: 'Invalid estimate response action.' }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (action === 'decline') {
      const { data, error } = await adminClient.rpc('decline_estimate_by_token', {
        p_acceptance_token: token,
      });

      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.estimate_id) {
        return jsonResponse({ error: 'Estimate could not be declined.' }, 500);
      }

      return jsonResponse({
        success: true,
        action: 'decline',
        estimateId: result.estimate_id,
        estimateNumber: result.estimate_number,
        declinedAt: result.declined_at,
      });
    }

    const { data, error } = await adminClient.rpc('accept_estimate_and_create_invoice', {
      p_acceptance_token: token,
    });

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.estimate_id || !result?.invoice_id) {
      return jsonResponse({ error: 'Estimate could not be accepted.' }, 500);
    }

    // Copy estimate photos to the new invoice. If this fails, the estimate/invoice conversion still succeeds.
    if (!result.already_converted) {
      const { data: estimatePhotos, error: photosError } = await adminClient
        .from('estimate_photos')
        .select('id, file_path, public_url')
        .eq('estimate_id', result.estimate_id)
        .eq('user_id', result.user_id)
        .order('created_at', { ascending: true });

      if (!photosError && estimatePhotos?.length) {
        const invoicePhotosToInsert = [];

        for (const [index, photo] of estimatePhotos.entries()) {
          if (!photo.file_path) continue;

          const originalFileName =
            String(photo.file_path).split('/').pop() || `estimate-photo-${index}.jpg`;
          const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '-');
          const copiedFilePath = `${result.user_id}/${result.invoice_id}/${Date.now()}-${index}-${safeFileName}`;

          const { error: copyError } = await adminClient.storage
            .from('invoice-photos')
            .copy(photo.file_path, copiedFilePath);

          if (copyError) {
            console.warn('Could not copy estimate photo:', copyError.message);
            continue;
          }

          const { data: publicUrlData } = adminClient.storage
            .from('invoice-photos')
            .getPublicUrl(copiedFilePath);

          invoicePhotosToInsert.push({
            invoice_id: result.invoice_id,
            customer_id: result.customer_id,
            user_id: result.user_id,
            file_path: copiedFilePath,
            public_url: publicUrlData.publicUrl,
          });
        }

        if (invoicePhotosToInsert.length > 0) {
          const { error: insertPhotosError } = await adminClient
            .from('invoice_photos')
            .insert(invoicePhotosToInsert);

          if (insertPhotosError) {
            console.warn('Could not insert copied invoice photos:', insertPhotosError.message);
          }
        }
      }
    }

    return jsonResponse({
      success: true,
      action: 'accept',
      alreadyConverted: Boolean(result.already_converted),
      estimateId: result.estimate_id,
      invoiceId: result.invoice_id,
      estimateNumber: result.estimate_number,
      invoiceNumber: result.invoice_number,
      acceptedAt: result.accepted_at,
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Could not process estimate response.' },
      500,
    );
  }
});
