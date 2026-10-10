import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes to prerender with actual React content
const routes = [
  '/',
  '/house-washing',
  '/holiday-lights',
  '/roof-cleaning',
  '/deck-cleaning',
  '/concrete-cleaning',
  '/gutter-cleaning',
  '/commercial',
  '/commercial/fleet-washing',
  '/commercial/maintenance-programs',
  '/hoa-condo-cleaning',
  '/commercial/maintenance-programs/monthly-maintenance',
  '/commercial/maintenance-programs/quarterly-maintenance',
  '/commercial/maintenance-programs/seasonal-maintenance',
  '/financing',
  '/faq',
  '/customer-portal',
  '/privacy-policy',
  '/satisfaction-guarantee',
  '/blog',
  '/about-us',
  '/towns',
  '/get-quote',
  '/instant-estimate',
  '/sitemap',
  '/towns/warwick-ri',
  '/towns/cranston-ri',
  '/towns/providence-ri',
  '/towns/pawtucket-ri',
  '/towns/woonsocket-ri',
  '/towns/north-smithfield-ri',
  '/towns/cumberland-ri',
  '/towns/lincoln-ri',
  '/towns/smithfield-ri',
  '/towns/attleboro-ma',
  '/towns/franklin-ma',
  '/towns/mansfield-ma',
  '/towns/north-attleboro-ma',
  '/towns/south-attleboro-ma',
  '/towns/seekonk-ma',
  '/towns/east-providence-ri',
  '/towns/johnston-ri',
  '/towns/north-providence-ri',
  '/towns/coventry-ri',
  '/towns/west-warwick-ri',
  '/towns/bristol-ri',
  '/towns/barrington-ri',
  '/towns/east-greenwich-ri',
  '/towns/tiverton-ri',
  '/towns/north-kingstown-ri',
  '/towns/scituate-ri',
  '/towns/glocester-ri',
  '/towns/west-greenwich-ri',
  '/towns/foster-ri',
  '/towns/burrillville-ri',
  '/towns/central-falls-ri',
  '/towns/rehoboth-ma',
  '/towns/norton-ma',
  '/towns/blackstone-ma',
  '/towns/millville-ma',
  '/towns/uxbridge-ma',
  '/towns/douglas-ma',
  '/towns/northbridge-ma',
  '/towns/grafton-ma',
  '/towns/sutton-ma',
  '/towns/millbury-ma',
  '/towns/shrewsbury-ma',
  '/towns/bellingham-ma',
  '/towns/wrentham-ma',
  '/towns/plainville-ma',
  '/towns/foxboro-ma',
  '/towns/swansea-ma'
];

// Holiday Lights town pages: parse slugs + meta from the TypeScript data file
// so every /holiday-lights/<town> page gets a self-referencing canonical and
// unique meta. Without this, these URLs are served the SPA shell whose
// canonical points at the homepage, and Google refuses to index them
// ("Alternate page with proper canonical tag").
const holidayTownsSource = fs.readFileSync(
  path.resolve(__dirname, 'src/data/holidayLightsTownsData.ts'),
  'utf-8'
);

