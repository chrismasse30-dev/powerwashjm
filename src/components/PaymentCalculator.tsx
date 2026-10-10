import { useState, useEffect, useCallback, useRef } from 'react';
import { DollarSign, Calendar, Loader2 } from 'lucide-react';

export default function PaymentCalculator() {
  const [purchaseAmount, setPurchaseAmount] = useState(2500);
  const [inputValue, setInputValue] = useState('2500');
  const [termMonths, setTermMonths] = useState(12);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const aprRates = {
    3: 0.00,
    6: 0.059,
    12: 0.069,
    24: 0.089,
    36: 0.099,
  };

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      calculatePayment();
      setIsCalculating(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [purchaseAmount, termMonths]);

  const calculatePayment = useCallback(() => {
    const apr = aprRates[termMonths as keyof typeof aprRates];
    if (apr === undefined) return;

    const monthlyRate = apr / 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(purchaseAmount / termMonths);
      setTotalInterest(0);
    } else {
      const payment = purchaseAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                     (Math.pow(1 + monthlyRate, termMonths) - 1);
      setMonthlyPayment(payment);
      const totalPaid = payment * termMonths;
      setTotalInterest(totalPaid - purchaseAmount);
    }
  }, [purchaseAmount, termMonths]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const numValue = parseInt(value) || 0;
      if (numValue >= 500 && numValue <= 25000) {
        setPurchaseAmount(numValue);
      } else if (numValue > 25000) {
        setPurchaseAmount(25000);
        setInputValue('25000');
      } else if (numValue < 500 && value !== '') {
        setPurchaseAmount(500);
        setInputValue('500');
      }
    }, 300);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setPurchaseAmount(value);
    setInputValue(value.toString());
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-900 mb-2">Payment Calculator</h3>
        <p className="text-gray-600">Estimate your monthly payments</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-900">Purchase Amount</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900 text-xl font-bold">$</span>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="w-32 pl-7 pr-3 py-2 text-xl font-bold text-blue-900 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-right"
                placeholder="2500"
              />
            </div>
          </label>
          <input
            type="range"
            min="500"
            max="25000"
            step="100"
            value={purchaseAmount}
            onChange={handleSliderChange}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setPurchaseAmount(Math.max(500, purchaseAmount - 100));
                setInputValue(String(Math.max(500, purchaseAmount - 100)));
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                setPurchaseAmount(Math.min(25000, purchaseAmount + 100));
                setInputValue(String(Math.min(25000, purchaseAmount + 100)));
              }
            }}
            className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer slider"
            aria-label="Purchase amount"
            aria-valuemin={500}
            aria-valuemax={25000}
            aria-valuenow={purchaseAmount}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>$500</span>
            <span>$25,000</span>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-900">Term Length</span>
            <span className="text-2xl font-bold text-blue-900">{termMonths} months</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[3, 6, 12, 24, 36].map((term) => (
              <button
                key={term}
                onClick={() => setTermMonths(term)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 ${
                  termMonths === term
                    ? 'bg-blue-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`${term} months term`}
                aria-pressed={termMonths === term}
              >
                {term}mo
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-blue-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-900" />
              <span className="text-gray-700 font-medium">Monthly Payment</span>
            </div>
            <span className="text-3xl font-bold text-blue-900 flex items-center gap-2">
              {isCalculating && <Loader2 className="w-5 h-5 animate-spin" />}
              {formatCurrency(monthlyPayment)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-900" />
              <span className="text-gray-700 font-medium">Total Interest</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalInterest)}</span>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">APR Rate</span>
              <span className="font-semibold text-gray-900">
                {((aprRates[termMonths as keyof typeof aprRates] ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900">Terms:</p>
          <ul className="space-y-1 pl-4">
            <li>• Financing from $500 - $25,000*</li>
            <li>• APRs from 0% to 35.9%*</li>
            <li>• Terms from 3 to 60 months*</li>
            <li>• No penalties, late fees, or compounding interest</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <a
            href="https://wisetack.us/#/jtrankz/5fbf7c8f8932/5ce28c2b"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.currentTarget.style.opacity = '0.7';
              setTimeout(() => {
                e.currentTarget.style.opacity = '1';
              }, 1000);
            }}
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Prequalify Instantly!
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1e3a8a;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1e3a8a;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: none;
          transition: transform 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
