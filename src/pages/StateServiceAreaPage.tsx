import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { MapPin, Phone, ArrowRight, Check } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';
import { townsData } from '../data/townsData';
import { holidayLightsTownsData } from '../data/holidayLightsTownsData';
import { countyGroups, stateCopy, stateFAQs } from '../data/stateAreasData';

interface StateServiceAreaPageProps {
  service: 'washing' | 'holiday';
  stateAbbr: 'RI' | 'MA';
}

const stateSlug: Record<string, string> = { RI: 'rhode-island', MA: 'massachusetts' };

export default function StateServiceAreaPage({ service, stateAbbr }: StateServiceAreaPageProps) {
  const copy = stateCopy[stateAbbr];
  const isHoliday = service === 'holiday';
  const basePath = isHoliday ? '/holiday-lights/' : '/towns/';
  const pagePath = basePath + stateSlug[stateAbbr] + '/';
  const source = isHoliday ? holidayLightsTownsData : townsData;
  const towns = source.filter(t => t.stateAbbr === stateAbbr).map(t => ({ name: t.name, slug: t.slug }));
  const assigned: string[] = [];
  const grouped = (countyGroups[stateAbbr] || []).map(g => {
    const list = towns.filter(t => g.slugs.indexOf(t.slug) > -1);
    list.forEach(t => assigned.push(t.slug));
    return { county: g.county, towns: list };
  }).filter(g => g.towns.length > 0);
  const leftovers = towns.filter(t => assigned.indexOf(t.slug) === -1);
  if (leftovers.length > 0) { grouped.push({ county: 'Additional Communities We Serve', towns: leftovers }); }
  const faqs = stateFAQs[service + '-' + stateAbbr] || [];
  const serviceLabel = isHoliday ? 'Christmas Light Installation' : 'Power Washing';
  const otherState = stateAbbr === 'RI' ? 'MA' : 'RI';

  useEffect(() => {
    updatePageMeta({
      title: isHoliday ? copy.holidayTitle : copy.washingTitle,
      description: isHoliday ? copy.holidayDescription : copy.washingDescription,
      canonical: 'https://powerwashjm.com' + pagePath
    });
  }, [copy, isHoliday, pagePath]);

  return (
    <div className='min-h-screen bg-white'>
      <section className='relative text-white py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900'>
        <div className='relative max-w-5xl mx-auto px-4 text-center'>
          <div className='inline-flex items-center justify-center bg-white/10 rounded-full p-4 mb-6'>
            <MapPin className='w-10 h-10' />
          </div>
          <h1 className='text-4xl md:text-5xl font-bold mb-6'>{serviceLabel} in {copy.name}</h1>
          <p className='text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed'>{isHoliday ? copy.holidayIntro : copy.washingIntro}</p>
        </div>
      </section>

      <section className='max-w-5xl mx-auto px-4 py-14'>
        <h2 className='text-3xl font-bold text-slate-900 mb-4'>What {copy.name} Properties Deal With</h2>
        <p className='text-slate-700 leading-relaxed'>{isHoliday ? copy.holidayContext : copy.washingContext}</p>
      </section>

      <section className='bg-slate-50 py-14'>
        <div className='max-w-5xl mx-auto px-4'>
          <h2 className='text-3xl font-bold text-slate-900 mb-4'>{copy.name} Towns We Serve for {serviceLabel}</h2>
          <div className='bg-blue-50 border-l-4 border-blue-600 p-5 rounded mb-8'>
            <p className='text-slate-800'>{copy.coverageNote}</p>
          </div>
          <p className='text-slate-600 mb-10'>We currently cover {towns.length} {copy.name} communities for this service. Every one has its own page with local detail.</p>
          {grouped.map(group => (
            <div key={group.county} className='mb-10'>
              <h3 className='text-xl font-semibold text-slate-900 mb-4'>{group.county}</h3>
              <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {group.towns.map(town => (
                  <li key={town.slug}>
                    <Link to={basePath + town.slug} className='flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-500 hover:shadow transition'>
                      <Check className='w-4 h-4 text-green-600 flex-shrink-0' />
                      <span className='text-slate-800'>{serviceLabel} in {town.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className='max-w-5xl mx-auto px-4 py-14'>
        <h2 className='text-3xl font-bold text-slate-900 mb-6'>Related Service Areas</h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Link to={(isHoliday ? '/towns/' : '/holiday-lights/') + stateSlug[stateAbbr]} className='block border border-slate-200 rounded-lg p-6 hover:border-blue-500 transition'>
            <h3 className='font-semibold text-lg text-slate-900 mb-2'>{isHoliday ? 'Power Washing' : 'Christmas Light Installation'} in {copy.name}</h3>
            <p className='text-slate-600 text-sm'>{isHoliday ? 'Our exterior cleaning coverage in this state, town by town.' : 'Our holiday lighting coverage in this state, town by town.'}</p>
          </Link>
          <Link to={basePath + stateSlug[otherState]} className='block border border-slate-200 rounded-lg p-6 hover:border-blue-500 transition'>
            <h3 className='font-semibold text-lg text-slate-900 mb-2'>{serviceLabel} in {stateCopy[otherState].name}</h3>
            <p className='text-slate-600 text-sm'>See the communities we cover across the state line.</p>
          </Link>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className='bg-slate-50 py-14'>
          <div className='max-w-4xl mx-auto px-4'>
            <h2 className='text-3xl font-bold text-slate-900 mb-8'>{copy.name} {serviceLabel} Questions</h2>
            <div className='space-y-5'>
              {faqs.map(faq => (
                <div key={faq.question} className='bg-white border border-slate-200 rounded-lg p-6'>
                  <h3 className='font-semibold text-lg text-slate-900 mb-2'>{faq.question}</h3>
                  <p className='text-slate-700 leading-relaxed'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className='bg-blue-900 text-white py-14'>
        <div className='max-w-3xl mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-4'>Get a Free {copy.name} Estimate</h2>
          <p className='text-blue-100 mb-8'>Written estimates within 24 hours. We answer 7 AM to 7 PM, seven days a week.</p>
          <div className='flex flex-wrap gap-4 justify-center'>
            <a href='tel:+14015950726' className='inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition'>
              <Phone className='w-5 h-5' /> 401-595-0726
            </a>
            <Link to='/get-quote/' className='inline-flex items-center gap-2 bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition'>
              Request an Estimate <ArrowRight className='w-5 h-5' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

