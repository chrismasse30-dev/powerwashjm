import { supabase } from '../lib/supabase';

interface EmailTemplateParams {
  BUSINESS_NAME?: string;
  CLIENT_NAME?: string;
  FIRST_NAME?: string;
  LAST_NAME?: string;
  TOTAL_QUOTE?: string;
  ROUNDED_AMOUNT?: string;
  MONTHLY_PAYMENT?: string;
  [key: string]: string | undefined;
}

export interface EmailTemplate {
  id: string;
  name: string;
  template_type: 'residential' | 'commercial' | 'form_confirmation' | 'estimate_followup' | 'instant_quote_confirmation' | 'holiday_form_confirmation';
  html_content: string;
  subject: string;
  text_content: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch active email template by type
 */
export async function getActiveTemplate(type: 'residential' | 'commercial' | 'form_confirmation' | 'estimate_followup' | 'instant_quote_confirmation' | 'holiday_form_confirmation'): Promise<EmailTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', type)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${type} template:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Unexpected error fetching ${type} template:`, err);
    return null;
  }
}

/**
 * Fetch all templates of a specific type
 */
export async function getTemplatesByType(type: 'residential' | 'commercial' | 'form_confirmation' | 'estimate_followup' | 'instant_quote_confirmation' | 'holiday_form_confirmation'): Promise<EmailTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${type} templates:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`Unexpected error fetching ${type} templates:`, err);
    return [];
  }
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(template: string, params: EmailTemplateParams): string {
  let result = template;

  // Handle conditional project notes section
  const hasProjectNotes = params.PROJECT_NOTES && params.PROJECT_NOTES.trim().length > 0;
  if (!hasProjectNotes) {
    // Remove entire project notes section if no notes
    const projectNotesRegex = /<div[^>]*PROJECT_NOTES_DISPLAY[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    result = result.replace(projectNotesRegex, '');
  } else {
    // Show the section by removing the display conditional
    result = result.replace(/PROJECT_NOTES_DISPLAY/g, 'block');
  }

  // Handle conditional photo sections
  const hasPhoto1 = params.PHOTO_1_URL && params.PHOTO_1_URL.length > 0;
  const hasPhoto2 = params.PHOTO_2_URL && params.PHOTO_2_URL.length > 0;
  const hasAnyPhotos = hasPhoto1 || hasPhoto2;

  // Replace photo section markers
  if (hasAnyPhotos) {
    result = result.replace(/\{\{PHOTO_SECTION_START\}\}/g, '');
    result = result.replace(/\{\{PHOTO_SECTION_END\}\}/g, '');

    // Replace individual photo sections with email-safe centered tables
    if (hasPhoto1) {
      const photo1Html = `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
          <tr>
            <td>
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #2c3e50;">Design Photo 1</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${params.PHOTO_1_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                <img src="${params.PHOTO_1_URL}"
                     alt="Holiday Lighting Design Photo 1"
                     width="590"
                     style="display: block; width: 100%; max-width: 590px; height: auto; border: 0; border-radius: 8px; margin: 0 auto; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
              </a>
            </td>
          </tr>
        </table>`;
      result = result.replace(/\{\{PHOTO_1_SECTION\}\}/g, photo1Html);
    } else {
      result = result.replace(/\{\{PHOTO_1_SECTION\}\}/g, '');
    }

    if (hasPhoto2) {
      const photo2Html = `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
          <tr>
            <td>
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #2c3e50;">Design Photo 2</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${params.PHOTO_2_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                <img src="${params.PHOTO_2_URL}"
                     alt="Holiday Lighting Design Photo 2"
                     width="590"
                     style="display: block; width: 100%; max-width: 590px; height: auto; border: 0; border-radius: 8px; margin: 0 auto; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
              </a>
            </td>
          </tr>
        </table>`;
      result = result.replace(/\{\{PHOTO_2_SECTION\}\}/g, photo2Html);
    } else {
      result = result.replace(/\{\{PHOTO_2_SECTION\}\}/g, '');
    }
  } else {
    // Remove entire photo section if no photos
    const photoSectionRegex = /\{\{PHOTO_SECTION_START\}\}[\s\S]*?\{\{PHOTO_SECTION_END\}\}/g;
    result = result.replace(photoSectionRegex, '');
  }

  // Replace all other template variables
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, value);
    }
  });

  return result;
}

/**
 * Generate subject line from template
 */
export function generateSubject(subjectTemplate: string, params: EmailTemplateParams): string {
  return replaceTemplateVariables(subjectTemplate, params);
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  templateName: string,
  htmlContent: string,
  subject?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      html_content: htmlContent,
      updated_at: new Date().toISOString()
    };

    if (subject) {
      updateData.subject = subject;
    }

    const { error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('name', templateName);

    if (error) {
      console.error('Error updating template:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error updating template:', err);
    return { success: false, error: String(err) };
  }
}


/**
 * Get all templates (for admin/management views)
 */
export async function getAllTemplates(): Promise<EmailTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_type', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all templates:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching all templates:', err);
    return [];
  }
}

/**
 * Toggle template active status
 */
export async function toggleTemplateActive(
  templateName: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('email_templates')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('name', templateName);

    if (error) {
      console.error('Error toggling template active status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error toggling template:', err);
    return { success: false, error: String(err) };
  }
}
