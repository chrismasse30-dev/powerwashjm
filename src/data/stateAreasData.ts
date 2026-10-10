export type ServiceKey = 'washing' | 'holiday';

export interface CountyGroup { county: string; slugs: string[]; }

export const countyGroups: Record<string, CountyGroup[]> = {
  RI: [
    { county: 'Providence County', slugs: ['providence-ri','cranston-ri','pawtucket-ri','east-providence-ri','woonsocket-ri','cumberland-ri','lincoln-ri','smithfield-ri','north-smithfield-ri','johnston-ri','north-providence-ri','central-falls-ri','scituate-ri','glocester-ri','foster-ri','burrillville-ri'] },
    { county: 'Kent County', slugs: ['warwick-ri','west-warwick-ri','coventry-ri','east-greenwich-ri','west-greenwich-ri'] },
    { county: 'Bristol County', slugs: ['bristol-ri','barrington-ri'] },
    { county: 'Newport County', slugs: ['tiverton-ri'] },
    { county: 'Washington County', slugs: ['north-kingstown-ri'] }
  ],
  MA: [
    { county: 'Worcester County and the Blackstone Valley', slugs: ['blackstone-ma','millville-ma','uxbridge-ma','douglas-ma','northbridge-ma','grafton-ma','sutton-ma','millbury-ma','shrewsbury-ma'] },
    { county: 'Norfolk County', slugs: ['franklin-ma','bellingham-ma','wrentham-ma','plainville-ma','foxboro-ma'] },
    { county: 'Bristol County', slugs: ['attleboro-ma','north-attleboro-ma','south-attleboro-ma','mansfield-ma','norton-ma','seekonk-ma','rehoboth-ma','swansea-ma'] }
  ]
};

export interface StateCopy {
  name: string;
  abbr: string;
  washingTitle: string;
  washingDescription: string;
  washingIntro: string;
  washingContext: string;
  holidayTitle: string;
  holidayDescription: string;
  holidayIntro: string;
  holidayContext: string;
  coverageNote: string;
}

