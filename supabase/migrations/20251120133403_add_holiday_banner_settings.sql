/*
  # Add Holiday Banner Settings

  1. Purpose
    - Add banner management settings to site_settings table
    - Allow website team to control banner visibility, text, colors, and active dates
    - Integrate with existing site_settings system

  2. New Settings
    - `banner_enabled` - Master switch to show/hide banner
    - `banner_text` - The message displayed in the banner
    - `banner_link_text` - Text for the CTA button/link
    - `banner_link_url` - URL the banner links to
    - `banner_bg_color` - Background color (gradient from/via/to or solid)
    - `banner_text_color` - Text color for banner content
    - `banner_start_date` - When banner should start showing
    - `banner_end_date` - When banner should stop showing

  3. Security
    - Uses existing RLS policies from site_settings table
    - Only authenticated users can modify banner settings
*/

-- Insert holiday banner settings
INSERT INTO site_settings (setting_key, setting_value, description, updated_by)
VALUES 
  (
    'banner_enabled',
    'true',
    'Master toggle to enable/disable the seasonal banner across the website.',
    'system'
  ),
  (
    'banner_text',
    '🎄 Holiday Light Installations Booking Now! Limited December Spots Available',
    'The main text message displayed in the banner.',
    'system'
  ),
  (
    'banner_link_text',
    'Book Today →',
    'The clickable link text (call-to-action) in the banner.',
    'system'
  ),
  (
    'banner_link_url',
    '/holiday-lights',
    'The URL the banner links to (can be relative or absolute).',
    'system'
  ),
  (
    'banner_bg_color',
    'from-red-600 via-green-600 to-red-600',
    'Background color using Tailwind gradient classes (e.g., "from-red-600 via-green-600 to-red-600") or solid color (e.g., "bg-blue-600").',
    'system'
  ),
  (
    'banner_text_color',
    'text-white',
    'Text color for banner content using Tailwind classes (e.g., "text-white", "text-gray-900").',
    'system'
  ),
  (
    'banner_start_date',
    '2025-11-01',
    'Date when banner should start showing (YYYY-MM-DD format). Leave empty for always show.',
    'system'
  ),
  (
    'banner_end_date',
    '2025-12-31',
    'Date when banner should stop showing (YYYY-MM-DD format). Leave empty for no end date.',
    'system'
  )
ON CONFLICT (setting_key) DO NOTHING;
