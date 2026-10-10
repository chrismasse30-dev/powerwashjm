import { useRef, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AutoSaveOptions {
  delay?: number;
  onSave?: (id: string) => void;
  onError?: (error: any) => void;
}

export function useFormAutoSave(
  formData: any,
  sessionId: string,
  submitEmail: string,
  pageSource: string,
  ipData: { city: string; state: string },
  draftId: string | null,
  setDraftId: (id: string | null) => void,
  options: AutoSaveOptions = {}
) {
  const { delay = 3000, onSave, onError } = options;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveDraft = async (data: typeof formData) => {
    if (!data.name && !data.phone && !data.email && !data.address) {
      return;
    }

    setIsSaving(true);
    try {
      const sourcePath = pageSource || window.location.pathname;
      const sourceLabel = sourcePath === '/' ? 'Homepage' : sourcePath;

      const draftData: any = {
        name: data.name || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zipCode || null,
        services: data.services.length > 0 ? data.services : [],
        property_type: data.propertyType || null,
        package: data.package || null,
        submit_email: submitEmail,
        page_source: sourceLabel,
        session_id: sessionId,
        status: 'draft',
        is_submitted: false
      };

      if (ipData.city) {
        draftData.ip_city = ipData.city;
      }
      if (ipData.state) {
        draftData.ip_state = ipData.state;
      }

      if (draftId) {
        const { error } = await supabase
          .from('quote_submissions')
          .update(draftData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        const { data: newDraft, error } = await supabase
          .from('quote_submissions')
          .insert([draftData])
          .select()
          .maybeSingle();

        if (error) throw error;
        if (newDraft) {
          setDraftId(newDraft.id);
          if (onSave) onSave(newDraft.id);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      if (onError) onError(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(formData);
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData]);

  return { saveDraft, isSaving };
}
