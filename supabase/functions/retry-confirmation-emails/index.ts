import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Finding failed confirmation emails to retry...');

    // Find quotes that need confirmation emails sent/retried
    const { data: failedQuotes, error: queryError } = await supabase
      .rpc('retry_failed_confirmation_emails');

    if (queryError) {
      console.error('Error querying failed emails:', queryError);
      throw queryError;
    }

    if (!failedQuotes || failedQuotes.length === 0) {
      console.log('✅ No failed confirmation emails to retry');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No failed emails to retry',
          retried: 0
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📧 Found ${failedQuotes.length} confirmation emails to retry`);

    const results = {
      total: failedQuotes.length,
      succeeded: 0,
      failed: 0,
      details: [] as any[]
    };

    // Retry each failed email
    for (const quote of failedQuotes) {
      console.log(`Retrying email for quote ${quote.quote_id} (${quote.customer_email})`);

      try {
        // Get full quote details
        const { data: quoteData, error: quoteError } = await supabase
          .from('quote_submissions')
          .select('*')
          .eq('id', quote.quote_id)
          .maybeSingle();

        if (quoteError || !quoteData) {
          throw new Error('Quote not found');
        }

        // Call the send-customer-autoresponse function
        const response = await fetch(
          `${supabaseUrl}/functions/v1/send-customer-autoresponse`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: quoteData.name,
              email: quoteData.email,
              phone: quoteData.phone,
              address: quoteData.address,
              city: quoteData.city,
              state: quoteData.state,
              zipCode: quoteData.zip,
              propertyType: quoteData.property_type,
              services: quoteData.services,
              quoteId: quoteData.id
            })
          }
        );

        if (response.ok) {
          results.succeeded++;
          results.details.push({
            quoteId: quote.quote_id,
            email: quote.customer_email,
            status: 'success'
          });
          console.log(`✅ Successfully sent confirmation to ${quote.customer_email}`);

          // Update retry count in error log
          await supabase
            .from('email_sending_errors')
            .update({
              resolved: true,
              resolved_at: new Date().toISOString()
            })
            .eq('quote_submission_id', quote.quote_id)
            .eq('email_type', 'form_confirmation')
            .eq('resolved', false);
        } else {
          const errorText = await response.text();
          results.failed++;
          results.details.push({
            quoteId: quote.quote_id,
            email: quote.customer_email,
            status: 'failed',
            error: errorText
          });
          console.error(`❌ Failed to send confirmation to ${quote.customer_email}:`, errorText);

          // Increment retry count
          await supabase
            .from('email_sending_errors')
            .update({
              retry_count: supabase.rpc('increment_retry_count'),
              last_retry_at: new Date().toISOString()
            })
            .eq('quote_submission_id', quote.quote_id)
            .eq('email_type', 'form_confirmation')
            .eq('resolved', false);
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          quoteId: quote.quote_id,
          email: quote.customer_email,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Error retrying email for ${quote.customer_email}:`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`📊 Retry results: ${results.succeeded} succeeded, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});