function extractTownField(block, field) {
  const m = block.match(new RegExp(field + ':\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"'));
  return m ? m[1].replace(/\\"/g, '"') : '';
}

const holidayLightsTowns = holidayTownsSource
  .split(/\bslug:/)
  .slice(1)
  .map(chunk => {
    const block = 'slug:' + chunk;
    return {
      slug: extractTownField(block, 'slug'),
      name: extractTownField(block, 'name'),
      stateAbbr: extractTownField(block, 'stateAbbr'),
      metaTitle: extractTownField(block, 'metaTitle'),
      metaDescription: extractTownField(block, 'metaDescription'),
      description: extractTownField(block, 'description'),
      seoContent: extractTownField(block, 'seoContent'),
    };
  })
  .filter(t => t.slug && t.name && t.metaTitle);

console.log(`Found ${holidayLightsTowns.length} holiday lights town pages to prerender`);

for (const town of holidayLightsTowns) {
  routes.push(`/holiday-lights/${town.slug}`);
}

// Power washing town pages: parse from townsData.ts for rich pre-rendered content
const townsSource = fs.readFileSync(
  path.resolve(__dirname, 'src/data/townsData.ts'),
  'utf-8'
);

const powerWashTowns = townsSource
  .split(/\bslug:/)
  .slice(1)
  .map(chunk => {
    const block = 'slug:' + chunk;
    return {
      slug: extractTownField(block, 'slug'),
      name: extractTownField(block, 'name'),
      state: extractTownField(block, 'state'),
      stateAbbr: extractTownField(block, 'stateAbbr'),
      zipCode: extractTownField(block, 'zipCode'),
      metaTitle: extractTownField(block, 'metaTitle'),
      metaDescription: extractTownField(block, 'metaDescription'),
      description: extractTownField(block, 'description'),
      seoContent: extractTownField(block, 'seoContent'),
      keywords: extractTownField(block, 'keywords'),
    };
  })
  .filter(t => t.slug && t.name && t.metaTitle);

console.log(`Found ${powerWashTowns.length} power washing town pages to prerender`);

// Read the base HTML template
const templatePath = path.resolve(__dirname, 'dist/index.html');
const template = fs.readFileSync(templatePath, 'utf-8');

console.log('🚀 Starting React SSR pre-rendering...\n');

// Import the App component dynamically
let App;
try {
  // Try to import the built client bundle to get App component
  // This is a simplified approach - in production you'd use a proper SSR setup
  console.log('⚠️  Note: Using template-based pre-rendering (simplified approach)');
  console.log('   For full SSR, consider migrating to Next.js or Remix\n');
} catch (err) {
  console.log('Using template-based approach');
}

// Enhanced meta data for each route
const routeMetaData = {
  '/towns': {
    title: 'Power Washing & Holiday Lighting Service Areas in RI & MA | J & M Power Washing',
    description: 'J & M Power Washing serves 46 towns across Rhode Island and southeastern Massachusetts with house washing, roof cleaning, gutter cleaning, deck restoration and holiday light installation.',
    content: '<header><h1>Power Washing and Holiday Lighting Service Areas in Rhode Island and Massachusetts</h1></header><main><section><h2>Find Professional Exterior Cleaning in Your Town</h2><p>J & M Power Washing is a family-owned exterior cleaning company based in Johnston, Rhode Island. We provide house washing, roof cleaning, gutter cleaning, deck restoration, concrete cleaning and professional holiday light installation to homeowners and businesses in ' + powerWashTowns.length + ' communities across Rhode Island and southeastern Massachusetts.</p><p>Each town page explains the services we offer locally, the exterior problems most common in that area, and how to request a free estimate.</p></section><section><h2>Rhode Island Towns We Serve</h2><ul>' + powerWashTowns.filter(function(t){ return t.stateAbbr === 'RI'; }).map(function(t){ return '<li><a href="/towns/' + t.slug + '/">Power Washing in ' + t.name + ', Rhode Island</a></li>'; }).join('') + '</ul></section><section><h2>Massachusetts Towns We Serve</h2><ul>' + powerWashTowns.filter(function(t){ return t.stateAbbr === 'MA'; }).map(function(t){ return '<li><a href="/towns/' + t.slug + '/">Power Washing in ' + t.name + ', Massachusetts</a></li>'; }).join('') + '</ul></section><section><h2>Holiday Light Installation Service Areas</h2><ul>' + holidayLightsTowns.map(function(t){ return '<li><a href="/holiday-lights/' + t.slug + '/">Christmas Light Installation in ' + t.name + '</a></li>'; }).join('') + '</ul></section><section><h2>Service Areas by State</h2><ul><li><a href="/towns/rhode-island/">Power Washing in Rhode Island</a></li><li><a href="/towns/massachusetts/">Power Washing in Massachusetts</a></li><li><a href="/holiday-lights/rhode-island/">Christmas Light Installation in Rhode Island</a></li><li><a href="/holiday-lights/massachusetts/">Christmas Light Installation in Massachusetts</a></li></ul></section></main>'
  },
  '/': {
    title: 'J & M Power Washing and Holiday Lights | Professional Exterior Cleaning in RI & MA',
    description: 'Professional power washing and holiday light installation in Rhode Island and Massachusetts. Family-owned exterior cleaning services.',
    content: `
      <header><h1>J & M Power Washing and Holiday Lights</h1></header>
      <main>
        <section>
          <h2>Professional Power Washing & Holiday Light Installation</h2>
          <p>Serving Rhode Island and Massachusetts with expert exterior cleaning services and professional holiday light installations.</p>
        </section>
        <section>
          <h3>Our Services</h3>
          <ul>
            <li>House Washing & Soft Washing</li>
            <li>Roof Cleaning & Treatment</li>
            <li>Deck & Fence Cleaning</li>
            <li>Concrete & Driveway Cleaning</li>
            <li>Gutter Cleaning</li>
            <li>Holiday Light Installation</li>
            <li>Commercial Power Washing</li>
          </ul>
        </section>
      </main>
    `
  },
  '/house-washing': {
    title: 'House Washing Services | Soft Washing Experts in RI & MA',
    description: 'Professional house washing and soft washing services. Safe, effective exterior cleaning for homes in Rhode Island and Massachusetts.',
    content: `
      <header><h1>Professional House Washing Services</h1></header>
      <main>
        <section>
          <h2>Expert Soft Washing for Your Home</h2>
          <p>Our soft washing technique safely removes dirt, algae, mold, and mildew from your home's exterior without damaging siding or paint.</p>
        </section>
        <section>
          <h3>Why Choose Our House Washing Service?</h3>
          <ul>
            <li>Safe soft washing technique - no high pressure damage</li>
            <li>Professional-grade cleaning solutions</li>
            <li>Experienced and insured team</li>
            <li>Serving Rhode Island and Massachusetts</li>
          </ul>
        </section>
      </main>
    `
  },
  '/holiday-lights': {
    title: 'Christmas Light Installation in RI & MA | J&M Holiday Lights',
    description: 'Professional Christmas light installation in Rhode Island & MA. Full-service design, setup, maintenance, takedown & storage. Commercial-grade LEDs, fully insured.',
    content: `
      <header><h1>Christmas Light Installation in RI &amp; MA</h1></header>
      <main>
        <section>
          <h2>Transform Your Home with Stunning Christmas Lights</h2>
          <p>Professional holiday light installation, maintenance, and removal services throughout Rhode Island and Massachusetts.</p>
        </section>
        <section>
          <h3>Our Holiday Light Packages</h3>
          <ul>
            <li>The Tinsel Package - Classic roofline lighting</li>
            <li>The Garland Package - Enhanced coverage</li>
            <li>The Gingerbread Package - Premium full-home display</li>
          </ul>
        </section>
      <section>
        <h2>Holiday Lighting Service Areas by State</h2>
        <ul>
          <li><a href="/holiday-lights/rhode-island/">Christmas Light Installation in Rhode Island</a></li>
          <li><a href="/holiday-lights/massachusetts/">Christmas Light Installation in Massachusetts</a></li>
        </ul>
      </section>
      </main>
    `
  },
  '/roof-cleaning': {
    title: 'Roof Cleaning Services | Safe Soft Wash Roof Cleaning in RI & MA',
    description: 'Professional roof cleaning services using safe soft washing methods. Remove algae, moss, and stains from your roof.',
    content: `
      <header><h1>Professional Roof Cleaning Services</h1></header>
      <main>
        <section>
          <h2>Safe Soft Wash Roof Cleaning</h2>
          <p>Our specialized soft washing technique safely removes algae, moss, and black streaks from your roof without damaging shingles.</p>
        </section>
      </main>
    `
  },
  '/deck-cleaning': {
    title: 'Deck Cleaning & Restoration | Wood Deck Cleaning in RI & MA',
    description: 'Professional deck cleaning and restoration services. Restore your deck\'s beauty with our expert cleaning.',
    content: `
      <header><h1>Professional Deck Cleaning & Restoration</h1></header>
      <main>
        <section>
          <h2>Restore Your Deck's Beauty</h2>
          <p>Expert deck cleaning and restoration services for wood and composite decks in Rhode Island and Massachusetts.</p>
        </section>
      </main>
    `
  },
  '/concrete-cleaning': {
    title: 'Concrete Cleaning | Driveway & Patio Cleaning in RI & MA',
    description: 'Professional concrete cleaning for driveways, patios, and walkways. High-pressure cleaning services.',
    content: `
      <header><h1>Professional Concrete Cleaning Services</h1></header>
      <main>
        <section>
          <h2>Driveway & Patio Power Washing</h2>
          <p>Professional concrete cleaning services for driveways, patios, walkways, and more throughout Rhode Island and Massachusetts.</p>
        </section>
      </main>
    `
  },
  '/gutter-cleaning': {
    title: 'Full Gutter Cleaning Service RI & MA | Interior & Exterior | J & M Power Washing',
    description: 'Complete gutter cleaning including interior debris removal and exterior brightening in Rhode Island & Massachusetts. Protect your home from water damage while enhancing curb appeal. Licensed & insured.',
    content: `
      <header><h1>Full Gutter Cleaning Service</h1></header>
      <main>
        <section>
          <h2>Complete Interior and Exterior Gutter Cleaning</h2>
          <p>Professional full-service gutter cleaning in Rhode Island and Massachusetts. We remove debris and clogs to protect your home from water damage, then brighten the exterior to eliminate tiger stripes and restore curb appeal.</p>
          <p>Clogged gutters aren't just an eyesore—they're a direct threat to your home's structural integrity. When leaves, twigs, and debris accumulate inside your gutters, water can't flow properly. This overflow causes foundation damage, basement flooding, rotted fascia, pest infestations, and ice dams in winter.</p>
        </section>

        <section>
          <h2>Interior Gutter Cleaning</h2>
          <p>Our complete interior gutter cleaning service includes hand-removal of all leaves, twigs, sediment, and organic matter from gutter channels. We flush downspouts with high-pressure water to ensure they're completely clear, inspect your gutter system for issues, and haul away all debris from your property.</p>

          <h3>The Dangers of Clogged Gutters</h3>
          <ul>
            <li><strong>Foundation Damage:</strong> Water pooling causes cracks and structural failure—repairs can cost $10,000+</li>
            <li><strong>Basement Flooding:</strong> Overflow directs water into your basement, causing mold and property damage</li>
            <li><strong>Fascia & Soffit Rot:</strong> Standing water deteriorates wood trim requiring expensive repairs</li>
            <li><strong>Pest Infestations:</strong> Debris-filled gutters become breeding grounds for mosquitoes and rodents</li>
            <li><strong>Ice Dams in Winter:</strong> Clogged gutters trap water that freezes, damaging your roof</li>
          </ul>
        </section>

        <section>
          <h2>Exterior Gutter Brightening</h2>
          <p>Over time, gutters accumulate unsightly black streaks (tiger stripes), oxidation, algae, and environmental stains. Our specialized exterior gutter brightening service uses professional-grade solutions to safely remove years of buildup, instantly restoring your home's curb appeal.</p>

          <h3>Benefits of Gutter Brightening</h3>
          <ul>
            <li><strong>Instant Curb Appeal:</strong> Clean gutters transform your home's appearance in hours</li>
            <li><strong>Increase Property Value:</strong> Well-maintained exteriors command higher resale prices</li>
            <li><strong>Extend Gutter Lifespan:</strong> Removing contaminants prevents premature deterioration</li>
            <li><strong>Avoid Costly Replacement:</strong> Restoration costs a fraction of new gutter installation</li>
          </ul>
        </section>

        <section>
          <h2>Related Services</h2>
          <p>Complete your home's protection with our other professional exterior cleaning services:</p>
          <ul>
            <li><a href="/house-washing">House Washing</a> - Protect your siding and remove mold, mildew, and algae</li>
            <li><a href="/roof-cleaning">Roof Cleaning</a> - Remove black streaks, moss, and algae from your roof</li>
            <li><a href="/deck-cleaning">Deck Restoration</a> - Professional deck cleaning and restoration services</li>
            <li><a href="/concrete-cleaning">Concrete Cleaning</a> - Driveway and patio power washing</li>
            <li><a href="/">View All Services</a> - Complete exterior cleaning solutions</li>
          </ul>
        </section>

        <section>
          <h3>Frequently Asked Questions</h3>
          <p><strong>Do you clean the inside and outside of gutters?</strong> Yes! We provide complete full-service gutter cleaning including removing all debris from inside your gutters, flushing downspouts, and cleaning the exterior to remove tiger stripes, stains, and oxidation.</p>
          <p><strong>How often should I have my gutters cleaned?</strong> We recommend gutter cleaning at least twice per year—once in late spring after trees bloom, and once in late fall after leaves drop.</p>
          <p><strong>Will clogged gutters really damage my home?</strong> Absolutely. Clogged gutters cause water overflow which can lead to foundation damage ($10,000+ repairs), basement flooding, rotted fascia and soffit boards, pest infestations, and ice dams in winter.</p>
        </section>
      </main>
    `
  },
  '/commercial': {
    title: 'Commercial Power Washing | Business Exterior Cleaning in RI & MA',
    description: 'Professional commercial power washing services for businesses, retail spaces, and commercial properties.',
    content: `
      <header><h1>Commercial Power Washing Services</h1></header>
      <main>
        <section>
          <h2>Professional Commercial Exterior Cleaning</h2>
          <p>Expert power washing services for commercial properties, retail spaces, and businesses throughout Rhode Island and Massachusetts.</p>
        </section>
      </main>
    `
  },
  '/commercial/maintenance-programs': {
    title: "Commercial Maintenance Programs | J and M Power Washing RI and MA",
    description: "Recurring commercial power washing programs in Rhode Island and Massachusetts. Monthly, quarterly and seasonal exterior maintenance schedules for commercial properties, HOAs and condo associations.",
    content: "<header><h1>Commercial Exterior Maintenance Programs in Rhode Island and Massachusetts</h1></header><main><section><h2>Scheduled Power Washing for Commercial Properties</h2><p>J and M Power Washing provides recurring exterior cleaning programs for commercial buildings, retail plazas, HOAs and condominium associations across Rhode Island and southeastern Massachusetts. Pick the visit frequency that fits your property and budget and we handle the rest on a set schedule.</p></section><section><h2>Choose a Maintenance Schedule</h2><ul><li><a href=\"/commercial/maintenance-programs/monthly-maintenance/\">Monthly Maintenance Program</a></li><li><a href=\"/commercial/maintenance-programs/quarterly-maintenance/\">Quarterly Maintenance Program</a></li><li><a href=\"/commercial/maintenance-programs/seasonal-maintenance/\">Seasonal Maintenance Program</a></li></ul></section><section><h2>Related Commercial Services</h2><ul><li><a href=\"/commercial/\">Commercial Power Washing</a></li><li><a href=\"/commercial/fleet-washing/\">Fleet Washing</a></li><li><a href=\"/hoa-condo-cleaning/\">HOA and Condo Exterior Cleaning</a></li></ul></section><section><h2>Request a Program Quote</h2><p>Tell us about your property and we will build a maintenance schedule and price for it.</p><ul><li><a href=\"/get-quote/\">Request a free commercial quote</a></li><li><a href=\"/instant-estimate/\">Get an instant estimate</a></li></ul></section></main>"
  },
  '/commercial/fleet-washing': {
    title: 'Professional Fleet Washing RI & MA | Mobile Truck Cleaning - J&M',
    description: 'J&M Power Washing offers 24/7 on-site mobile fleet washing in Rhode Island and Massachusetts. Licensed, insured, and reliable. Get a free estimate for your truck fleet today!',
    content: `
      <header><h1>Professional Fleet Washing in Rhode Island & Massachusetts</h1></header>
      <main>
        <section>
          <h2>Mobile On-Site Fleet Washing Services</h2>
          <p>J&M Power Washing provides reliable, on-site mobile fleet washing for commercial vehicles across Rhode Island and Massachusetts. Our trained crews come to your location 24/7 with all necessary equipment to keep your fleet looking professional.</p>
        </section>
        <section>
          <h2>Fleet Vehicles We Clean</h2>
          <ul>
            <li>Tractor trailers and semi trucks</li>
            <li>Box trucks and delivery vans</li>
            <li>Service vehicles and utility trucks</li>
            <li>Construction equipment</li>
            <li>Buses and passenger vehicles</li>
            <li>Refrigerated trucks and tankers</li>
          </ul>
        </section>
        <section>
          <h2>Why Choose J&M for Fleet Washing?</h2>
          <ul>
            <li>24/7 scheduling to minimize downtime</li>
            <li>Fully licensed, insured with over $2M coverage</li>
            <li>Environmentally responsible wash water recovery</li>
            <li>Consistent results with trained, uniformed crews</li>
            <li>Flexible weekly, biweekly, or monthly programs</li>
          </ul>
        </section>
        <section>
          <h2>Service Area</h2>
          <p>We serve commercial fleets throughout Rhode Island including Providence, Warwick, Cranston, Pawtucket, and all of southern Massachusetts including Attleboro, Franklin, and Mansfield. Call (401) 595-0726 for a free fleet washing estimate.</p>
        </section>
      </main>
    `
  },
  '/hoa-condo-cleaning': {
    title: 'HOA & Condo Power Washing RI & MA | Property Management Cleaning - J&M',
    description: 'Professional power washing for HOA communities, condos, and multi-unit properties in Rhode Island & Massachusetts. Consistent results, flexible scheduling, licensed & insured.',
    content: `
      <header><h1>HOA & Condo Exterior Cleaning in Rhode Island & Massachusetts</h1></header>
      <main>
        <section>
          <h2>Professional Property Management Cleaning Services</h2>
          <p>J&M Power Washing serves homeowners associations, condo complexes, and multi-unit residential communities throughout Rhode Island and Massachusetts. We provide consistent, high-quality exterior cleaning that maintains property values and resident satisfaction.</p>
        </section>
        <section>
          <h2>HOA & Condo Services</h2>
          <ul>
            <li>Building exterior soft washing for all unit types</li>
            <li>Common area concrete and walkway cleaning</li>
            <li>Parking garage and surface lot pressure washing</li>
            <li>Pool deck and clubhouse exterior cleaning</li>
            <li>Fence and retaining wall cleaning</li>
            <li>Gutter cleaning and brightening</li>
          </ul>
        </section>
        <section>
          <h2>Why Property Managers Choose J&M</h2>
          <ul>
            <li>Single point of contact for all units</li>
            <li>Flexible scheduling around residents</li>
            <li>Licensed and insured with over $2M in coverage</li>
            <li>Volume pricing for community-wide service</li>
            <li>Before and after documentation for board reports</li>
          </ul>
        </section>
      </main>
    `
  },
  '/commercial/maintenance-programs/monthly-maintenance': {
    title: 'Monthly Commercial Power Washing Program RI & MA | J&M',
    description: 'Monthly commercial power washing maintenance for high-traffic businesses. Drive-thrus, gas stations, restaurants, and retail. Licensed, insured, priority response.',
    content: `
      <header><h1>Monthly Commercial Power Washing Maintenance Program</h1></header>
      <main>
        <section>
          <h2>Comprehensive Monthly Cleaning for High-Traffic Properties</h2>
          <p>Our monthly maintenance program is designed for businesses that need frequent cleaning to maintain a professional appearance. Drive-thrus, gas stations, restaurants, and high-traffic retail locations benefit most from our monthly service.</p>
        </section>
        <section>
          <h2>What is Included Monthly</h2>
          <ul>
            <li>Monthly comprehensive exterior cleaning</li>
            <li>Entrance and walkway cleaning</li>
            <li>Dumpster pad degreasing</li>
            <li>24-hour priority response for urgent cleanups</li>
            <li>Seasonal deep cleaning included</li>
          </ul>
        </section>
        <section>
          <h2>Service Area</h2>
          <p>Available throughout Rhode Island and southern Massachusetts. Call (401) 595-0726 for a free commercial estimate.</p>
        </section>
      </main>
    `
  },
  '/commercial/maintenance-programs/quarterly-maintenance': {
    title: 'Quarterly Commercial Power Washing Program RI & MA | J&M',
    description: 'Quarterly commercial power washing for retail storefronts, offices, and medical facilities. Preventative maintenance keeps your property looking its best.',
    content: `
      <header><h1>Quarterly Commercial Power Washing Maintenance Program</h1></header>
      <main>
        <section>
          <h2>Quarterly Preventative Maintenance for Commercial Properties</h2>
          <p>Our quarterly maintenance program provides regular exterior cleaning for businesses that want to stay ahead of buildup without monthly service. Ideal for retail storefronts, office buildings, medical facilities, and professional services.</p>
        </section>
        <section>
          <h2>What is Included Quarterly</h2>
          <ul>
            <li>Full building exterior wash (4x per year)</li>
            <li>Sidewalk and entryway cleaning</li>
            <li>Parking area pressure washing</li>
            <li>Window frame and awning cleaning</li>
            <li>Priority scheduling between quarters if needed</li>
          </ul>
        </section>
        <section>
          <h2>Service Area</h2>
          <p>Serving all of Rhode Island and southern Massachusetts. Call (401) 595-0726 for a free commercial estimate.</p>
        </section>
      </main>
    `
  },
  '/commercial/maintenance-programs/seasonal-maintenance': {
    title: 'Seasonal Commercial Power Washing Program RI & MA | J&M',
    description: 'Seasonal power washing for warehouses, manufacturing facilities, and large commercial properties. Deep cleaning twice a year to maintain property standards.',
    content: `
      <header><h1>Seasonal Commercial Power Washing Maintenance Program</h1></header>
      <main>
        <section>
          <h2>Biannual Deep Cleaning for Large Commercial Properties</h2>
          <p>Our seasonal maintenance program provides comprehensive deep cleaning twice per year for warehouses, manufacturing facilities, industrial properties, and large commercial buildings. Perfect for properties that need thorough cleaning on a spring/fall schedule.</p>
        </section>
        <section>
          <h2>What is Included Seasonally</h2>
          <ul>
            <li>Full property deep cleaning (2x per year)</li>
            <li>Building exterior and loading dock areas</li>
            <li>Large parking lot and surface cleaning</li>
            <li>Perimeter fence and retaining wall cleaning</li>
            <li>Seasonal prep (spring mold removal, fall leaf stain cleaning)</li>
          </ul>
        </section>
        <section>
          <h2>Service Area</h2>
          <p>Serving industrial and commercial properties throughout Rhode Island and Massachusetts. Call (401) 595-0726 for a free estimate.</p>
        </section>
      </main>
    `
  },
  '/satisfaction-guarantee': {
    title: 'Our 100% Satisfaction Guarantee | J & M Power Washing',
    description: "J & M Power Washing's 100% satisfaction guarantee ensures your complete happiness with our power washing services. We make it right or it's free.",
    content: `
      <header><h1>Our 100% Satisfaction Guarantee</h1></header>
      <main>
        <section>
          <h2>The J & M Promise: We're Not Happy Until You Are</h2>
          <p>Your peace of mind is our top priority. At J & M Power Washing, we aren't finished until you are 100% satisfied with our work. We stand behind every job with an iron-clad promise: If you're not completely happy with the results, we will make it right.</p>
        </section>
        <section>
          <h3>What Our Guarantee Means for You</h3>
          <p>This isn't just a catchphrase—it's our commitment to accountability and a core part of our family-owned business.</p>
          <ul>
            <li>The Final Walkthrough - Review the work and see the transformation</li>
            <li>Your Honest Feedback - Tell us if anything doesn't meet expectations</li>
            <li>Our "Make it Right" Pledge - We re-service to your satisfaction</li>
            <li>Your Final Approval - We aren't done until you're 100% happy</li>
          </ul>
        </section>
        <section>
          <h3>A Guarantee Built on Quality</h3>
          <ul>
            <li>Professional Team - Licensed, insured, and trained technicians</li>
            <li>Top-Tier Equipment - State-of-the-art professional-grade equipment</li>
            <li>Local Reputation - Family-owned business serving RI and MA</li>
          </ul>
        </section>
      </main>
    `
  },
  '/blog': {
    title: 'Power Washing Tips & Guides | J & M Power Washing Blog',
    description: 'Expert power washing tips, maintenance guides, and home exterior care advice from J & M Power Washing professionals.',
    content: `
      <header><h1>Power Washing & Home Care Blog</h1></header>
      <main>
        <section>
          <h2>Expert Tips and Guides</h2>
          <p>Discover professional power washing tips, seasonal maintenance guides, and expert advice for keeping your home's exterior in pristine condition.</p>
        </section>
        <nav aria-label="Blog posts">
          <h2>Recent Articles</h2>
          <ul>
            <li><a href="/blog/the-hidden-dangers-of-diy-pressure-washing">The Hidden Dangers of DIY Pressure Washing</a></li>
            <li><a href="/blog/why-are-my-gutters-streaked-how-to-erase-tiger-stripes">Why Are My Gutters Streaked? How to Erase Tiger Stripes</a></li>
            <li><a href="/blog/full-gutter-cleaning-service-complete-interior-and-exterior">Full Gutter Cleaning Service: Complete Interior and Exterior</a></li>
            <li><a href="/blog/soft-washing-vs-pressure-washing-what-your-rhode-island-home-really-needs">Soft Washing vs Pressure Washing: What Your Rhode Island Home Really Needs</a></li>
            <li><a href="/blog/when-is-the-best-time-to-power-wash-your-rhode-island-home">When Is the Best Time to Power Wash Your Rhode Island Home?</a></li>
            <li><a href="/blog/5-signs-your-rhode-island-home-needs-power-washing-right-now">5 Signs Your Rhode Island Home Needs Power Washing Right Now</a></li>
            <li><a href="/blog/how-to-prepare-your-rhode-island-home-for-holiday-guests">How to Prepare Your Rhode Island Home for Holiday Guests</a></li>
            <li><a href="/blog/new-years-resolutions-for-your-ri-home">New Year's Resolutions for Your RI Home</a></li>
            <li><a href="/blog/dont-be-haunted-by-holiday-hassle">Don't Be Haunted by Holiday Hassle</a></li>
            <li><a href="/blog/will-holiday-lights-make-my-rhode-island-energy-bill">Will Holiday Lights Make My Rhode Island Energy Bill Skyrocket?</a></li>
            <li><a href="/blog/brighten-your-business">Brighten Your Business with Commercial Holiday Lighting</a></li>
            <li><a href="/blog/your-holidays-why-a-professional-installer-is-your-secret">Your Holidays: Why a Professional Installer Is Your Secret</a></li>
          </ul>
        </nav>
      </main>
    `
  },
  '/about-us': {
    title: 'About J & M Power Washing | Family-Owned in RI & MA',
    description: 'Learn about J & M Power Washing, a family-owned business serving Rhode Island and Massachusetts with professional exterior cleaning services.',
    content: `
      <header><h1>About J & M Power Washing</h1></header>
      <main>
        <section>
          <h2>Family-Owned Excellence Since Day One</h2>
          <p>J & M Power Washing is a family-owned business dedicated to providing exceptional exterior cleaning and holiday light services throughout Rhode Island and Massachusetts.</p>
        </section>
      </main>
    `
  }
};

for (const town of holidayLightsTowns) {
  routeMetaData[`/holiday-lights/${town.slug}`] = {
    title: town.metaTitle,
    description: town.metaDescription,
    content: `
      <header><h1>Christmas Light Installation in ${town.name}, ${town.stateAbbr}</h1></header>
      <p>Full-service holiday lighting experts — custom design, professional installation with energy-efficient LED Christmas lights, in-season maintenance, takedown and storage for homes and businesses in ${town.name}, ${town.stateAbbr}.</p>
      <main>
        <section>
          <h2>Professional Holiday Lighting in ${town.name}, ${town.stateAbbr}</h2>
          <p>${town.description}</p>
        </section>
        <section>
          <h2>Custom Holiday Light Design for ${town.name} Homes</h2>
          <p>${town.seoContent}</p>
        </section>
        <section>
          <h3>Our Holiday Light Packages</h3>
          <ul>
            <li>The Tinsel Package - Classic roofline lighting</li>
            <li>The Garland Package - Enhanced coverage</li>
            <li>The Gingerbread Package - Premium full-home display</li>
          </ul>
        </section>
      </main>
    `
  };
}

for (const town of powerWashTowns) {
  routeMetaData[`/towns/${town.slug}`] = {
    title: town.metaTitle,
    description: town.metaDescription,
    content: `
      <header><h1>Power Washing & Exterior Cleaning in ${town.name}, ${town.stateAbbr}</h1></header>
      <main>
        <section>
          <h2>Professional Power Washing in ${town.name}, ${town.state}</h2>
          <p>${town.description}</p>
        </section>
        ${town.seoContent ? `<section>
          <h2>Exterior Cleaning Services in ${town.name}</h2>
          <p>${town.seoContent}</p>
        </section>` : ''}
        <section>
          <h2>Our Services in ${town.name}, ${town.stateAbbr}</h2>
          <ul>
            <li>House Washing - Gentle soft wash for vinyl, cedar, and painted siding</li>
            <li>Roof Cleaning - Safe removal of black streaks, algae, and moss</li>
            <li>Deck & Patio Cleaning - Restore weathered wood and composite decks</li>
            <li>Gutter Cleaning - Interior cleanout and exterior brightening</li>
            <li>Concrete & Driveway Cleaning - High-pressure surface cleaning</li>
            <li>Holiday Light Installation - Professional Christmas light design and setup</li>
          </ul>
        </section>
        <section>
          <h2>Why Choose J&M for Power Washing in ${town.name}?</h2>
          <p>Family-owned and fully insured with over $2M in coverage. We provide 24-hour estimates, use safe low-pressure soft washing techniques, and most jobs are completed in a single day. Call (401) 595-0726 for a free quote.</p>
        </section>
      </main>
    `
  };
}

// Default content for routes without specific meta
const defaultContent = (route) => {
  const routeName = route.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Home';
  const capitalizedName = routeName.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return `
    <header><h1>${capitalizedName}</h1></header>
    <main>
      <section>
        <h2>${capitalizedName} - J & M Power Washing</h2>
        <p>Professional power washing and holiday light installation services in Rhode Island and Massachusetts.</p>
      </section>
    </main>
  `;
};

// FAQ data for service pages (used to inject FAQPage JSON-LD into SSR HTML)
const routeFaqData = {
  '/house-washing': [
    { question: 'How often should I have my house washed?', answer: 'We recommend having your house professionally washed once per year. However, homes in areas with heavy tree coverage, high humidity, or facing north may benefit from washing twice a year to prevent algae and mildew buildup.' },
    { question: 'Is soft washing safe for vinyl and cedar siding?', answer: 'Yes! Soft washing is specifically designed to be safe for all types of siding. Unlike pressure washing, which can damage siding, soft washing uses low pressure and professional-grade cleaning solutions to safely remove dirt, algae, and mildew without causing any harm to your home.' },
    { question: 'Will house washing damage my landscaping?', answer: 'No. We take extra care to protect your landscaping, plants, and outdoor furniture. We use environmentally-safe cleaning products and pre-wet all plants and landscaping before washing. Our experienced team ensures your property is protected throughout the entire process.' },
    { question: 'How long does house washing take?', answer: 'Most residential house washing projects are completed in 2-4 hours, depending on the size of your home and the extent of cleaning needed. We work efficiently while maintaining our high standards of quality and safety.' },
    { question: 'How much does house washing cost?', answer: "House washing typically costs between $300-$600 for most homes, depending on size, condition, and accessibility. We provide free, detailed estimates with no obligation. Factors affecting cost include square footage, number of stories, and amount of algae or mildew present." },
    { question: 'Can house washing really increase my home value?', answer: "Yes! Studies show that professional exterior cleaning can increase home value by up to 10%. It significantly improves curb appeal, prevents premature aging of siding, and shows potential buyers that the home has been well-maintained. It's one of the highest ROI home improvements you can make." },
  ],
  '/roof-cleaning': [
    { question: "What's the difference between soft washing and power washing a roof?", answer: "Power washing uses high pressure, which can strip granules, break shingles, and void your roof's warranty. We only use soft washing, which relies on a specialized, eco-friendly cleaning solution (applied with the same pressure as a garden hose) to kill the growth at its root without any risk of damage." },
    { question: 'Is your roof cleaning solution safe for my pets, plants, and family?', answer: 'Yes. Our solution is 100% biodegradable. We take great care to pre-rinse all surrounding landscaping and do a final rinse afterward, ensuring your plants and property are perfectly safe.' },
    { question: 'How often do I need my roof cleaned in Rhode Island?', answer: 'Most roofs in our area need to be cleaned every 3-5 years, depending on factors like shade from trees and the direction your home faces.' },
    { question: 'What towns do you provide roof cleaning in?', answer: 'We proudly provide professional roof cleaning services throughout Rhode Island and Southern Massachusetts, including North Smithfield, Smithfield, Lincoln, Cumberland, Woonsocket, Providence, Cranston, Warwick, Pawtucket, and many more communities.' },
  ],
  '/deck-cleaning': [
    { question: 'How often should I have my deck cleaned?', answer: 'Most decks in Rhode Island benefit from annual cleaning due to our humid climate and seasonal weather. High-traffic decks or those in shaded areas with more moisture may need cleaning every 6-9 months. Regular cleaning prevents buildup of mold, mildew, and algae that can permanently damage wood fibers.' },
    { question: 'Will power washing damage my deck?', answer: 'When done incorrectly, yes. Thats why we use controlled soft washing techniques with adjustable pressure settings appropriate for each material. Our technicians are trained to clean effectively without causing furring, splintering, or surface damage. We adjust our approach for wood, composite, and vinyl materials.' },
    { question: 'How long does deck cleaning take?', answer: 'A typical residential deck takes 2-4 hours to clean properly. This includes preparation, cleaning, and ensuring proper drainage. If staining or sealing is included, additional time is needed for drying (48-72 hours) and application. We always provide accurate time estimates during your free consultation.' },
    { question: 'Do you offer deck staining and sealing services?', answer: "Yes! We provide complete deck restoration including cleaning, staining, and sealing. We work with premium brands like TWP, Ready Seal, Cabot, and Sherwin-Williams. You can choose from transparent, semi-transparent, or solid stain options in various colors to match your home's aesthetic." },
    { question: 'Can you clean composite decking like Trex or TimberTech?', answer: 'Composite decking requires special care and we are fully trained in proper composite cleaning techniques. We use lower pressure settings and specialized cleaning solutions safe for composite materials. Regular cleaning keeps composite decks looking new and prevents mold growth in the surface texture.' },
    { question: 'What is the best time of year to clean my deck in Rhode Island?', answer: 'Spring and early fall are ideal for deck cleaning in Rhode Island. Spring cleaning removes winter buildup before outdoor entertaining season, while fall cleaning prepares your deck for winter. We recommend avoiding cleaning during extreme heat or when temperatures drop below 50 degrees for best results.' },
  ],
  '/concrete-cleaning': [
    { question: 'Can you remove oil stains from my driveway?', answer: 'Yes, we specialize in oil stain removal using professional-grade degreasing solutions and high-pressure cleaning. Fresh oil stains respond best to treatment, but we can significantly improve even older, set-in stains. For stubborn stains, we may recommend multiple treatments or sealing to prevent future penetration.' },
    { question: 'How much does driveway cleaning cost in Rhode Island?', answer: 'Pricing depends on driveway size, condition, and stain severity. Most residential driveways in the Providence area range from $150-$400. We provide free on-site estimates with exact pricing before any work begins. Commercial properties and larger areas receive customized quotes based on square footage.' },
    { question: 'How long does concrete cleaning take?', answer: 'A typical residential driveway takes 1-3 hours depending on size and condition. We use professional surface cleaners that clean uniformly and efficiently. Your driveway is typically ready for vehicle traffic within 1-2 hours after we finish, though we recommend waiting 24 hours before parking on freshly cleaned surfaces.' },
    { question: 'Will pressure washing damage my concrete?', answer: 'When done correctly by professionals, no. We use appropriate pressure settings and maintain proper tip distance to clean effectively without damaging the concrete surface. Our technicians are trained to identify concrete condition and adjust techniques for older or more delicate surfaces.' },
    { question: 'Do you offer concrete sealing services?', answer: 'Yes, we offer concrete sealing as an add-on service. Sealing protects your freshly cleaned concrete from oil penetration, weathering, and future staining. Sealed driveways are much easier to maintain and typically only need cleaning every 2-3 years compared to annually for unsealed concrete.' },
    { question: 'What surfaces can you clean besides driveways?', answer: 'We clean all concrete and paved surfaces including sidewalks, patios, pool decks, garage floors, walkways, retaining walls, parking lots, commercial storefronts, and property entrances. We also handle brick pavers, stamped concrete, and flagstone with appropriate cleaning methods for each material.' },
  ],
  '/gutter-cleaning': [
    { question: 'Do you clean the inside and outside of gutters?', answer: 'Yes! We provide complete full-service gutter cleaning. This includes removing all debris from inside your gutters, flushing downspouts, AND cleaning the exterior to remove tiger stripes, stains, and oxidation. You get both functional protection and beautiful appearance.' },
    { question: 'How often should I have my gutters cleaned?', answer: 'We recommend gutter cleaning at least twice per year—once in late spring after trees bloom, and once in late fall after leaves drop. Homes with heavy tree coverage or pine trees may benefit from more frequent cleaning (3-4 times per year) to prevent clogs.' },
    { question: 'What are "tiger stripes" on gutters?', answer: "Tiger stripes are dark vertical streaks on the exterior of gutters caused by water runoff mixed with environmental pollutants, pollen, and oxidation. They're extremely difficult to remove with regular cleaning but our specialized gutter brightening service removes them completely." },
    { question: 'Will clogged gutters really damage my home?', answer: 'Absolutely. Clogged gutters cause water to overflow, which can lead to foundation damage ($10,000+ repairs), basement flooding, rotted fascia and soffit boards, pest infestations, and ice dams in winter. Regular gutter cleaning is essential preventive maintenance that saves you thousands in repairs.' },
    { question: 'How long does gutter cleaning take?', answer: 'Most residential gutter cleaning projects are completed in 2-4 hours, depending on the size of your home, amount of debris, and condition of the exterior. We work efficiently while ensuring thorough cleaning of both interior and exterior surfaces.' },
    { question: 'Do you haul away the debris?', answer: 'Yes! We bag and remove all debris from your property—no mess left behind. Your gutters will be clean, your yard will be clean, and your home will look great.' },
  ],
  '/hoa-condo-cleaning': [
    { question: 'How often should HOAs schedule pressure washing services?', answer: "Most HOAs and condo associations in Rhode Island and Massachusetts benefit from annual building washing, bi-annual walkway cleaning, and quarterly parking lot maintenance. High-traffic areas may need more frequent attention. We create custom maintenance schedules based on your property's age, location, and board priorities to maintain curb appeal year-round." },
    { question: 'What does condo exterior cleaning cost in Rhode Island?', answer: 'Condo exterior cleaning costs vary based on building size, services needed, and frequency. Most RI condo associations pay between $2,500-$8,000 annually for comprehensive exterior maintenance including building washing, walkways, and common areas. We provide detailed proposals with transparent pricing and can structure payments to align with your HOA budget cycles.' },
    { question: 'Do you provide HOA gutter maintenance throughout Rhode Island and Massachusetts?', answer: 'Yes, we provide complete HOA gutter maintenance throughout all of Rhode Island and Massachusetts, including Providence, Warwick, Cranston, Pawtucket, Attleboro, Franklin, and surrounding communities. Our service includes debris removal, downspout flushing, and gutter cleaning for multi-unit properties. We can schedule seasonal cleanings to prevent water damage and foundation issues.' },
    { question: 'Can you handle condo roof cleaning without voiding warranties?', answer: 'Absolutely. We specialize in soft washing for condo roof cleaning that safely removes algae, moss, and black streaks without high pressure that can damage shingles or void warranties. Our biodegradable solutions meet manufacturer specifications and extend roof life for Rhode Island and Massachusetts condo associations.' },
    { question: 'Do you provide your own water for HOA pressure washing?', answer: 'Yes, we carry 300+ gallons per truck for HOA pressure washing projects. For larger multi-building communities, we can coordinate site water access with your facility manager to maximize efficiency and minimize costs while maintaining our high cleaning standards.' },
    { question: 'Can you work nights or weekends to avoid disrupting condo residents?', answer: "Absolutely. We schedule around your residents' needs. Most HOA and condo jobs are done during off-peak hours - evenings, early mornings, or weekends. We coordinate with your on-site team and provide advance notice to minimize any impact on daily activities." },
    { question: 'What payment terms do you offer for HOA and condo associations?', answer: 'We offer Net 30 terms for qualified property management companies and HOAs. We can invoice directly to your management company or process through your vendor portal. W-9, certificates of insurance (COI), and all compliance documentation provided upon request.' },
    { question: 'Do you provide association deck restoration services?', answer: 'Yes, we provide complete association deck restoration including cleaning, staining, and sealing for community pool decks, patios, and recreational areas. Our process removes years of grime, algae, and staining while protecting the wood or composite materials for long-lasting results across Rhode Island and Massachusetts HOA communities.' },
  ],
  '/commercial': [
    { question: 'Do you provide your own water?', answer: "Yes, we carry 300+ gallons per truck. For larger projects, we can coordinate site water access with your facility manager to maximize efficiency and minimize costs." },
    { question: 'Can you work nights or weekends to avoid tenant disruption?', answer: "Absolutely. We schedule around your occupants' needs. Most HOA and retail jobs are done on off-peak hours. We'll coordinate with your on-site team to minimize any impact." },
    { question: 'How do you protect landscaping and resident property?', answer: "We pre-wet all landscaping, use eco-friendly detergents when needed, and follow strict protocols to protect plants, vehicles, and personal property. We also provide advance notice to residents through your preferred communication channel." },
    { question: 'What are your payment and billing terms?', answer: 'We offer Net 30 terms for qualified property management companies and HOAs. We can invoice directly to your management company or process through your vendor portal. W-9 and COI provided upon request.' },
  ],
};

function buildFaqJsonLd(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  });
}

