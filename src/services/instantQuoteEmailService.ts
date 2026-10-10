interface InstantQuoteEmailParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  estimateRange: string;
  quoteId?: string;
}

/**
 * Send instant quote confirmation email to customer using the proper template from database
 */
export async function sendInstantQuoteConfirmation(
  params: InstantQuoteEmailParams
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 Sending instant quote confirmation via edge function for:', params.customerEmail);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-instant-quote-confirmation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: params.customerName,
          customerEmail: params.customerEmail,
          customerPhone: params.customerPhone,
          estimateRange: params.estimateRange,
          quoteId: params.quoteId
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Instant quote confirmation failed:', errorData);
      return { success: false, error: errorData.error || 'Email sending failed' };
    }

    const result = await response.json();
    console.log('✅ Instant quote confirmation sent successfully via MailJet:', result);
    return { success: true };

  } catch (error) {
    console.error('❌ Error sending instant quote confirmation:', error);
    return { success: false, error: String(error) };
  }
}