export const stateCopy: Record<string, StateCopy> = {
  RI: {
    name: 'Rhode Island',
    abbr: 'RI',
    washingTitle: 'Power Washing in Rhode Island | House & Roof Cleaning Statewide | J&M',
    washingDescription: 'Professional power washing across Rhode Island. Soft wash house washing, roof cleaning, gutter brightening, deck restoration and concrete cleaning.',
    washingIntro: 'J and M Power Washing is a family owned exterior cleaning company based in Johnston, Rhode Island. We soft wash homes, clean roofs, brighten gutters, restore decks and pressure wash concrete for homeowners and property managers across the state, from the coastal neighborhoods of Bristol and Barrington to the rural roads of Foster and Burrillville. Every job is quoted in writing within 24 hours and carried out by our own insured crews, never subcontractors.',
    washingContext: 'Rhode Island puts a specific kind of wear on a house. Salt air off Narragansett Bay accelerates staining on south and east facing walls, humid summers feed the black algae streaks that show up on north facing asphalt roofs, and long wet springs leave green organic growth on siding, walkways and retaining walls. Because the entire state sits within about a 45 minute drive of our Johnston shop, we can schedule tightly and return quickly if weather moves a job.',
    holidayTitle: 'Christmas Light Installation in Rhode Island | Holiday Lighting RI',
    holidayDescription: 'Professional Christmas light installation across Rhode Island. Custom design, commercial grade lights, seasonal maintenance, takedown and storage included.',
    holidayIntro: 'We design and install professional Christmas light displays throughout Rhode Island. Our holiday lighting service is fully managed, which means we handle the design, supply commercial grade LED lights and clips, install everything on your roofline, trees, columns and walkways, maintain the display all season, then remove and store it after the holidays. Nothing is stapled, nailed or left behind on your home.',
    holidayContext: 'Rhode Island housing stock ranges from tightly packed triple deckers in Providence, Pawtucket and Central Falls to sprawling colonials in East Greenwich and farmhouses in Scituate and Glocester. Each roofline calls for a different clip and a different approach to power routing. Because our crews work across the whole state every season, we know which displays read well from the street on a narrow city lot and which need extra height to be seen from a long rural driveway.',
    coverageNote: 'We serve every community listed below with our own crews. If your Rhode Island town is not on the list, call us anyway at 401-595-0726 and we will tell you honestly whether we can reach you.'
  },
  MA: {
    name: 'Massachusetts',
    abbr: 'MA',
    washingTitle: 'Power Washing in Massachusetts | Blackstone Valley & Norfolk County',
    washingDescription: 'Professional power washing in 22 central and southeastern Massachusetts towns. Soft wash house washing, roof cleaning, gutter brightening and deck cleaning.',
    washingIntro: 'J and M Power Washing crosses the state line every week. From our base in Johnston, Rhode Island we serve a defined group of Massachusetts communities in the Blackstone Valley, Norfolk County and the Attleboro area. We are not a statewide Massachusetts contractor and we do not claim to be. The towns listed below are the ones our crews actually cover, which keeps our scheduling tight and our travel time short.',
    washingContext: 'Central and southeastern Massachusetts share the same weather that stains Rhode Island homes, but the housing stock skews older. Mill era homes in Uxbridge, Northbridge and Blackstone often have original clapboard or cedar that cannot take pressure, so almost everything we do there is a low pressure soft wash. Newer subdivisions in Franklin, Wrentham and Plainville tend to need roof treatment more than siding work, because mature tree cover keeps north facing shingles damp.',
    holidayTitle: 'Christmas Light Installation in Massachusetts | Holiday Lighting MA',
    holidayDescription: 'Professional Christmas light installation in select Massachusetts towns including Douglas, Blackstone, Bellingham, Uxbridge and Wrentham. Design to takedown.',
    holidayIntro: 'Our holiday lighting crews cross into Massachusetts each season for a focused group of towns along the Rhode Island border and up through the Blackstone Valley. Holiday light installation covers a smaller footprint than our power washing service because the work is time sensitive. Every display has to go up in a narrow window between November and early December, be maintained through the season, and come down after the holidays, so we keep the service area tight enough to guarantee response times.',
    holidayContext: 'Massachusetts holiday installs bring their own challenges. Antique homes in Uxbridge and Blackstone often have slate or steep gable rooflines that need specialized clips rather than gutter hooks. Newer construction in Bellingham and Wrentham usually has deep setbacks, so displays need to be scaled up and aimed to read from the road. We also handle commercial storefronts and town greens in these communities, which typically book earlier than residential work.',
    coverageNote: 'Massachusetts is a large state and we deliberately serve only part of it. The towns listed below are the ones we cover. If you do not see your town, call 401-595-0726 before assuming we cannot help, but know that we will tell you plainly if you fall outside our range.'
  }
};

export interface StateFAQ { question: string; answer: string; }