// Breadcrumb labels for SSR
const breadcrumbLabels = {
  'house-washing': 'House Washing',
  'roof-cleaning': 'Roof Cleaning',
  'deck-cleaning': 'Deck Cleaning',
  'concrete-cleaning': 'Concrete Cleaning',
  'gutter-cleaning': 'Gutter Cleaning',
  'holiday-lights': 'Holiday Lights',
  'commercial': 'Commercial',
  'hoa-condo-cleaning': 'HOA & Condo Cleaning',
  'financing': 'Financing',
  'faq': 'FAQ',
  'about-us': 'About Us',
  'blog': 'Blog',
  'towns': 'Service Areas',
  'get-quote': 'Get a Quote',
  'instant-estimate': 'Instant Estimate',
  'customer-portal': 'Customer Portal',
  'privacy-policy': 'Privacy Policy',
  'satisfaction-guarantee': 'Satisfaction Guarantee',
  'sitemap': 'Sitemap',
  'fleet-washing': 'Fleet Washing',
  'monthly-maintenance': 'Monthly Maintenance',
  'quarterly-maintenance': 'Quarterly Maintenance',
  'seasonal-maintenance': 'Seasonal Maintenance',
  'maintenance-programs': 'Maintenance Programs',
};

function buildBreadcrumbJsonLd(route) {
  if (route === '/') return null;
  const segments = route.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://powerwashjm.com/' }];
  let currentPath = '';
  segments.forEach((seg, i) => {
    currentPath += '/' + seg;
    const label = breadcrumbLabels[seg] || ((s) => { const p = s.split('-'); const last = p[p.length - 1]; const st = last.length === 2 ? last.toUpperCase() : null; const words = (st ? p.slice(0, -1) : p).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); return st ? words + ', ' + st : words; })(seg);
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: label,
      item: `https://powerwashjm.com${currentPath}/`,
    });
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
}

