import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PopupService } from '../../services/popupService';
import type { PopupConfig } from '../../types/popup';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('popup_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('popup_session_id', sessionId);
  }
  return sessionId;
}

export default function PopupRenderer() {
  const [popup, setPopup] = useState<PopupConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sessionId = getSessionId();

    PopupService.shouldDisplayPopup(sessionId).then((config) => {
      if (config) {
        if (PopupService.isPopupDismissed(config.id)) {
          console.log('Popup is currently dismissed, not showing');
          return;
        }

        setPopup(config);
        setIsVisible(true);
        PopupService.trackEvent(config.id, 'view', sessionId);
      }
    });
  }, []);

  const handleClose = () => {
    if (popup) {
      const sessionId = getSessionId();
      PopupService.dismissPopup(popup.id, sessionId, popup.reappear_hours);
      PopupService.trackEvent(popup.id, 'close', sessionId);
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    if (popup) {
      const sessionId = getSessionId();
      PopupService.dismissPopup(popup.id, sessionId, popup.reappear_hours);
      PopupService.trackEvent(popup.id, 'dismiss', sessionId);
    }
    setIsVisible(false);
  };

  const handleButtonClick = () => {
    if (popup) {
      const sessionId = getSessionId();
      PopupService.trackEvent(popup.id, 'click', sessionId);
    }
  };

  if (!isVisible || !popup) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-[1000] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[800px] bg-white rounded-xl shadow-2xl z-[1001] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-10 bg-gray-50 flex flex-col justify-center order-2 md:order-1">
            {popup.subheading && (
              <span className="text-sm font-semibold text-red-600 mb-1">
                {popup.subheading}
              </span>
            )}
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              {popup.title}
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {popup.body}
            </p>
            <div className="space-y-3">
              <a
                href={popup.button_link}
                onClick={handleButtonClick}
                className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {popup.button_text}
              </a>
              {popup.dismissal_text && (
                <button
                  onClick={handleDismiss}
                  className="block w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
                >
                  {popup.dismissal_text}
                </button>
              )}
            </div>
          </div>

          {popup.image_url && (
            <div className="relative h-48 md:h-auto order-1 md:order-2">
              <img
                src={popup.image_url}
                alt={popup.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="hidden md:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-gray-50 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
