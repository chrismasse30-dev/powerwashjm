import { Home, Droplets, Fence, Wind, Trash2, Sparkles, Building2, Shield, Zap, Trees } from 'lucide-react';

export const allServicesData = {
  'house-washing': {
    serviceName: 'House Washing',
    serviceSlug: 'house-washing',
    minPrice: 349,
    maxPrice: 799,
    typicalPrice: '$450-$600',
    priceNote: 'Most homes 2,000-3,500 sq ft',
    guarantee: 'We guarantee your satisfaction or we\'ll return to make it right at no additional charge.',
    metaTitle: 'House Washing Rhode Island – Vinyl & Cedar Siding Cleaning | J&M',
    metaDescription: 'Professional house washing in Warwick, Providence & North Smithfield RI. Soft wash experts. $349-$799. Free quote: (401) 595-0726',
    keywords: 'house washing ri, house washing rhode island, soft washing warwick, vinyl siding cleaning providence, cedar siding cleaning north smithfield',
    heroImage: 'https://powerwashjm.com/housewash.png',
    heroTitle: 'House Washing Rhode Island – Soft Wash Experts',
    heroDescription: 'Professional soft washing for vinyl, cedar, and all siding types. Remove algae, mold, and mildew without damage. Serving Warwick, Providence, North Smithfield & all RI.',
    introText: `Your Rhode Island home's exterior is constantly exposed to harsh weather, humidity, and environmental contaminants. Over time, algae (Gloeocapsa magma), mildew, dirt, and pollen create unsightly stains and can actually damage your siding if left untreated.

Professional soft washing doesn't just clean—it kills organic growth at its root, providing longer-lasting results than pressure washing alone. Our eco-friendly solution is safe for vinyl, cedar, composite, and all siding types common throughout Rhode Island homes.

We serve Warwick, Providence, North Smithfield, Cranston, Pawtucket, Smithfield, Lincoln, Cumberland, Woonsocket, and all surrounding Rhode Island communities. Whether you're near Apponaug Village in Warwick, on College Hill in Providence, or in Slatersville, we have the expertise to restore your home's beauty.`,
    benefitsTitle: 'Why Rhode Island Homeowners Choose Our House Washing',
    benefits: [
      { title: 'Increase Home Value', description: 'Clean exteriors boost curb appeal and property value by up to 10%' },
      { title: 'Extend Siding Life', description: 'Remove damaging contaminants that degrade vinyl and cedar siding' },
      { title: 'Safe Soft Washing', description: 'Low-pressure cleaning that won\'t damage siding, unlike harsh pressure washing' },
      { title: 'Healthier Home', description: 'Eliminate mold, mildew, and allergens from your home\'s exterior' },
      { title: 'Eco-Friendly Products', description: 'Biodegradable solutions safe for landscaping, pets, and family' },
      { title: 'Licensed & Insured', description: 'Fully licensed RI contractor with $2M liability insurance' }
    ],
    processSteps: [
      { step: '1', title: 'Property Inspection', description: 'We assess your siding type and identify problem areas' },
      { step: '2', title: 'Landscape Protection', description: 'We protect plants, close windows, and prep the area' },
      { step: '3', title: 'Soft Wash Application', description: 'Low-pressure cleaning solution kills growth at the root' },
      { step: '4', title: 'Quality Check', description: 'We inspect all surfaces and ensure complete satisfaction' }
    ],
    faqs: [
      {
        question: 'How much does house washing cost in Rhode Island?',
        answer: 'House washing in Rhode Island typically costs $349-$799 for most homes, depending on size, condition, and siding type. Most 2,000-3,500 sq ft homes in Warwick, Providence, and North Smithfield run $450-$600. We provide free, detailed estimates with no obligation. Fully licensed and insured.'
      },
      {
        question: 'Is soft washing safe for vinyl and cedar siding?',
        answer: 'Yes! Soft washing is specifically designed to be safe for all siding types common in Rhode Island homes. Unlike high-pressure washing (which can damage siding and void warranties), soft washing uses low pressure and professional-grade solutions to safely remove algae, mildew, and dirt without causing any harm.'
      },
      {
        question: 'How often should Rhode Island homes be washed?',
        answer: 'We recommend professional house washing once per year for most Rhode Island homes. However, homes with heavy tree coverage, facing north, or near the coast may benefit from washing twice yearly. The high humidity in RI accelerates algae and mildew growth, making regular cleaning essential.'
      }
    ],
    reviews: [
      {
        author: 'Sarah M.',
        location: 'Warwick, RI',
        rating: 5 as const,
        text: 'Our cedar siding looks brand new! J&M was professional, on time, and incredibly thorough. The soft wash method removed years of algae without any damage. Best house washing in Warwick!'
      },
      {
        author: 'Mike R.',
        location: 'Providence, RI',
        rating: 5 as const,
        text: 'Incredible transformation! Our vinyl siding went from green and dingy to sparkling white. They protected all our landscaping on College Hill. Worth every penny!'
      },
      {
        author: 'Jennifer K.',
        location: 'North Smithfield, RI',
        rating: 5 as const,
        text: 'J&M transformed our home in Slatersville! The algae is completely gone. They were careful around our flower beds and the pricing was very reasonable. Highly recommend!'
      }
    ],
    whyChooseText: '',
    icon: <Home className="w-8 h-8" />
  },

  'roof-cleaning': {
    serviceName: 'Roof Cleaning',
    serviceSlug: 'roof-cleaning',
    minPrice: 499,
    maxPrice: 999,
    typicalPrice: '$650-$850',
    priceNote: 'Based on roof size and pitch',
    guarantee: '5-Year Algae-Free Guarantee – if black streaks return within 5 years, we\'ll re-clean your roof at no charge.',
    metaTitle: 'Roof Cleaning Rhode Island – Remove Black Streaks & Algae | J&M',
    metaDescription: 'Professional roof cleaning in Warwick, Providence & North Smithfield RI. Remove algae, moss, black streaks. $499-$999. 5-year guarantee. Call (401) 595-0726',
    keywords: 'roof cleaning ri, roof cleaning rhode island, black streaks removal warwick, algae removal providence, moss removal north smithfield',
    heroImage: 'https://powerwashjm.com/roofcleaning.png',
    heroTitle: 'Roof Cleaning Rhode Island – 5-Year Guarantee',
    heroDescription: 'Safe soft wash roof cleaning removes black streaks, algae, and moss without damaging shingles. Extends roof life 5-10 years. Serving Warwick, Providence, North Smithfield & all RI.',
    introText: `Those black streaks on your Rhode Island roof aren't just ugly—they're Gloeocapsa magma, a type of algae that feeds on the limestone in asphalt shingles. Left untreated, this algae shortens your roof's lifespan, increases energy costs by absorbing heat, and tanks your home's curb appeal.

High-pressure washing strips protective granules, voids warranties, and causes immediate damage. Our soft wash system uses specialized biodegradable solutions applied at low pressure (like a garden hose) to kill algae, moss, and lichen at the root—without any risk to your shingles.

We serve all Rhode Island communities including Warwick, Providence, North Smithfield, Cranston, Pawtucket, Smithfield, Lincoln, Cumberland, and Woonsocket. Our exclusive 5-year guarantee means if black streaks return within 5 years, we'll re-clean your roof free of charge—no questions asked.`,
    benefitsTitle: 'Why Rhode Island Homeowners Trust Our Roof Cleaning',
    benefits: [
      { title: '5-Year Guarantee', description: 'Industry-leading warranty—black streaks stay gone or we return free' },
      { title: 'Extend Roof Life', description: 'Professional cleaning extends shingle life by 5-10 years' },
      { title: 'Safe Soft Washing', description: 'Low-pressure method won\'t damage shingles or void warranties' },
      { title: 'Lower Energy Bills', description: 'Remove heat-absorbing algae to reduce cooling costs' },
      { title: 'Increase Home Value', description: 'Clean roofs boost curb appeal and property value significantly' },
      { title: 'Licensed Professionals', description: 'Fully insured with $2M liability—your roof is protected' }
    ],
    processSteps: [
      { step: '1', title: 'Roof Inspection', description: 'We assess shingle type, algae extent, and problem areas' },
      { step: '2', title: 'Property Protection', description: 'We protect gutters, landscaping, and surrounding areas' },
      { step: '3', title: 'Soft Wash Treatment', description: 'Biodegradable solution kills algae at the root' },
      { step: '4', title: 'Gentle Rinse', description: 'Low-pressure rinse reveals clean, undamaged shingles' }
    ],
    faqs: [
      {
        question: 'How much does roof cleaning cost in Rhode Island?',
        answer: 'Roof cleaning in Rhode Island costs $499-$999 depending on roof size, pitch, and condition. Most homes in Warwick, Providence, and North Smithfield run $650-$850. We provide free estimates and include our exclusive 5-year algae-free guarantee. Licensed, insured, and experienced with all RI roof types.'
      },
      {
        question: 'Will roof cleaning damage my shingles or void my warranty?',
        answer: 'No! We only use soft washing (ARMA-approved low-pressure method). High-pressure washing strips granules and voids warranties—we NEVER use high pressure. Our biodegradable solution is manufacturer-approved and won\'t damage shingles. Many roofing warranties actually require periodic cleaning.'
      },
      {
        question: 'How long do results last in Rhode Island\'s humid climate?',
        answer: 'With our soft wash treatment, most Rhode Island roofs stay clean for 3-5+ years. That\'s why we confidently offer a 5-year guarantee. The humid RI climate does accelerate algae growth, but our treatment kills growth at the root for long-lasting results. We serve Warwick, Providence, North Smithfield, and all surrounding areas.'
      }
    ],
    reviews: [
      {
        author: 'Tom D.',
        location: 'Warwick, RI',
        rating: 5 as const,
        text: 'Our roof near Apponaug had terrible black streaks. J&M\'s soft wash made it look brand new! They were careful not to damage shingles and the 5-year guarantee sealed the deal. Best roof cleaning in Warwick!'
      },
      {
        author: 'Lisa P.',
        location: 'Providence, RI',
        rating: 5 as const,
        text: 'Professional roof cleaning on our East Side home. They removed all moss and algae without voiding our warranty. Communication was excellent. Highly recommend for Providence area!'
      },
      {
        author: 'David H.',
        location: 'North Smithfield, RI',
        rating: 5 as const,
        text: 'J&M saved us from a $15,000 roof replacement! The cleaning extended our roof life by years. Results are incredible. Slatersville neighbors keep asking who did our roof!'
      }
    ],
    whyChooseText: '',
    icon: <Shield className="w-8 h-8" />
  },

  'gutter-cleaning': {
    serviceName: 'Gutter Cleaning',
    serviceSlug: 'gutter-cleaning',
    minPrice: 149,
    maxPrice: 399,
    typicalPrice: '$200-$300',
    priceNote: 'Includes interior debris removal & exterior brightening',
    addOns: [
      { name: 'Gutter Guard Installation', price: 'Custom quote' },
      { name: 'Downspout Extensions', price: '$25-$50 each' }
    ],
    metaTitle: 'Gutter Cleaning Rhode Island – Interior & Exterior Service | J&M',
    metaDescription: 'Full gutter cleaning in Warwick, Providence & North Smithfield RI. Interior + exterior brightening. $149-$399. Prevent water damage. Call (401) 595-0726',
    keywords: 'gutter cleaning ri, gutter cleaning rhode island, gutter brightening warwick, tiger stripes removal providence, gutter cleaning north smithfield',
    heroImage: 'https://powerwashjm.com/Gutter.png',
    heroTitle: 'Gutter Cleaning Rhode Island – Full Service',
    heroDescription: 'Complete interior debris removal PLUS exterior gutter brightening to remove tiger stripes. Protect your Rhode Island home from water damage. Serving Warwick, Providence, North Smithfield & all RI.',
    introText: `Clogged gutters are one of the most common causes of expensive home damage in Rhode Island. When gutters overflow, water damages foundations ($10,000+ repairs), floods basements, rots fascia and soffits, and destroys landscaping. A single heavy rainstorm can cause thousands in damage.

Unlike competitors who only remove debris, we provide FULL-SERVICE gutter cleaning: interior debris removal + downspout flushing + exterior gutter brightening to remove ugly tiger stripes and oxidation stains. Your gutters will be clean inside AND out.

We serve Warwick, Providence, North Smithfield, Cranston, Pawtucket, Smithfield, Lincoln, Cumberland, Woonsocket, and all Rhode Island communities. We recommend twice-yearly cleaning (spring and fall) for optimal protection, especially with Rhode Island's heavy tree coverage and seasonal weather changes.`,
    benefitsTitle: 'Why Rhode Island Homeowners Choose Our Gutter Service',
    benefits: [
      { title: 'Full Service', description: 'Interior debris removal + exterior brightening—not just debris removal' },
      { title: 'Prevent Water Damage', description: 'Protect foundations, basements, and landscaping from overflow damage' },
      { title: 'Remove Tiger Stripes', description: 'Specialized cleaning removes ugly black streaks from gutter exteriors' },
      { title: 'Debris Removal', description: 'We bag and haul away all debris—no mess left on your property' },
      { title: 'Downspout Flushing', description: 'Ensure water flows freely through entire gutter system' },
      { title: 'Licensed & Insured', description: 'Fully licensed RI contractor with $2M liability insurance' }
    ],
    processSteps: [
      { step: '1', title: 'System Inspection', description: 'We check gutters, downspouts, and identify problems' },
      { step: '2', title: 'Debris Removal', description: 'Remove all leaves, debris, and buildup from gutters' },
      { step: '3', title: 'Downspout Flush', description: 'Flush all downspouts to ensure proper water flow' },
      { step: '4', title: 'Exterior Brightening', description: 'Clean exterior to remove tiger stripes and stains' }
    ],
    faqs: [
      {
        question: 'How much does gutter cleaning cost in Rhode Island?',
        answer: 'Full-service gutter cleaning in Rhode Island costs $149-$399 depending on home size and gutter condition. Most homes in Warwick, Providence, and North Smithfield run $200-$300. This includes interior debris removal, downspout flushing, AND exterior brightening. Free estimates. Licensed and insured.'
      },
      {
        question: 'Do you clean the inside AND outside of gutters?',
        answer: 'Yes! We provide COMPLETE full-service gutter cleaning. This includes removing all debris from inside gutters, flushing downspouts, AND cleaning the exterior to remove tiger stripes, stains, and oxidation. You get functional protection plus beautiful appearance. Many competitors only remove debris—we do it all.'
      },
      {
        question: 'How often should Rhode Island gutters be cleaned?',
        answer: 'We recommend gutter cleaning twice per year for Rhode Island homes—once in late spring after trees bloom, and once in late fall after leaves drop. Homes with heavy oak, pine, or maple coverage may need cleaning 3-4 times yearly. Regular cleaning prevents expensive foundation, basement, and water damage.'
      }
    ],
    reviews: [
      {
        author: 'Nancy T.',
        location: 'Warwick, RI',
        rating: 5 as const,
        text: 'J&M provides complete gutter service in Warwick - inside and outside! They removed all debris, flushed downspouts, and the exterior brightening made our white gutters look brand new. Highly recommend!'
      },
      {
        author: 'Bill R.',
        location: 'Providence, RI',
        rating: 5 as const,
        text: 'Best gutter cleaning in Providence! They cleaned out years of leaves and those ugly tiger streaks are completely gone. Professional service on our East Side home. Will use them every season!'
      },
      {
        author: 'Donna K.',
        location: 'North Smithfield, RI',
        rating: 5 as const,
        text: 'Fast, thorough, professional gutter cleaning in Slatersville. They cleaned inside and out, removed all debris, and my gutters flow perfectly. Fair pricing and excellent results!'
      }
    ],
    whyChooseText: '',
    icon: <Trash2 className="w-8 h-8" />
  }
};

export type ServiceKey = keyof typeof allServicesData;
