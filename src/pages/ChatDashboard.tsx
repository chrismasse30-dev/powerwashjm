import { useState, useEffect } from 'react';
import { MessageSquare, Clock, X, Send, User, Archive, Trash2, Mail, AlertCircle, CheckCircle, Power } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';

interface Conversation {
  id: string;
  customer_name: string;
  customer_phone: string;
  source_url: string;
  status: 'open' | 'closed' | 'archived' | 'deleted';
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_type: 'customer' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
}

export default function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminName, setAdminName] = useState('Support Team');
  const [activeTab, setActiveTab] = useState<'open' | 'archived' | 'deleted'>('open');
  const [notificationStatus, setNotificationStatus] = useState<{[key: string]: 'sent' | 'failed' | 'unknown'}>({});
  const [resendingNotification, setResendingNotification] = useState<string | null>(null);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isTogglingChat, setIsTogglingChat] = useState(false);

  useEffect(() => {
    loadConversations();
    loadChatEnabledStatus();

    const channel = supabase
      .channel('chat-dashboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        () => loadConversations()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedConversation === (payload.new as any).conversation_id) {
            setMessages((prev) => [...prev, newMsg]);
          }
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const loadChatEnabledStatus = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'chat_enabled')
      .maybeSingle();

    if (error) {
      console.error('Error loading chat status:', error);
      return;
    }

    if (data) {
      setChatEnabled(data.setting_value === 'true');
    } else {
      // Default to enabled if setting doesn't exist
      setChatEnabled(true);
    }
  };

  const toggleChatEnabled = async () => {
    setIsTogglingChat(true);
    const newStatus = !chatEnabled;

    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'chat_enabled')
        .maybeSingle();

      if (existing) {
        // Update existing setting
        const { error } = await supabase
          .from('site_settings')
          .update({
            setting_value: String(newStatus),
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'chat_enabled');

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('site_settings')
          .insert({
            setting_key: 'chat_enabled',
            setting_value: String(newStatus),
            description: 'Controls whether live chat button appears on website'
          });

        if (error) throw error;
      }

      setChatEnabled(newStatus);
    } catch (error) {
      console.error('Error toggling chat:', error);
      alert('Failed to toggle chat status');
    } finally {
      setIsTogglingChat(false);
    }
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('last_message_at', { ascending: false});

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);

    if (data) {
      const statuses: {[key: string]: 'sent' | 'failed' | 'unknown'} = {};
      for (const conv of data) {
        const { data: logs } = await supabase
          .from('notification_log')
          .select('status')
          .eq('reference_id', conv.id)
          .eq('notification_type', 'chat_email')
          .order('created_at', { ascending: false })
          .limit(1);

        statuses[conv.id] = logs && logs.length > 0 ? logs[0].status as 'sent' | 'failed' : 'unknown';
      }
      setNotificationStatus(statuses);
    }
  };

  const resendNotification = async (conversationId: string) => {
    setResendingNotification(conversationId);
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { data: firstMessage } = await supabase
        .from('chat_messages')
        .select('message')
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'customer')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      const nameParts = conversation.customer_name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const emailNotificationUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-chat-email-notification`;

      const response = await fetch(emailNotificationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: '',
          phone: conversation.customer_phone,
          service: firstMessage?.message || 'Not specified',
          source: conversation.source_url
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      await supabase.from('notification_log').insert({
        notification_type: 'chat_email',
        reference_id: conversationId,
        recipient_email: 'sales@powerwashjm.com',
        status: 'sent'
      });

      setNotificationStatus(prev => ({ ...prev, [conversationId]: 'sent' }));
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error resending notification:', error);

      await supabase.from('notification_log').insert({
        notification_type: 'chat_email',
        reference_id: conversationId,
        recipient_email: 'sales@powerwashjm.com',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      setNotificationStatus(prev => ({ ...prev, [conversationId]: 'failed' }));
      alert('Failed to send notification. Please try again.');
    } finally {
      setResendingNotification(null);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
    setSelectedConversation(conversationId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const selectedConv = conversations.find(c => c.id === selectedConversation);
    if (!selectedConv) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: selectedConversation,
        sender_type: 'admin',
        sender_name: adminName,
        message: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      return;
    }

    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', selectedConversation);

    setNewMessage('');
  };

  const updateConversationStatus = async (conversationId: string, status: 'open' | 'closed' | 'archived') => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    // Update local state immediately
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, status }
          : conv
      )
    );
  };

  const archiveConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to archive this conversation? You can restore it later.')) {
      return;
    }

    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'archived' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error archiving conversation:', error);
      alert('Failed to archive conversation');
      return;
    }

    // Update local state immediately
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: 'archived' as const }
          : conv
      )
    );

    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? It will be moved to the Deleted tab.')) {
      return;
    }

    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'deleted' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
      return;
    }

    // Update local state immediately
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: 'deleted' as const }
          : conv
      )
    );

    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  const permanentlyDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this conversation? This action cannot be undone and will delete all messages.')) {
      return;
    }

    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      alert('Failed to delete conversation messages');
      return;
    }

    const { error: conversationError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      alert('Failed to delete conversation');
      return;
    }

    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }

    loadConversations();
  };

  const filteredConversations = conversations.filter(c => {
    if (activeTab === 'deleted') return c.status === 'deleted';
    if (activeTab === 'archived') return c.status === 'archived';
    return c.status === 'open' || c.status === 'closed';
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        <ReturnToDashboardButton />

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Dashboard</h1>
              <p className="text-gray-600">Manage customer conversations in real-time</p>
            </div>
            <button
              onClick={toggleChatEnabled}
              disabled={isTogglingChat}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                chatEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={chatEnabled ? 'Click to disable live chat button' : 'Click to enable live chat button'}
            >
              <Power className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm leading-tight">Live Chat</div>
                <div className="text-xs opacity-90">
                  {isTogglingChat ? 'Updating...' : chatEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="border-b bg-gray-50">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'open'
                      ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Open ({conversations.filter(c => c.status === 'open' || c.status === 'closed').length})
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'archived'
                      ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Archived ({conversations.filter(c => c.status === 'archived').length})
                </button>
                <button
                  onClick={() => setActiveTab('deleted')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'deleted'
                      ? 'bg-white text-blue-900 border-b-2 border-blue-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Deleted ({conversations.filter(c => c.status === 'deleted').length})
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No {activeTab} conversations</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-900' : ''
                    }`}
                  >
                    <button
                      onClick={() => loadMessages(conv.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-900">{conv.customer_name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conv.status === 'open' ? 'bg-green-100 text-green-700' :
                          conv.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {conv.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{conv.customer_phone}</p>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(conv.last_message_at).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {notificationStatus[conv.id] === 'sent' && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Email Sent
                            </span>
                          )}
                          {notificationStatus[conv.id] === 'failed' && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              Email Failed
                            </span>
                          )}
                          {notificationStatus[conv.id] === 'unknown' && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              No Email
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="px-4 pb-3 flex gap-2">
                      {activeTab === 'open' && (
                        <>
                          {(notificationStatus[conv.id] === 'failed' || notificationStatus[conv.id] === 'unknown') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resendNotification(conv.id);
                              }}
                              disabled={resendingNotification === conv.id}
                              className="flex items-center gap-1 text-xs px-3 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors disabled:opacity-50"
                              title="Send/Resend email notification"
                            >
                              <Mail className="w-3 h-3" />
                              {resendingNotification === conv.id ? 'Sending...' : 'Send Email'}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveConversation(conv.id);
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                            title="Archive conversation"
                          >
                            <Archive className="w-3 h-3" />
                            Archive
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                            title="Move to deleted"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </>
                      )}
                      {activeTab === 'archived' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateConversationStatus(conv.id, 'open');
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                            title="Restore to open"
                          >
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                            title="Move to deleted"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </>
                      )}
                      {activeTab === 'deleted' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateConversationStatus(conv.id, 'open');
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                            title="Restore to open"
                          >
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              permanentlyDeleteConversation(conv.id);
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                            title="Permanently delete conversation"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Forever
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-3 text-gray-200" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConv.customer_name}</h3>
                    <p className="text-sm text-gray-600">{selectedConv.customer_phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedConv.status !== 'open' && (
                      <button
                        onClick={() => updateConversationStatus(selectedConv.id, 'open')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Reopen
                      </button>
                    )}
                    {selectedConv.status !== 'closed' && (
                      <button
                        onClick={() => updateConversationStatus(selectedConv.id, 'closed')}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'admin'
                            ? 'bg-blue-900 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.sender_type === 'customer' && (
                          <div className="flex items-center gap-1 mb-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <p className="text-xs font-semibold text-gray-600">{msg.sender_name}</p>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_type === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-white">
                  <div className="mb-2">
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
