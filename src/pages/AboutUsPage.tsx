import { Check, Phone, Mail, Award, Users, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { updatePageMeta, addStructuredData } from '../utils/seo';
import { supabase } from '../lib/supabase';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

interface FleetPhoto {
  id: string;
  image_url: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export default function AboutUsPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [fleetPhotos, setFleetPhotos] = useState<FleetPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    fetchFleetPhotos();
    updatePageMeta({
      title: 'About J&M Power Washing | Family-Owned RI & MA | Licensed & Insured',
      description: 'Family-owned and operated power washing company serving Rhode Island & Massachusetts since our founding. Licensed, insured, 100% satisfaction guaranteed. Learn about our team, values & commitment to quality.',
      keywords: 'about J & M Power Washing, family-owned power washing, Rhode Island pressure washing company, Massachusetts exterior cleaning, licensed insured power washing, North Smithfield RI, local power washing company',
      ogTitle: 'About J&M Power Washing | Family-Owned & Operated RI & MA',
      ogDescription: 'Meet the family-owned team behind J&M Power Washing. Dedicated to quality, professionalism, and customer satisfaction in every project across RI & MA.',
    });

    const aboutStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About J & M Power Washing',
      description: 'J & M Power Washing is a family-owned and operated company providing professional exterior cleaning services in Rhode Island and Massachusetts since 2018.',
      mainEntity: {
        '@type': 'LocalBusiness',
        name: 'J&M Power Washing & Holiday Lights',
        image: '/logos/logo.png',
        telephone: '+1-401-595-0726',
        email: 'Sales@powerwashjm.com',
        foundingDate: '2018',
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'RI',
          addressCountry: 'US'
        },
        areaServed: ['Rhode Island', 'Massachusetts'],
        priceRange: '$$',
        certification: [
          {
            '@type': 'Certification',
            name: 'Liability Insurance',
            certificationIdentification: 'Comprehensive Coverage',
            certificationRating: {
              '@type': 'Rating',
              bestRating: 'Comprehensive',
              ratingValue: 'Full Coverage'
            }
          }
        ],
        knowsAbout: ['Soft Washing', 'Roof Cleaning', 'Biodegradable Cleaning Solutions', 'Algae Removal', 'Moss Removal', 'House Washing', 'Deck Restoration'],
        slogan: 'Family-owned, 24-hour estimates, fully licensed and insured'
      }
    };

    addStructuredData(aboutStructuredData);
  }, []);

  const fetchFleetPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('fleet_photos')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setFleetPhotos(data || []);
    } catch (error) {
      console.error('Error fetching fleet photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const values = [
    {
      icon: Award,
      title: 'Quality',
      description: 'We use the best equipment and environmentally friendly products to deliver exceptional results.'
    },
    {
      icon: Users,
      title: 'Customer Satisfaction',
      description: 'Your happiness is our priority. We offer a 100% satisfaction guarantee on all our work.'
    },
    {
      icon: Shield,
      title: 'Professionalism',
      description: 'We are a licensed and insured company, and our team is dedicated to providing a seamless and professional experience.'
    },
    {
      icon: TrendingUp,
      title: 'Integrity',
      description: 'As a family-owned business, we believe in honest work and transparent communication with our clients.'
    }
  ];

  const benefits = [
    {
      title: 'Boost Your Curb Appeal',
      description: 'A clean exterior can dramatically improve the look of your home or business.'
    },
    {
      title: 'Increase Property Value',
      description: 'Regular power washing can help maintain and even increase the value of your property.'
    },
    {
      title: 'Protect Your Investment',
      description: 'Our services help to remove harmful mold, mildew, and algae that can damage your property\'s surfaces over time.'
    },
    {
      title: 'Save Time and Effort',
      description: 'Let our team of professionals handle the hard work, so you don\'t have to.'
    }
  ];

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/buildings.PNG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">About J & M Power Washing</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Your Local Exterior Cleaning Experts
          </p>
        </div>
      </section>

      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-properties.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/90"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Get to Know J & M Power Washing</h2>

            <p className="text-gray-800 leading-relaxed mb-6 font-medium">
              J & M Power Washing is a family-owned and operated company that has been a leader in the mobile power washing industry in Rhode Island and Massachusetts for years. We have built our solid reputation by providing our customers with superior quality work, outstanding customer service, and professionalism at a fair price. Our goal is to provide our customers with the highest quality service by anyone in the power washing business.
            </p>

            <p className="text-gray-800 leading-relaxed mb-6 font-medium">
              Our attention to detail, our quest for perfection, and our belief in taking care of our customers set us apart from our competitors. We back each and every job with a 100% satisfaction guarantee to back up our quality work.
            </p>

            <p className="text-gray-800 leading-relaxed mb-6 font-medium">
              J & M Power Washing is licensed and fully insured, unlike many of our part-time competitors. Our soft-wash systems and biodegradable cleaning solutions make us the exterior cleaning company of choice in Rhode Island.
            </p>

            <p className="text-gray-800 leading-relaxed mb-6 font-medium">
              Whether you need your home revitalized or your entire community of condos cleaned, J & M is the right company for the job. We are equipped to handle any job, big or small. Our family-owned and operated team of pressure washing specialists can answer all your questions and concerns about your individual project.
            </p>

            <p className="text-gray-800 leading-relaxed mb-6 font-medium">
              Using our services is an investment that will pay off. Whether it is giving your house a much-needed wash, brightening your concrete, complete deck cleaning, or restoration project, you can be assured the money will be well spent. We can add instant curb appeal to both residential and commercial properties.
            </p>

            <p className="text-gray-800 leading-relaxed mb-8 font-medium">
              Please look around the site at the many services we provide and unbelievable before and after photos. We are confident you will be amazed at the difference J & M Power Washing can make for your home or business.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-4">
              Our Professional Fleet
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fully equipped service vehicles ready to tackle any power washing project, big or small
            </p>
          </div>
          {loadingPhotos ? (
            <div className="flex justify-center mb-8">
              <div className="text-gray-500">Loading fleet photos...</div>
            </div>
          ) : (
            <div className="flex justify-center gap-6 mb-8 flex-wrap">
              {fleetPhotos.map((photo) => (
                <div key={photo.id} className="w-[35%] min-w-[300px] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Fleet photo'}
                    title={photo.description}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Licensed & Insured</h3>
              <p className="text-gray-700">Full commercial insurance and proper licensing</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Professional Equipment</h3>
              <p className="text-gray-700">Top-of-the-line power washing systems</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Ready to Serve</h3>
              <p className="text-gray-700">Multiple trucks for timely service</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/buildings.PNG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-4">
            Why Property Management Loves Us
          </h2>
          <p className="text-xl text-blue-100 text-center mb-16">
            Trusted by property managers and facility directors across Rhode Island and Massachusetts
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-2xl font-bold mb-4">Scheduled Programs</h3>
              <p className="text-blue-100 leading-relaxed">
                Monthly, quarterly, and seasonal maintenance programs with reliable scheduling. No surprises, no missed appointments.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-4">Professional Documentation</h3>
              <p className="text-blue-100 leading-relaxed">
                Complete service logs, insurance certificates, and detailed reports for your records and compliance needs.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-2xl font-bold mb-4">Flexible Scheduling</h3>
              <p className="text-blue-100 leading-relaxed">
                After-hours and weekend service available to minimize disruption to your tenants and business operations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-4">Preventative Savings</h3>
              <p className="text-blue-100 leading-relaxed">
                Regular maintenance prevents costly repairs and extends the life of your building's exterior surfaces.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-4">Multi-Property Experience</h3>
              <p className="text-blue-100 leading-relaxed">
                Managing multiple locations? We can handle all your properties with consistent quality and coordinated scheduling.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold mb-4">Fully Insured & Licensed</h3>
              <p className="text-blue-100 leading-relaxed">
                Comprehensive liability coverage, workers compensation, and all required licensing for your peace of mind and liability protection.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/commercial/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
            >
              View Commercial Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-blue-900 mb-4">
            Our Values
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">What sets us apart from the competition</p>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/hero-properties.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-white/75"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-blue-900 mb-4">
            Benefits of Choosing J & M Power Washing
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">Why customers trust us with their properties</p>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/85 backdrop-blur-sm rounded-xl shadow-md p-8 border border-blue-100">
                <div className="flex items-start space-x-4">
                  <Check className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready for a Cleaner Tomorrow?
          </h2>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Contact us today for a free, no-obligation quote and let us show you the J & M Power Washing difference!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call (401) 595-0726
            </a>
            <Link
              to="/#quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
            >
              Get a Free Quote
            </Link>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="text-2xl font-bold mb-2">Jim Lape and Mike Lape</p>
            <p className="text-blue-200">Owners, J & M Power Washing</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100 text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-6">Have Questions?</h3>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              We're here to help! Get in touch with us for more information about our services or to schedule your free estimate.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="tel:+14015950726"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                (401) 595-0726
              </a>
              <a
                href="mailto:Sales@powerwashjm.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Sales@powerwashjm.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
