import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSiteSetting } from '../services/siteSettingsService';

export default function ServiceArea() {
  const [slotsLeft, setSlotsLeft] = useState(9);
  const [showPremiumSlots, setShowPremiumSlots] = useState(true);

  useEffect(() => {
    const baseSlots = 9;
    const dayOfWeek = new Date().getDay();
    const calculatedSlots = Math.max(3, baseSlots - dayOfWeek);
    setSlotsLeft(calculatedSlots);
  }, []);

  useEffect(() => {
    const fetchSetting = async () => {
      const setting = await getSiteSetting('show_premium_slots');
      setShowPremiumSlots(setting === 'true');
    };
    fetchSetting();
  }, []);
  const rhodeIslandTowns = [
    { name: 'Warwick', path: '/towns/warwick-ri/' },
    { name: 'Providence', path: '/towns/providence-ri/' },
    { name: 'Cranston', path: '/towns/cranston-ri/' },
    { name: 'Pawtucket', path: '/towns/pawtucket-ri/' },
    { name: 'Woonsocket', path: '/towns/woonsocket-ri/' },
    { name: 'North Smithfield', path: '/towns/north-smithfield-ri/' },
    { name: 'Smithfield', path: '/towns/smithfield-ri/' },
    { name: 'Cumberland', path: '/towns/cumberland-ri/' },
    { name: 'Lincoln', path: '/towns/lincoln-ri/' },
    { name: 'Central Falls', path: '/towns/central-falls-ri/' },
    { name: 'North Providence', path: '/towns/north-providence-ri/' },
    { name: 'East Providence', path: '/towns/east-providence-ri/' },
    { name: 'West Warwick', path: '/towns/west-warwick-ri/' },
    { name: 'Coventry', path: '/towns/coventry-ri/' },
    { name: 'Johnston', path: '/towns/johnston-ri/' },
    { name: 'Foster', path: '/towns/foster-ri/' },
    { name: 'Glocester', path: '/towns/glocester-ri/' },
    { name: 'Burrillville', path: '/towns/burrillville-ri/' },
    { name: 'Scituate', path: '/towns/scituate-ri/' },
    { name: 'West Greenwich', path: '/towns/west-greenwich-ri/' },
    { name: 'Bristol', path: '/towns/bristol-ri/' },
    { name: 'Barrington', path: '/towns/barrington-ri/' },
    { name: 'East Greenwich', path: '/towns/east-greenwich-ri/' },
    { name: 'Tiverton', path: '/towns/tiverton-ri/' },
    { name: 'North Kingstown', path: '/towns/north-kingstown-ri/' },
  ];

  const massachusettsTowns = [
    { name: 'Attleboro', path: '/towns/attleboro-ma/' },
    { name: 'Franklin', path: '/towns/franklin-ma/' },
    { name: 'Mansfield', path: '/towns/mansfield-ma/' },
    { name: 'Seekonk', path: '/towns/seekonk-ma/' },
    { name: 'North Attleboro', path: '/towns/north-attleboro-ma/' },
    { name: 'Rehoboth', path: '/towns/rehoboth-ma/' },
    { name: 'Norton', path: '/towns/norton-ma/' },
    { name: 'Blackstone', path: '/towns/blackstone-ma/' },
    { name: 'Millville', path: '/towns/millville-ma/' },
    { name: 'Uxbridge', path: '/towns/uxbridge-ma/' },
    { name: 'Douglas', path: '/towns/douglas-ma/' },
    { name: 'Northbridge', path: '/towns/northbridge-ma/' },
    { name: 'Grafton', path: '/towns/grafton-ma/' },
    { name: 'Sutton', path: '/towns/sutton-ma/' },
    { name: 'Millbury', path: '/towns/millbury-ma/' },
    { name: 'Shrewsbury', path: '/towns/shrewsbury-ma/' },
    { name: 'Bellingham', path: '/towns/bellingham-ma/' },
    { name: 'Wrentham', path: '/towns/wrentham-ma/' },
    { name: 'Plainville', path: '/towns/plainville-ma/' },
    { name: 'Foxboro', path: '/towns/foxboro-ma/' },
    { name: 'Swansea', path: '/towns/swansea-ma/' },
  ];

  const displayedRITowns = rhodeIslandTowns.slice(0, 10);
  const displayedMATowns = massachusettsTowns.slice(0, 6);

  return (
    <section id="service-areas" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-6xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          We Serve 46 Rhode Island & Massachusetts Towns
        </h2>
        <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
          Professional soft washing and Christmas light installation, with free estimates in every town we serve.
          {showPremiumSlots && (
            <>
              <br />
              <strong className="text-blue-900">Only {slotsLeft} slots left this week</strong> across all towns.
            </>
          )}
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center gap-3">
              <span>Rhode Island</span>
              <span className="text-4xl text-blue-600">{rhodeIslandTowns.length}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              {displayedRITowns.map((town) => (
                <Link
                  key={town.name}
                  to={town.path}
                  className="hover:text-blue-600 font-medium transition-colors"
                >
                  {town.name}
                </Link>
              ))}
              <Link
                to="/towns/"
                className="text-blue-600 font-bold col-span-2 text-center mt-4 hover:text-blue-700 transition-colors"
              >
                + {rhodeIslandTowns.length - displayedRITowns.length} more Rhode Island towns →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center gap-3">
              <span>Massachusetts</span>
              <span className="text-4xl text-blue-600">{massachusettsTowns.length}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              {displayedMATowns.map((town) => (
                <Link
                  key={town.name}
                  to={town.path}
                  className="hover:text-blue-600 font-medium transition-colors"
                >
                  {town.name}
                </Link>
              ))}
              <Link
                to="/towns/"
                className="text-blue-600 font-bold col-span-2 text-center mt-4 hover:text-blue-700 transition-colors"
              >
                + {massachusettsTowns.length - displayedMATowns.length} more Massachusetts towns →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12">
          {showPremiumSlots && (
            <p className="text-2xl font-bold text-blue-900 mb-4">
              <span className="text-red-600 animate-pulse">Only {slotsLeft} premium slots left this week</span>
            </p>
          )}
          <a
            href="tel:+14015950726"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all"
          >
            Call (401) 595-0726 for a Free Estimate
          </a>
        </div>
      </div>
    </section>
  );
}