// ---- State level service area pages (RI / MA) for both service lines ----
const SQ = String.fromCharCode(39);
const DQ = String.fromCharCode(34);
const stateAreasSrc = fs.readFileSync(path.resolve(__dirname, 'src/data/stateAreasData.ts'), 'utf-8');
function sqField(block, name) {
  const k = block.indexOf(name + ': ' + SQ);
  if (k < 0) return '';
  const s = k + name.length + 3;
  const e = block.indexOf(SQ, s);
  return e < 0 ? '' : block.slice(s, e);
}
function sliceBetween(src, startMark, endMark) {
  const a = src.indexOf(startMark);
  if (a < 0) return '';
  const b = endMark ? src.indexOf(endMark, a + startMark.length) : -1;
  return b < 0 ? src.slice(a) : src.slice(a, b);
}
const copyAll = sliceBetween(stateAreasSrc, 'export const stateCopy', 'export interface StateFAQ');
const copyBlocks = { RI: sliceBetween(copyAll, '  RI: {', '  MA: {'), MA: sliceBetween(copyAll, '  MA: {', '') };
const groupsAll = sliceBetween(stateAreasSrc, 'export const countyGroups', 'export interface StateCopy');
const groupBlocks = { RI: sliceBetween(groupsAll, '  RI: [', '  MA: ['), MA: sliceBetween(groupsAll, '  MA: [', '') };
const faqAll = sliceBetween(stateAreasSrc, 'export const stateFAQs', '');
function parseGroups(block) {
  const out = [];
  block.split('{ county: ').slice(1).forEach(chunk => {
    const q1 = chunk.indexOf(SQ);
    const q2 = chunk.indexOf(SQ, q1 + 1);
    const sa = chunk.indexOf('[');
    const sb = chunk.indexOf(']', sa);
    const slugs = chunk.slice(sa + 1, sb).split(',').map(x => x.split(SQ).join('').trim()).filter(x => x.length > 0);
    out.push({ county: chunk.slice(q1 + 1, q2), slugs: slugs });
  });
  return out;
}
function parseFaqs(key) {
  const block = sliceBetween(faqAll, '  ' + SQ + key + SQ + ': [', '  ]');
  const out = [];
  block.split(String.fromCharCode(10)).forEach(line => {
    const qi = line.indexOf('question: ' + SQ);
    const ai = line.indexOf('answer: ' + SQ);
    if (qi > -1 && ai > -1) {
      const qs = qi + 11;
      const as2 = ai + 9;
      const q = line.slice(qs, line.indexOf(SQ, qs));
      const an = line.slice(as2, line.indexOf(SQ, as2));
      if (q.length > 0 && an.length > 0) out.push({ question: q, answer: an });
    }
  });
  return out;
}
const stateSlugMap = { RI: 'rhode-island', MA: 'massachusetts' };
const stateDefs = [
  { route: '/towns/rhode-island', service: 'washing', abbr: 'RI' },
  { route: '/towns/massachusetts', service: 'washing', abbr: 'MA' },
  { route: '/holiday-lights/rhode-island', service: 'holiday', abbr: 'RI' },
  { route: '/holiday-lights/massachusetts', service: 'holiday', abbr: 'MA' }
];
for (const def of stateDefs) {
  const cb = copyBlocks[def.abbr];
  const isHol = def.service === 'holiday';
  const stName = sqField(cb, 'name');
  const label = isHol ? 'Christmas Light Installation' : 'Power Washing';
  const base = isHol ? '/holiday-lights/' : '/towns/';
  const sisterBase = isHol ? '/towns/' : '/holiday-lights/';
  const pool = isHol ? holidayLightsTowns : powerWashTowns;
  const towns = pool.filter(t => t.stateAbbr === def.abbr);
  const groups = parseGroups(groupBlocks[def.abbr]);
  const used = [];
  let listHtml = '';
  const li = function (t) { return '<li><a href=' + DQ + base + t.slug + '/' + DQ + '>' + label + ' in ' + t.name + ', ' + def.abbr + '</a></li>'; };
  groups.forEach(g => {
    const list = towns.filter(t => g.slugs.indexOf(t.slug) > -1);
    list.forEach(t => used.push(t.slug));
    if (list.length > 0) {
      listHtml += '<section><h3>' + g.county + '</h3><ul>' + list.map(li).join('') + '</ul></section>';
    }
  });
  const rest = towns.filter(t => used.indexOf(t.slug) === -1);
  if (rest.length > 0) {
    listHtml += '<section><h3>Additional Communities We Serve</h3><ul>' + rest.map(li).join('') + '</ul></section>';
  }
  const otherAbbr = def.abbr === 'RI' ? 'MA' : 'RI';
  const otherName = otherAbbr === 'RI' ? 'Rhode Island' : 'Massachusetts';
  const thisSlug = stateSlugMap[def.abbr];
  const otherSlug = stateSlugMap[otherAbbr];
  const A = function (href, text) { return '<li><a href=' + DQ + href + DQ + '>' + text + '</a></li>'; };
  routeMetaData[def.route] = {
    title: sqField(cb, isHol ? 'holidayTitle' : 'washingTitle'),
    description: sqField(cb, isHol ? 'holidayDescription' : 'washingDescription'),
    content: '<header><h1>' + label + ' in ' + stName + '</h1></header><main>'
      + '<section><p>' + sqField(cb, isHol ? 'holidayIntro' : 'washingIntro') + '</p></section>'
      + '<section><h2>What ' + stName + ' Properties Deal With</h2><p>' + sqField(cb, isHol ? 'holidayContext' : 'washingContext') + '</p></section>'
      + '<section><h2>' + stName + ' Towns We Serve for ' + label + '</h2><p>' + sqField(cb, 'coverageNote') + '</p>'
      + '<p>We currently cover ' + towns.length + ' ' + stName + ' communities for this service. Every one has its own page with local detail.</p>'
      + listHtml
      + '</section>'
      + '<section><h2>Related Service Areas</h2><ul>'
      + A(sisterBase + thisSlug + '/', (isHol ? 'Power Washing' : 'Christmas Light Installation') + ' in ' + stName)
      + A(base + otherSlug + '/', label + ' in ' + otherName)
      + A(base, 'All ' + (isHol ? 'holiday lighting' : 'power washing') + ' service areas')
      + '</ul></section>'
      + '<section><h2>Get a Free ' + stName + ' Estimate</h2><p>Written estimates within 24 hours. We answer 7 AM to 7 PM, seven days a week. Call <a href=' + DQ + 'tel:+14015950726' + DQ + '>401-595-0726</a>.</p></section>'
      + '</main>'
  };
  const stateFaqList = parseFaqs(def.service + '-' + def.abbr);
  if (stateFaqList.length > 0) { routeFaqData[def.route] = stateFaqList; }
  routes.push(def.route);
  console.log('State page ' + def.route + ' towns=' + towns.length + ' groups=' + groups.length + ' faqs=' + stateFaqList.length);
}

