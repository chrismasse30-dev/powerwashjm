import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ChristmasCountdown() {
  const [daysUntilChristmas, setDaysUntilChristmas] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateDaysUntilChristmas = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const christmasEve = new Date(2025, 11, 24);

      const timeDiff = christmasEve.getTime() - now.getTime();
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      setDaysUntilChristmas(days > 0 ? days : 0);
    };

    calculateDaysUntilChristmas();
    const interval = setInterval(calculateDaysUntilChristmas, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || daysUntilChristmas === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close countdown"
        >
          <X className="w-3 h-3 text-gray-600" />
        </button>

        <div className="relative w-32 rounded-xl overflow-hidden shadow-2xl border-2 border-red-600">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url(/rihouselightswithlogo.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(8px)',
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 via-green-900/90 to-red-900/90" />

          <div className="relative px-3 py-4">
            <div className="text-center mb-2">
              <p className="text-yellow-300 text-xs font-semibold drop-shadow-lg">
                Santa's Arrival Countdown
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl" />

              <div className="relative bg-gradient-to-br from-green-700 to-green-900 rounded-xl p-3 border-2 border-yellow-400 shadow-xl">
                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-yellow-400 animate-pulse" />
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-red-600 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-green-600 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-yellow-400 animate-pulse" style={{ animationDelay: '1.5s' }} />

                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1 drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {daysUntilChristmas}
                  </div>
                  <div className="text-yellow-300 font-bold text-xs uppercase tracking-wider drop-shadow-lg">
                    Days
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-2">
              <p className="text-white text-[10px] font-semibold drop-shadow-lg">
                Until Christmas Eve
              </p>
            </div>

            <div className="absolute top-2 left-2 text-xl animate-bounce" style={{ animationDuration: '2s' }}>
              ❄️
            </div>
            <div className="absolute top-3 right-3 text-lg animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              ⭐
            </div>
            <div className="absolute bottom-3 right-2 text-lg animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '1s' }}>
              🎄
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
            <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