export const stateFAQs: Record<string, StateFAQ[]> = {
  'washing-RI': [
    { question: 'Do you power wash the entire state of Rhode Island?', answer: 'Yes. We cover all of the Rhode Island communities listed on this page with our own insured crews. Rhode Island is compact enough that every town sits within roughly a 45 minute drive of our Johnston base, so scheduling stays tight and we can return quickly if weather moves a job.' },
    { question: 'What is the best time of year to power wash a Rhode Island home?', answer: 'Late April through October is ideal. We need overnight temperatures above freezing for our cleaning solutions to work properly, and spring is when winter salt, pollen and organic growth are at their worst. Roof treatments can run later into the fall because they do not depend on heavy rinsing.' },
    { question: 'Do you soft wash or pressure wash siding?', answer: 'Siding is always soft washed. We apply a low pressure cleaning solution that kills algae and mildew at the root, then rinse gently. High pressure is reserved for concrete, brick and some composite decking. Pressure on vinyl, cedar or painted clapboard forces water behind the siding and can void manufacturer warranties.' },
    { question: 'Are you insured to work in Rhode Island?', answer: 'Yes. We are fully insured with over 2 million dollars in liability coverage. We can send a certificate of insurance directly to you, your property manager or your condominium association before work begins.' }
  ],
  'washing-MA': [
    { question: 'Which Massachusetts towns do you power wash?', answer: 'We serve 22 Massachusetts communities grouped across the Blackstone Valley and Worcester County, Norfolk County, and the Attleboro area of Bristol County. Every town we cover is listed by county on this page. We are not a statewide Massachusetts company, so that list is the complete and current picture of where our crews go.' },
    { question: 'Do you charge extra to travel into Massachusetts?', answer: 'Some Massachusetts addresses at the outer edge of our range carry a travel adjustment because of drive time. It is shown transparently on your written estimate rather than added later, and border towns such as Blackstone, Bellingham, Attleboro and Seekonk are generally priced the same as our Rhode Island work.' },
    { question: 'My Massachusetts home is over a hundred years old. Can it be washed safely?', answer: 'Yes, and it should be soft washed rather than pressure washed. Mill era homes in Uxbridge, Northbridge, Blackstone and Millville often have original clapboard or cedar shingle and older paint layers. We use low pressure and adjust solution strength, and if the existing paint is already failing we will tell you before we start.' },
    { question: 'Do you clean roofs in Massachusetts?', answer: 'Yes. Roof cleaning is one of our most requested Massachusetts services because heavy tree cover through the Blackstone Valley keeps north facing shingles damp and streaked. We apply a manufacturer approved treatment with no pressure and stay off the shingles wherever the roof pitch allows.' }
  ],
  'holiday-RI': [
    { question: 'Do you install Christmas lights anywhere in Rhode Island?', answer: 'Yes. Our holiday lighting service covers every Rhode Island community listed on this page. Because the installation season is short, we book on a first come basis starting in late summer and the most popular weekends fill first.' },
    { question: 'When should I book Rhode Island holiday light installation?', answer: 'As early as you can. We begin taking bookings in late summer, start installing in November, and aim to have every residential display lit before the first week of December. Commercial and municipal displays are scheduled earliest because they are usually tied to a specific event date.' },
    { question: 'What is included in a Rhode Island holiday lighting package?', answer: 'Everything. We design the display, supply commercial grade LED lights and the correct clips for your roofline, install it, maintain it through the season including bulb and cord failures, then remove it after the holidays and store it until next year. You never buy or store any equipment.' },
    { question: 'Do you take the lights down and store them?', answer: 'Yes. Removal is included in every installation. We take the display down in January, inspect it, and store it in our own facility so it is ready for the following season. Nothing is left on your roofline and there are no holes, staples or nails in your home.' },
    { question: 'How much does holiday light installation cost in Rhode Island?', answer: 'Most residential installations range from 500 to 2,500 dollars depending on the size of your home and the complexity of your roofline. Every quote is free and includes design, lights, installation, seasonal maintenance, removal and storage.' }
  ],
  'holiday-MA': [
    { question: 'Which Massachusetts towns do you install Christmas lights in?', answer: 'Our holiday lighting service currently covers Douglas, Blackstone, Bellingham, Uxbridge and Wrentham. That is a shorter list than our Massachusetts power washing coverage, because holiday installation has to happen inside a short seasonal window and we keep the area tight to protect response times.' },
    { question: 'Why is your Massachusetts holiday coverage smaller than your washing coverage?', answer: 'Power washing runs from spring through autumn, so we can absorb longer drives. Holiday light installation has to be designed, installed, maintained and removed within a few weeks, and a service call for a failed cord needs to be answered quickly. Keeping the Massachusetts holiday footprint focused is how we guarantee that.' },
    { question: 'Can you light a commercial property or town green in Massachusetts?', answer: 'Yes. We install for storefronts, offices, condominium associations and municipal properties in the Massachusetts towns we cover. Commercial work is scheduled ahead of residential because those displays are usually tied to a specific lighting event or opening date.' },
    { question: 'What if my Massachusetts town is not on the holiday list?', answer: 'Call us at 401-595-0726. If you are close to a town we already service we may be able to add you, especially if neighbors are interested as well. If you fall outside our range we will say so rather than take a booking we cannot service properly.' },
    { question: 'Do you install on antique or slate rooflines?', answer: 'Yes. Older Massachusetts homes in Uxbridge and Blackstone often have slate, steep gables or no gutters to hook onto. We use clip systems matched to the roof material rather than forcing a standard gutter hook, and we never staple or nail into your home.' }
  ]
};

