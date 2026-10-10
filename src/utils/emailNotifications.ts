const EMAIL_NOTIFICATION_KEY = 'emailNotificationsEnabled';
const EMAIL_DISABLE_TIMESTAMP_KEY = 'emailNotificationsDisabledAt';

export function areEmailNotificationsEnabled(): boolean {
  const enabled = localStorage.getItem(EMAIL_NOTIFICATION_KEY);
  const disabledAt = localStorage.getItem(EMAIL_DISABLE_TIMESTAMP_KEY);

  if (enabled === 'false' && disabledAt) {
    const disabledTime = parseInt(disabledAt, 10);
    const oneHour = 60 * 60 * 1000;
    const elapsed = Date.now() - disabledTime;

    if (elapsed < oneHour) {
      return false;
    } else {
      // Auto re-enable after 1 hour
      localStorage.setItem(EMAIL_NOTIFICATION_KEY, 'true');
      localStorage.removeItem(EMAIL_DISABLE_TIMESTAMP_KEY);
      return true;
    }
  }

  return enabled !== 'false';
}