// Fetch town FAQs from Supabase for SSR injection
const townFaqMap = {};
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const { data: allFaqs, error } = await supabase
      .from('town_faqs')
      .select('town_slug, question, answer, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && allFaqs) {
      for (const faq of allFaqs) {
        if (!townFaqMap[faq.town_slug]) townFaqMap[faq.town_slug] = [];
        townFaqMap[faq.town_slug].push({ question: faq.question, answer: faq.answer });
      }
      console.log(`📋 Loaded FAQs for ${Object.keys(townFaqMap).length} towns from Supabase`);
    } else if (error) {
      console.warn('⚠️  Could not fetch town FAQs:', error.message);
    }
  } catch (e) {
    console.warn('⚠️  Supabase FAQ fetch failed:', e.message);
  }
} else {
  console.warn('⚠️  Supabase credentials not found, skipping town FAQ injection');
}

// Process each route

// Build holiday lighting FAQ sets from the town data overrides so SSR schema matches the rendered page
const hlFaqMap = {};
try {
  const Q = String.fromCharCode(34);
  const NLc = String.fromCharCode(10);
  const hlSrc = fs.readFileSync(path.resolve(__dirname, 'src/data/holidayLightsTownsData.ts'), 'utf8');
  const cut = (b, k) => { const i = b.indexOf(k + ': ' + Q); if (i < 0) return ''; const s = i + k.length + 3; const e = b.indexOf(Q, s); return e < 0 ? '' : b.slice(s, e); };
  const ovSeg = hlSrc.slice(hlSrc.indexOf('const townFAQOverrides'), hlSrc.indexOf('export function getTownFAQs'));
  const ovMap = {};
  const parts = ovSeg.split(String.fromCharCode(39) + ': {');
  for (let i = 1; i < parts.length; i++) {
    const prev = parts[i - 1];
    const slug = prev.slice(prev.lastIndexOf(NLc) + 1).trim().slice(1);
    const body = parts[i];
    ovMap[slug] = { priceNote: cut(body, 'priceNote'), bookingNote: cut(body, 'bookingNote'), homeStyle: cut(body, 'homeStyle'), commercialNote: cut(body, 'commercialNote'), removalNote: cut(body, 'removalNote'), maintenanceNote: cut(body, 'maintenanceNote') };
  }
  const tSeg = hlSrc.slice(hlSrc.indexOf('export const holidayLightsTownsData'));
  const tParts = tSeg.split('slug: ' + Q);
  for (let i = 1; i < tParts.length; i++) {
    const b = tParts[i];
    const slug = b.slice(0, b.indexOf(Q));
    const nm = cut(b, 'name');
    if (!nm) continue;
    const ab = slug.slice(-2).toUpperCase();
    const o = ovMap[slug] || {};
    const priceNote = o.priceNote || ('Most residential installations in ' + nm + ' range from $500 to $2,500 depending on the size of your home and roofline complexity.');
    const bookingNote = o.bookingNote || ('We recommend booking by early October to secure your preferred installation date in ' + nm + '.');
    const homeStyle = o.homeStyle || ('We tailor designs to each ' + nm + ' home and its unique roofline and lot characteristics.');
    const commercialNote = o.commercialNote || ('Yes, we serve both residential and commercial properties throughout ' + nm + '.');
    const removalNote = o.removalNote || ('We schedule removal between January 2nd and January 31st. ' + nm + ' customers who rebook receive a loyalty discount.');
    const maintenanceNote = o.maintenanceNote || ('We offer free season-long maintenance for all ' + nm + ' installations, repairing any damage within 48 hours.');
    hlFaqMap[slug] = [
      { question: 'How much does Christmas light installation cost in ' + nm + ', ' + ab + '?', answer: priceNote + ' We provide free on-site estimates so you know the exact price before any work begins. The price includes all lights, materials, installation, and removal.' },
      { question: 'When should I book holiday light installation in ' + nm + '?', answer: bookingNote + ' Early bookers get first choice of scheduling and can have lights installed as early as late October for maximum enjoyment throughout the season.' },
      { question: 'What type of lights do you use in ' + nm + '?', answer: 'We use commercial-grade LED lights rated for 50,000+ hours that are brighter, more energy-efficient, and more durable than retail-store lights. ' + homeStyle + ' After the season, we remove and store everything so you can reuse them next year at a reduced rate.' },
      { question: 'What if lights stop working or get damaged during the season?', answer: maintenanceNote + ' Our coverage runs from installation day through mid-January, and there is never an extra charge for weather-related repairs.' },
      { question: 'Do you install holiday lights on commercial properties in ' + nm + '?', answer: commercialNote + ' Commercial installations include timer and automation setup, and we coordinate with property managers for multi-tenant buildings. Call us for a custom commercial quote.' },
      { question: 'When do you take down and remove the holiday lights in ' + nm + '?', answer: removalNote + ' After removal, we carefully pack and label your lights and store them in our climate-controlled facility, ready for next season.' }
    ];
  }
  console.log('Holiday FAQ sets built: ' + Object.keys(hlFaqMap).length);
} catch (e) {
  console.log('Holiday FAQ build skipped: ' + e.message);
}

