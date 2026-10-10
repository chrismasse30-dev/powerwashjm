import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BrevoContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  source?: string;
  signedUpDate?: string;
}

interface BrevoApiPayload {
  email: string;
  attributes: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    SMS?: string;
    CITY?: string;
    STATE?: string;
    SOURCE?: string;
    SIGNEDUPDATE?: string;
  };
  listIds: number[];
  updateEnabled: boolean;
}

async function getBrevoApiKey(): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'brevo_smtp_key')
      .maybeSingle();

    if (error) {
      console.log('Error fetching brevo_smtp_key from DB:', error.message);
      return null;
    }

    if (data?.setting_value && data.setting_value !== 'NOT_CONFIGURED') {
      console.log('✅ Using Brevo SMTP key from database');
      return data.setting_value;
    }

    return null;
  } catch (err) {
    console.error('Error in getBrevoApiKey:', err);
    return null;
  }
}

function formatDateForBrevo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided, using current date');
      return new Date().toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0];
  }
}

function splitName(fullName: string | null | undefined): { firstName: string; lastName: string } {
  if (!fullName || fullName.trim() === '') {
    return { firstName: '', lastName: '' };
  }

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  return { firstName, lastName };
}

async function syncContactToBrevo(
  contactData: BrevoContactData,
  brevoApiKey: string
): Promise<{ success: boolean; error?: string; brevoResponse?: any }> {

  console.log('Syncing contact to Brevo:', contactData.email);

  if (!contactData.email || !contactData.email.includes('@')) {
    return {
      success: false,
      error: 'Invalid email address'
    };
  }

  const { firstName, lastName } = contactData.firstName
    ? { firstName: contactData.firstName, lastName: contactData.lastName || '' }
    : splitName(contactData.firstName);

  const payload: BrevoApiPayload = {
    email: contactData.email.toLowerCase().trim(),
    attributes: {},
    listIds: [4],
    updateEnabled: true
  };

  if (firstName) {
    payload.attributes.FIRSTNAME = firstName;
  }

  if (lastName) {
    payload.attributes.LASTNAME = lastName;
  }

  if (contactData.phone) {
    payload.attributes.SMS = contactData.phone;
  }

  if (contactData.city) {
    payload.attributes.CITY = contactData.city;
  }

  if (contactData.state) {
    payload.attributes.STATE = contactData.state;
  }

  if (contactData.source) {
    payload.attributes.SOURCE = contactData.source;
  }

  payload.attributes.SIGNEDUPDATE = formatDateForBrevo(contactData.signedUpDate);

  console.log('Brevo API Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (response.ok || response.status === 201) {
      console.log('Brevo sync successful:', responseData);
      return {
        success: true,
        brevoResponse: responseData
      };
    } else if (response.status === 400 && responseData.code === 'duplicate_parameter') {
      console.log('Brevo contact updated (already exists):', responseData);
      return {
        success: true,
        brevoResponse: responseData
      };
    } else {
      console.error('Brevo API error:', response.status, responseData);
      return {
        success: false,
        error: `Brevo API error: ${response.status} - ${JSON.stringify(responseData)}`,
        brevoResponse: responseData
      };
    }
  } catch (error) {
    console.error('Brevo sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      city,
      state,
      source,
      signedUpDate
    } = await req.json();

    console.log('Received sync request for:', email);

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const brevoApiKey = await getBrevoApiKey();

    if (!brevoApiKey) {
      console.warn('⚠️  Brevo API key not configured - contact saved locally only');
      return new Response(
        JSON.stringify({
          success: true,
          warning: 'Contact saved locally (Brevo sync disabled)',
          message: 'Contact saved successfully'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('API Key starts with:', brevoApiKey.substring(0, 15));
    console.log('API Key length:', brevoApiKey.length);

    const result = await syncContactToBrevo({
      email,
      firstName,
      lastName,
      phone,
      city,
      state,
      source,
      signedUpDate
    }, brevoApiKey);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Contact synced to Brevo successfully',
          brevoResponse: result.brevoResponse
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('Brevo sync failed but returning success to avoid breaking UX:', result.error);

      return new Response(
        JSON.stringify({
          success: true,
          warning: 'Contact saved but Brevo sync failed',
          error: result.error
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});