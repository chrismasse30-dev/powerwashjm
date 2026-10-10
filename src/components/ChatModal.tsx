import { X } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { trackChatEvent } from '../utils/analytics';
import ChatBox from './ChatBox';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen && !conversationId) return null;

  if (conversationId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setConversationId(null);
            setFirstName('');
            setLastName('');
            setPhone('');
            setEmail('');
            setService('');
            onClose();
          }}
        ></div>

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600">
              We received your message and will reach out to you shortly via email or phone.
            </p>
          </div>

          <button
            onClick={() => {
              setConversationId(null);
              setFirstName('');
              setLastName('');
              setPhone('');
              setEmail('');
              setService('');
              onClose();
            }}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedPhone = phone.startsWith('+1') ? phone : `+1${phone.replace(/\D/g, '')}`;

      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          customer_name: `${firstName} ${lastName}`,
          customer_phone: formattedPhone,
          source_url: window.location.href,
          status: 'open',
        })
        .select()
        .single();

      if (convError) throw convError;

      const initialMessage = `New chat request:\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${formattedPhone}\nService Needed: ${service}`;

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'customer',
          sender_name: `${firstName} ${lastName}`,
          message: initialMessage,
        });

      if (messageError) throw messageError;

      trackChatEvent('conversation_started', {
        conversation_id: conversation.id,
        service: service
      });

      const emailNotificationUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-chat-email-notification`;

      try {
        const emailResponse = await fetch(emailNotificationUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone: formattedPhone,
            service,
            source: window.location.href
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Email notification failed:', errorText);

          await supabase.from('notification_log').insert({
            notification_type: 'chat_email',
            reference_id: conversation.id,
            recipient_email: 'sales@powerwashjm.com',
            status: 'failed',
            error_message: errorText
          });
        } else {
          const result = await emailResponse.json();
          console.log('Email notification sent successfully:', result);

          await supabase.from('notification_log').insert({
            notification_type: 'chat_email',
            reference_id: conversation.id,
            recipient_email: 'sales@powerwashjm.com',
            status: 'sent'
          });
        }
      } catch (notifError) {
        console.error('Email notification error:', notifError);

        await supabase.from('notification_log').insert({
          notification_type: 'chat_email',
          reference_id: conversation.id,
          recipient_email: 'sales@powerwashjm.com',
          status: 'failed',
          error_message: notifError instanceof Error ? notifError.message : 'Unknown error'
        });
      }

      // Add to newsletter signups
      try {
        await supabase
          .from('newsletter_signups')
          .insert([{
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: formattedPhone,
            source: 'Live Chat'
          }])
          .then(({ error }) => {
            if (error && error.code !== '23505') {
              console.error('Error adding to newsletter:', error);
            } else if (!error) {
              console.log('Newsletter signup successful');

              // Sync to Brevo CRM (non-blocking)
              fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-brevo-contact`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: email,
                  firstName: firstName,
                  lastName: lastName,
                  phone: formattedPhone,
                  source: 'Live Chat',
                  signedUpDate: new Date().toISOString()
                })
              }).catch(err => console.error('Brevo sync error:', err));
            }
          });
      } catch (newsletterError) {
        console.error('Newsletter signup error:', newsletterError);
      }

      setConversationId(conversation.id);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('There was an error starting the chat. Please try again or call us at (401) 595-0726');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hello 👋
          </h2>
          <p className="text-gray-600">
            How can we help? Fill out the form below to chat with us
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(401) 555-0123"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
              Service Needed
            </label>
            <select
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select a service...</option>
              <option value="House Washing">House Washing</option>
              <option value="Roof Cleaning">Roof Cleaning</option>
              <option value="Gutter Cleaning">Gutter Cleaning</option>
              <option value="Concrete Cleaning">Concrete Cleaning</option>
              <option value="Deck Cleaning">Deck Cleaning</option>
              <option value="Holiday Lights Installation">Holiday Lights Installation</option>
              <option value="Commercial Services">Commercial Services</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed">
            You agree to receive text messages at the phone number you provided. Message and data rates may apply.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Starting...' : 'Start Conversation'}
          </button>
        </form>
      </div>
    </div>
  );
}