try {
  const fbRaw = fs.readFileSync(path.resolve(__dirname, 'src/data/townFaqFallback.json'), 'utf8');
  const fbJson = JSON.parse(fbRaw);
  let fbAdded = 0;
  Object.keys(fbJson).forEach(function (sl) {
    if (!townFaqMap[sl] || townFaqMap[sl].length === 0) { townFaqMap[sl] = fbJson[sl]; fbAdded++; }
  });
  console.log('Town FAQ fallback applied for ' + fbAdded + ' towns');
} catch (e) {
  console.log('Town FAQ fallback skipped: ' + e.message);
}

const NOINDEX_ROUTES = ['/customer-portal'];

const SITE_NAV = "<nav aria-label=\"Services and site sections\"><h2>J and M Power Washing Services</h2><ul><li><a href=\"/house-washing/\">House Washing and Soft Washing</a></li><li><a href=\"/roof-cleaning/\">Roof Cleaning and Moss Treatment</a></li><li><a href=\"/gutter-cleaning/\">Gutter Cleaning</a></li><li><a href=\"/deck-cleaning/\">Deck and Fence Cleaning</a></li><li><a href=\"/concrete-cleaning/\">Concrete and Driveway Cleaning</a></li><li><a href=\"/hoa-condo-cleaning/\">HOA and Condo Exterior Cleaning</a></li><li><a href=\"/holiday-lights/\">Holiday Light Installation</a></li><li><a href=\"/commercial/\">Commercial Power Washing</a></li><li><a href=\"/commercial/fleet-washing/\">Fleet Washing</a></li><li><a href=\"/towns/\">Service Areas in Rhode Island and Massachusetts</a></li><li><a href=\"/instant-estimate/\">Instant Estimate</a></li><li><a href=\"/get-quote/\">Request a Free Quote</a></li><li><a href=\"/about-us/\">About J and M Power Washing</a></li><li><a href=\"/faq/\">Frequently Asked Questions</a></li><li><a href=\"/financing/\">Financing Options</a></li><li><a href=\"/blog/\">Exterior Cleaning Blog</a></li><li><a href=\"/satisfaction-guarantee/\">Satisfaction Guarantee</a></li></ul></nav>";

