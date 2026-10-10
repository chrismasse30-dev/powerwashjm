export interface PopupConfig {
  id: string;
  enabled: boolean;
  subheading?: string;
  title: string;
  body: string;
  image_url?: string;
  button_text: string;
  button_link: string;
  dismissal_text?: string;
  start_date?: string;
  end_date?: string;
  reappear_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface PopupPreset {
  id: string;
  name: string;
  subheading?: string;
  title: string;
  body: string;
  image_url?: string;
  button_text: string;
  button_link: string;
  dismissal_text?: string;
  start_date?: string;
  end_date?: string;
  reappear_hours: number;
  created_at: string;
  created_by: string;
  tags: string[];
}

export interface PopupFormData {
  enabled: boolean;
  subheading: string;
  title: string;
  body: string;
  image_url: string;
  button_text: string;
  button_link: string;
  dismissal_text: string;
  start_date: string;
  end_date: string;
  reappear_hours: number;
}

export interface PopupPresetFormData {
  name: string;
  subheading: string;
  title: string;
  body: string;
  image_url: string;
  button_text: string;
  button_link: string;
  dismissal_text: string;
  start_date: string;
  end_date: string;
  reappear_hours: number;
  tags: string[];
}

export interface PopupAnalyticsEvent {
  id: string;
  popup_config_id: string;
  event_type: 'view' | 'click' | 'close';
  user_ip?: string;
  user_agent?: string;
  session_id: string;
  created_at: string;
}

export interface PopupDismissal {
  id: string;
  popup_config_id: string;
  session_id: string;
  dismissed_at: string;
}