routes.forEach(route => {
  const routePath = route === '/' ? '/index' : route;
  const filePath = path.resolve(__dirname, 'dist', routePath.slice(1), 'index.html');
  const dirPath = path.dirname(filePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  let html = template;

  // Get route-specific meta data
  const meta = routeMetaData[route];
  const content = meta?.content || defaultContent(route);

  // Inject SEO-friendly content into the root div
  // Search engines will see this content even without JavaScript
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}${SITE_NAV}</div>`
  );

  // Update meta tags
  if (meta) {
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${meta.title}</title>`
    );
    html = html.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${meta.description}" />`
    );
    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${meta.title}" />`
    );
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${meta.description}" />`
    );
  }

  // CRITICAL: Inject robots meta tag for Google indexing
  if (!html.includes('<meta name="robots"')) {
    html = html.replace(
      /<meta name="viewport"/,
      '<meta name="robots" content="index, follow" />\n    <meta name="viewport"'
    );
  }

  // Private routes must stay crawlable so Google can SEE the noindex.
  // robots.txt Disallow blocks crawling, which leaves the URL stuck in the index.
  if (NOINDEX_ROUTES.indexOf(route) > -1) {
    html = html.replace(/<meta name="robots" content="[^"]*"\s*\/>/g,
      '<meta name="robots" content="noindex, nofollow" />');
  }

  // Update canonical URLs and og:url
  if (route !== '/') {
    html = html.replace(
      /<meta property="og:url" content="https:\/\/(www\.)?powerwashjm\.(com|pro)\/" \/>/,
      `<meta property="og:url" content="https://powerwashjm.com${route}/" />`
    );

    html = html.replace(
      /<link rel="canonical" href="https:\/\/(www\.)?powerwashjm\.(com|pro)\/" \/>/,
      `<link rel="canonical" href="https://powerwashjm.com${route}/" />`
    );
  }

  // Inject FAQPage JSON-LD for service pages and town pages
  let faqData = routeFaqData[route];
  if (!faqData) {
    const townMatch = route.match(/^\/(towns|holiday-lights)\/(.+)$/);
    if (townMatch) {
      const slug = townMatch[2];
      const hl = townMatch[1] === 'holiday-lights' ? hlFaqMap[slug] : null;
        const rawFaqs = (hl && hl.length > 0) ? hl : townFaqMap[slug];
      if (rawFaqs && rawFaqs.length > 0) {
        faqData = rawFaqs.map(f => ({ question: f.question, answer: f.answer.replace(/<[^>]*>/g, '') }));
      }
    }
  }
  if (faqData && faqData.length > 0) {
    const faqScript = `<script type="application/ld+json">${buildFaqJsonLd(faqData)}</script>`;
    html = html.replace('</head>', `${faqScript}\n</head>`);
  }

  // Inject BreadcrumbList JSON-LD
  const breadcrumbLd = buildBreadcrumbJsonLd(route);
  if (breadcrumbLd) {
    const bcScript = `<script type="application/ld+json">${breadcrumbLd}</script>`;
    html = html.replace('</head>', `${bcScript}\n</head>`);
  }

  // Write the file
  if (route === '/') {
    // Update the root index.html with content
    fs.writeFileSync(templatePath, html);
    console.log(`✅ Enhanced root with SEO content: ${route}`);
  } else {
    fs.writeFileSync(filePath, html);
    console.log(`✅ Pre-rendered with content: ${route}`);
  }
});

console.log('\n🎉 React SSR pre-rendering complete!');
console.log(`📄 Generated ${routes.length} static pages with SEO-friendly content.`);
console.log('\n🔍 Search engines will now see:');
console.log('   ✓ Full HTML content without JavaScript');
console.log('   ✓ Proper meta tags and titles');
console.log('   ✓ Semantic HTML structure');
console.log('   ✓ Crawlable content for indexing\n');
