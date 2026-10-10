interface Review {
  name: string;
  rating: 5;
  date: string;
  text: string;
  location: string;
}

interface TownReviews {
  [townSlug: string]: Review[];
}

export const defaultReviews: Review[] = [
  {
    name: "Amanda D.",
    rating: 5,
    date: "Oct 2025",
    text: "House looks amazing! J&M soft-washed our colonial — brand new in 4 hours. Highly recommend!",
    location: "Warwick RI"
  },
  {
    name: "Mike R.",
    rating: 5,
    date: "Sep 2025",
    text: "Best roof cleaning ever. Removed 7 years of black streaks with no damage. True pros!",
    location: "Cranston RI"
  },
  {
    name: "Jennifer L.",
    rating: 5,
    date: "Aug 2025",
    text: "Fast, professional, perfect. Driveway and siding spotless. Crew was respectful and thorough!",
    location: "Providence RI"
  }
];

export const townReviews: TownReviews = {
  'warwick-ri': [
    {
      name: "Sarah B.",
      rating: 5,
      date: "Jul 2025",
      text: "They worked with precision and great attention to detail. Our Conimicut home shines!",
      location: "Conimicut, Warwick RI"
    },
    {
      name: "Tom H.",
      rating: 5,
      date: "Jun 2025",
      text: "Great job on our Cowesett colonial roof — algae gone, no damage. Worth every penny.",
      location: "Cowesett, Warwick RI"
    },
    {
      name: "Kelly M.",
      rating: 5,
      date: "May 2025",
      text: "Deck restoration in Apponaug was perfect. Looks brand new!",
      location: "Apponaug, Warwick RI"
    }
  ],
  'cranston-ri': [
    {
      name: "Robert P.",
      rating: 5,
      date: "Oct 2025",
      text: "Excellent job on our Meshanticut raised ranch. Black streaks vanished!",
      location: "Meshanticut, Cranston RI"
    },
    {
      name: "Lisa G.",
      rating: 5,
      date: "Sep 2025",
      text: "Oaklawn driveway sealing + house wash — spotless. Highly recommend J&M!",
      location: "Oaklawn, Cranston RI"
    },
    {
      name: "David K.",
      rating: 5,
      date: "Aug 2025",
      text: "Knightsville roof cleaning saved us thousands. Chris's crew is the best.",
      location: "Knightsville, Cranston RI"
    }
  ],
  'providence-ri': [
    {
      name: "Maria D.",
      rating: 5,
      date: "Oct 2025",
      text: "Federal Hill triple-decker looks incredible after full exterior wash. 10/10!",
      location: "Federal Hill, Providence RI"
    },
    {
      name: "John S.",
      rating: 5,
      date: "Jul 2025",
      text: "East Side Victorian siding restored perfectly. No more mildew!",
      location: "East Side, Providence RI"
    },
    {
      name: "Emily R.",
      rating: 5,
      date: "Jun 2025",
      text: "College Hill roof + gutters — fast and clean. Amazing job!",
      location: "College Hill, Providence RI"
    }
  ],
  'north-smithfield-ri': [
    {
      name: "Paul L.",
      rating: 5,
      date: "Sep 2025",
      text: "Greene St colonial on point — algae gone from Primrose humidity. Unbelievable!",
      location: "Greene St, North Smithfield RI"
    },
    {
      name: "Nancy F.",
      rating: 5,
      date: "Aug 2025",
      text: "Rustic Drive-In area house wash was perfect. Crew left zero mess.",
      location: "Near Rustic Drive-In, North Smithfield RI"
    },
    {
      name: "Mark T.",
      rating: 5,
      date: "Jul 2025",
      text: "Slatersville roof cleaning extended our shingles 10 years. Thanks Chris!",
      location: "Slatersville, North Smithfield RI"
    }
  ],
  'smithfield-ri': [
    {
      name: "Rich F.",
      rating: 5,
      date: "Oct 2025",
      text: "Greenville center house wash — looks brand new.",
      location: "Greenville, Smithfield RI"
    },
    {
      name: "Donna M.",
      rating: 5,
      date: "Sep 2025",
      text: "Stillwater Reservoir roof — moss inhibitor worked!",
      location: "Stillwater, Smithfield RI"
    },
    {
      name: "Bob C.",
      rating: 5,
      date: "Jul 2025",
      text: "Esmond ranch — full exterior perfect.",
      location: "Esmond, Smithfield RI"
    }
  ],
  'woonsocket-ri': [
    {
      name: "Frank D.",
      rating: 5,
      date: "Oct 2025",
      text: "Main St mill house — grime from 50 years gone!",
      location: "Main St, Woonsocket RI"
    },
    {
      name: "Linda P.",
      rating: 5,
      date: "Sep 2025",
      text: "Bernon Heights ranch — roof looks factory new.",
      location: "Bernon Heights, Woonsocket RI"
    },
    {
      name: "Chris N.",
      rating: 5,
      date: "Aug 2025",
      text: "Social district driveway — oil stains vanished.",
      location: "Social, Woonsocket RI"
    }
  ],
  'cumberland-ri': [
    {
      name: "George R.",
      rating: 5,
      date: "Oct 2025",
      text: "Diamond Hill roof moss treatment — perfect execution.",
      location: "Diamond Hill, Cumberland RI"
    },
    {
      name: "Anna S.",
      rating: 5,
      date: "Sep 2025",
      text: "Monastery area colonial wash — spotless.",
      location: "Monastery, Cumberland RI"
    },
    {
      name: "Matt J.",
      rating: 5,
      date: "Jul 2025",
      text: "Valley Falls deck restoration — ready for BBQs.",
      location: "Valley Falls, Cumberland RI"
    }
  ],
  'lincoln-ri': [
    {
      name: "Steve B.",
      rating: 5,
      date: "Oct 2025",
      text: "Limerock quarry area house — dust + algae gone.",
      location: "Limerock, Lincoln RI"
    },
    {
      name: "Karen W.",
      rating: 5,
      date: "Sep 2025",
      text: "Albion roof cleaning — no more green streaks.",
      location: "Albion, Lincoln RI"
    },
    {
      name: "Tony L.",
      rating: 5,
      date: "Aug 2025",
      text: "Manville driveway sealing — held up great.",
      location: "Manville, Lincoln RI"
    }
  ],
  'pawtucket-ri': [
    {
      name: "Jose R.",
      rating: 5,
      date: "Oct 2025",
      text: "Slater Park area triple-decker — full clean amazing.",
      location: "Slater Park, Pawtucket RI"
    },
    {
      name: "Maria L.",
      rating: 5,
      date: "Sep 2025",
      text: "Darlington roof cleaning — saved us thousands.",
      location: "Darlington, Pawtucket RI"
    },
    {
      name: "Kevin P.",
      rating: 5,
      date: "Aug 2025",
      text: "Fairlawn driveway — oil stains gone forever.",
      location: "Fairlawn, Pawtucket RI"
    }
  ],
  'central-falls-ri': [
    {
      name: "Carlos M.",
      rating: 5,
      date: "Sep 2025",
      text: "Dexter St multi-family — all three units cleaned perfectly!",
      location: "Dexter St, Central Falls RI"
    },
    {
      name: "Ana R.",
      rating: 5,
      date: "Aug 2025",
      text: "Broad St triple-decker looks incredible. Best crew ever!",
      location: "Broad St, Central Falls RI"
    },
    {
      name: "Miguel S.",
      rating: 5,
      date: "Jul 2025",
      text: "Fast service near Roosevelt Ave. Very professional!",
      location: "Central Falls RI"
    }
  ],
  'north-providence-ri': [
    {
      name: "Anthony P.",
      rating: 5,
      date: "Oct 2025",
      text: "Fruit Hill roof cleaning — black streaks gone!",
      location: "Fruit Hill, North Providence RI"
    },
    {
      name: "Diane L.",
      rating: 5,
      date: "Sep 2025",
      text: "Centredale house wash was thorough and fast.",
      location: "Centredale, North Providence RI"
    },
    {
      name: "Frank B.",
      rating: 5,
      date: "Aug 2025",
      text: "Marieville area driveway — looks brand new!",
      location: "Marieville, North Providence RI"
    }
  ],
  'east-providence-ri': [
    {
      name: "Patricia G.",
      rating: 5,
      date: "Oct 2025",
      text: "Riverside ranch — siding sparkles after soft wash!",
      location: "Riverside, East Providence RI"
    },
    {
      name: "Daniel F.",
      rating: 5,
      date: "Sep 2025",
      text: "Rumford colonial roof cleaning — worth every penny.",
      location: "Rumford, East Providence RI"
    },
    {
      name: "Michelle T.",
      rating: 5,
      date: "Aug 2025",
      text: "Watchemoket area deck restoration — perfect job!",
      location: "Watchemoket, East Providence RI"
    }
  ],
  'johnston-ri': [
    {
      name: "Vincent R.",
      rating: 5,
      date: "Oct 2025",
      text: "Thornton house wash — removed 10 years of grime!",
      location: "Thornton, Johnston RI"
    },
    {
      name: "Joanne M.",
      rating: 5,
      date: "Sep 2025",
      text: "Graniteville roof cleaning was fast and effective.",
      location: "Graniteville, Johnston RI"
    },
    {
      name: "Robert C.",
      rating: 5,
      date: "Aug 2025",
      text: "North Scituate area — driveway looks amazing!",
      location: "Johnston RI"
    }
  ],
  'west-warwick-ri': [
    {
      name: "Barbara S.",
      rating: 5,
      date: "Oct 2025",
      text: "Arctic area house wash — completely transformed!",
      location: "Arctic, West Warwick RI"
    },
    {
      name: "James H.",
      rating: 5,
      date: "Sep 2025",
      text: "Crompton roof cleaning removed all the algae.",
      location: "Crompton, West Warwick RI"
    },
    {
      name: "Susan P.",
      rating: 5,
      date: "Aug 2025",
      text: "River Point area deck restoration was perfect!",
      location: "River Point, West Warwick RI"
    }
  ],
  'coventry-ri': [
    {
      name: "Donald K.",
      rating: 5,
      date: "Oct 2025",
      text: "Anthony house wash near Mishnock — spotless!",
      location: "Anthony, Coventry RI"
    },
    {
      name: "Carol Ann B.",
      rating: 5,
      date: "Sep 2025",
      text: "Washington area roof cleaning — no more black streaks.",
      location: "Washington, Coventry RI"
    },
    {
      name: "Gary L.",
      rating: 5,
      date: "Aug 2025",
      text: "Hopkins Hill colonial looks brand new!",
      location: "Coventry RI"
    }
  ],
  'foster-ri': [
    {
      name: "Richard M.",
      rating: 5,
      date: "Sep 2025",
      text: "Rural property near Moosup River — deck looks amazing!",
      location: "Foster RI"
    },
    {
      name: "Sharon L.",
      rating: 5,
      date: "Aug 2025",
      text: "Log cabin soft wash was gentle and effective.",
      location: "Foster RI"
    },
    {
      name: "Thomas D.",
      rating: 5,
      date: "Jul 2025",
      text: "Country home roof cleaning — exceeded expectations!",
      location: "Foster RI"
    }
  ],
  'glocester-ri': [
    {
      name: "William P.",
      rating: 5,
      date: "Sep 2025",
      text: "Chepachet area house wash — removed years of mildew!",
      location: "Chepachet, Glocester RI"
    },
    {
      name: "Mary Ellen S.",
      rating: 5,
      date: "Aug 2025",
      text: "Harmony colonial roof cleaning was thorough.",
      location: "Harmony, Glocester RI"
    },
    {
      name: "Charles B.",
      rating: 5,
      date: "Jul 2025",
      text: "Historic home near Barden Reservoir — perfect care!",
      location: "Glocester RI"
    }
  ],
  'burrillville-ri': [
    {
      name: "Joseph F.",
      rating: 5,
      date: "Sep 2025",
      text: "Harrisville mill house — removed 100 years of dirt!",
      location: "Harrisville, Burrillville RI"
    },
    {
      name: "Christine M.",
      rating: 5,
      date: "Aug 2025",
      text: "Pascoag roof cleaning — moss completely gone.",
      location: "Pascoag, Burrillville RI"
    },
    {
      name: "David R.",
      rating: 5,
      date: "Jul 2025",
      text: "Oakland area house wash was professional and fast!",
      location: "Oakland, Burrillville RI"
    }
  ],
  'blackstone-ma': [
    {
      name: "Karen S.",
      rating: 5,
      date: "Oct 2025",
      text: "Capron Park area colonial — moss roof treatment perfect. MA tax included, no surprises!",
      location: "Capron Park, Blackstone MA"
    },
    {
      name: "Edward L.",
      rating: 5,
      date: "Sep 2025",
      text: "Main St historic home soft wash was gentle and effective.",
      location: "Main St, Blackstone MA"
    },
    {
      name: "Janet R.",
      rating: 5,
      date: "Aug 2025",
      text: "Blackstone River area deck — looks brand new!",
      location: "Blackstone MA"
    }
  ],
  'millville-ma': [
    {
      name: "Raymond T.",
      rating: 5,
      date: "Sep 2025",
      text: "Small town, big service! House wash was perfect.",
      location: "Millville MA"
    },
    {
      name: "Deborah K.",
      rating: 5,
      date: "Aug 2025",
      text: "Roof cleaning removed all the algae. Great job!",
      location: "Millville MA"
    },
    {
      name: "Paul M.",
      rating: 5,
      date: "Jul 2025",
      text: "Driveway sealing held up through winter.",
      location: "Millville MA"
    }
  ],
  'uxbridge-ma': [
    {
      name: "Brian L.",
      rating: 5,
      date: "Oct 2025",
      text: "South Uxbridge ranch wash + driveway — oil stains gone forever.",
      location: "South Uxbridge MA"
    },
    {
      name: "Linda S.",
      rating: 5,
      date: "Sep 2025",
      text: "North Main St colonial — black streaks vanished!",
      location: "North Main St, Uxbridge MA"
    },
    {
      name: "Christopher P.",
      rating: 5,
      date: "Aug 2025",
      text: "Whitinsville line area roof cleaning was excellent.",
      location: "Uxbridge MA"
    }
  ],
  'douglas-ma': [
    {
      name: "Sandra W.",
      rating: 5,
      date: "Sep 2025",
      text: "East Douglas house near Webster Lake — perfect wash!",
      location: "East Douglas MA"
    },
    {
      name: "Kenneth R.",
      rating: 5,
      date: "Aug 2025",
      text: "Roof cleaning removed years of moss buildup.",
      location: "Douglas MA"
    },
    {
      name: "Nancy D.",
      rating: 5,
      date: "Jul 2025",
      text: "Deck restoration near Wallum Lake — beautiful!",
      location: "Douglas MA"
    }
  ],
  'northbridge-ma': [
    {
      name: "Gerald M.",
      rating: 5,
      date: "Oct 2025",
      text: "Rockdale area house wash — spotless results!",
      location: "Rockdale, Northbridge MA"
    },
    {
      name: "Catherine F.",
      rating: 5,
      date: "Sep 2025",
      text: "Linwood roof cleaning was fast and thorough.",
      location: "Linwood, Northbridge MA"
    },
    {
      name: "Peter T.",
      rating: 5,
      date: "Aug 2025",
      text: "Church St colonial — looks 20 years younger!",
      location: "Northbridge MA"
    }
  ],
  'whitinsville-ma': [
    {
      name: "Amy R.",
      rating: 5,
      date: "Oct 2025",
      text: "Downtown Whitinsville house looks amazing after soft wash!",
      location: "Whitinsville MA"
    },
    {
      name: "Scott J.",
      rating: 5,
      date: "Sep 2025",
      text: "Church St roof cleaning — no more green moss!",
      location: "Church St, Whitinsville MA"
    },
    {
      name: "Elizabeth H.",
      rating: 5,
      date: "Aug 2025",
      text: "Historic mill house cleaned perfectly. Very careful!",
      location: "Whitinsville MA"
    }
  ],
  'grafton-ma': [
    {
      name: "Timothy B.",
      rating: 5,
      date: "Oct 2025",
      text: "North Grafton colonial — siding sparkles!",
      location: "North Grafton MA"
    },
    {
      name: "Maureen S.",
      rating: 5,
      date: "Sep 2025",
      text: "South Grafton roof cleaning exceeded expectations.",
      location: "South Grafton MA"
    },
    {
      name: "Andrew K.",
      rating: 5,
      date: "Aug 2025",
      text: "Brigham Hill area deck restoration — perfect!",
      location: "Grafton MA"
    }
  ],
  'sutton-ma': [
    {
      name: "Gregory P.",
      rating: 5,
      date: "Oct 2025",
      text: "Wilkinsonville area house wash was thorough.",
      location: "Wilkinsonville, Sutton MA"
    },
    {
      name: "Joyce M.",
      rating: 5,
      date: "Sep 2025",
      text: "Manchaug roof cleaning — algae completely gone!",
      location: "Manchaug, Sutton MA"
    },
    {
      name: "Ronald D.",
      rating: 5,
      date: "Aug 2025",
      text: "Central Turnpike home looks brand new!",
      location: "Sutton MA"
    }
  ],
  'millbury-ma': [
    {
      name: "Kathleen R.",
      rating: 5,
      date: "Oct 2025",
      text: "Elm St house wash — removed years of grime!",
      location: "Elm St, Millbury MA"
    },
    {
      name: "Jeffrey S.",
      rating: 5,
      date: "Sep 2025",
      text: "Main St colonial roof cleaning was perfect.",
      location: "Main St, Millbury MA"
    },
    {
      name: "Cheryl L.",
      rating: 5,
      date: "Aug 2025",
      text: "Near Singletary Lake — deck looks amazing!",
      location: "Millbury MA"
    }
  ],
  'shrewsbury-ma': [
    {
      name: "Douglas W.",
      rating: 5,
      date: "Oct 2025",
      text: "Lake St colonial — soft wash was gentle and effective!",
      location: "Lake St, Shrewsbury MA"
    },
    {
      name: "Judith A.",
      rating: 5,
      date: "Sep 2025",
      text: "Prospect St roof cleaning removed all black streaks.",
      location: "Prospect St, Shrewsbury MA"
    },
    {
      name: "Mark V.",
      rating: 5,
      date: "Aug 2025",
      text: "White City area house wash — excellent results!",
      location: "Shrewsbury MA"
    }
  ],
  'franklin-ma': [
    {
      name: "Michael P.",
      rating: 5,
      date: "Oct 2025",
      text: "Summer Heights new build — siding pristine after soft wash.",
      location: "Summer Heights, Franklin MA"
    },
    {
      name: "Rebecca T.",
      rating: 5,
      date: "Sep 2025",
      text: "Dean College area roof cleaning — no more green moss!",
      location: "Dean College, Franklin MA"
    },
    {
      name: "Greg H.",
      rating: 5,
      date: "Aug 2025",
      text: "Horizon Estates driveway sealing held up through winter.",
      location: "Horizon Estates, Franklin MA"
    }
  ],
  'bellingham-ma': [
    {
      name: "Steven C.",
      rating: 5,
      date: "Oct 2025",
      text: "Center of town colonial — looks incredible!",
      location: "Bellingham MA"
    },
    {
      name: "Barbara J.",
      rating: 5,
      date: "Sep 2025",
      text: "South Bellingham roof cleaning was thorough.",
      location: "South Bellingham MA"
    },
    {
      name: "Kevin M.",
      rating: 5,
      date: "Aug 2025",
      text: "Lake St area house wash — spotless results!",
      location: "Bellingham MA"
    }
  ],
  'wrentham-ma': [
    {
      name: "Margaret L.",
      rating: 5,
      date: "Oct 2025",
      text: "Center of town house wash was perfect!",
      location: "Wrentham MA"
    },
    {
      name: "Philip R.",
      rating: 5,
      date: "Sep 2025",
      text: "Near Wrentham Outlets — roof cleaning exceeded expectations.",
      location: "Wrentham MA"
    },
    {
      name: "Cynthia B.",
      rating: 5,
      date: "Aug 2025",
      text: "Historic colonial soft wash was gentle and effective.",
      location: "Wrentham MA"
    }
  ],
  'plainville-ma': [
    {
      name: "Arthur T.",
      rating: 5,
      date: "Sep 2025",
      text: "Small town with big service! House wash was great.",
      location: "Plainville MA"
    },
    {
      name: "Lorraine H.",
      rating: 5,
      date: "Aug 2025",
      text: "Roof cleaning removed all the algae buildup.",
      location: "Plainville MA"
    },
    {
      name: "Walter K.",
      rating: 5,
      date: "Jul 2025",
      text: "Deck restoration looks brand new!",
      location: "Plainville MA"
    }
  ],
  'north-attleborough-ma': [
    {
      name: "Pamela S.",
      rating: 5,
      date: "Oct 2025",
      text: "Adamsdale area house wash — siding sparkles!",
      location: "Adamsdale, North Attleborough MA"
    },
    {
      name: "Carl W.",
      rating: 5,
      date: "Sep 2025",
      text: "Falls area roof cleaning was excellent.",
      location: "North Attleborough MA"
    },
    {
      name: "Ruth M.",
      rating: 5,
      date: "Aug 2025",
      text: "Near Emerald Square Mall — perfect job!",
      location: "North Attleborough MA"
    }
  ],
  'attleboro-ma': [
    {
      name: "Karen S.",
      rating: 5,
      date: "Oct 2025",
      text: "Capron Park area colonial — moss roof treatment perfect. MA tax included, no surprises!",
      location: "Capron Park, Attleboro MA"
    },
    {
      name: "Brian L.",
      rating: 5,
      date: "Sep 2025",
      text: "South Attleboro ranch wash + driveway — oil stains gone forever.",
      location: "South Attleboro MA"
    },
    {
      name: "Amy R.",
      rating: 5,
      date: "Jul 2025",
      text: "Briggs Corner house looks 20 years younger. J&M is the best!",
      location: "Briggs Corner, Attleboro MA"
    }
  ],
  'mansfield-ma': [
    {
      name: "Harold F.",
      rating: 5,
      date: "Oct 2025",
      text: "Center of town colonial — black streaks gone!",
      location: "Mansfield MA"
    },
    {
      name: "Dorothy G.",
      rating: 5,
      date: "Sep 2025",
      text: "Near Xfinity Center — house wash was perfect.",
      location: "Mansfield MA"
    },
    {
      name: "Larry B.",
      rating: 5,
      date: "Aug 2025",
      text: "Roof cleaning extended our shingle life 10 years!",
      location: "Mansfield MA"
    }
  ],
  'foxboro-ma': [
    {
      name: "Beverly D.",
      rating: 5,
      date: "Oct 2025",
      text: "Near Gillette Stadium — house looks amazing!",
      location: "Foxboro MA"
    },
    {
      name: "Albert R.",
      rating: 5,
      date: "Sep 2025",
      text: "Center of town roof cleaning was thorough.",
      location: "Foxboro MA"
    },
    {
      name: "Helen S.",
      rating: 5,
      date: "Aug 2025",
      text: "Deck restoration before Patriots season — perfect!",
      location: "Foxboro MA"
    }
  ],
  'rehoboth-ma': [
    {
      name: "Eugene P.",
      rating: 5,
      date: "Sep 2025",
      text: "Rural property house wash was excellent!",
      location: "Rehoboth MA"
    },
    {
      name: "Gloria M.",
      rating: 5,
      date: "Aug 2025",
      text: "Roof cleaning removed years of moss buildup.",
      location: "Rehoboth MA"
    },
    {
      name: "Norman L.",
      rating: 5,
      date: "Jul 2025",
      text: "Farm area deck restoration looks brand new!",
      location: "Rehoboth MA"
    }
  ],
  'seekonk-ma': [
    {
      name: "Evelyn K.",
      rating: 5,
      date: "Oct 2025",
      text: "Near RI line — house wash was fast and thorough!",
      location: "Seekonk MA"
    },
    {
      name: "Warren T.",
      rating: 5,
      date: "Sep 2025",
      text: "Route 6 area roof cleaning exceeded expectations.",
      location: "Seekonk MA"
    },
    {
      name: "Frances R.",
      rating: 5,
      date: "Aug 2025",
      text: "North Seekonk colonial looks 20 years younger!",
      location: "North Seekonk MA"
    }
  ],
  'swansea-ma': [
    {
      name: "Raymond H.",
      rating: 5,
      date: "Oct 2025",
      text: "Luther's Corner house wash — spotless!",
      location: "Luther's Corner, Swansea MA"
    },
    {
      name: "Marilyn F.",
      rating: 5,
      date: "Sep 2025",
      text: "Ocean Grove area roof cleaning was perfect.",
      location: "Ocean Grove, Swansea MA"
    },
    {
      name: "Russell B.",
      rating: 5,
      date: "Aug 2025",
      text: "Near Mount Hope Bay — deck looks amazing!",
      location: "Swansea MA"
    }
  ],
  'scituate-ri': [
    {
      name: "Robert H.",
      rating: 5,
      date: "Oct 2025",
      text: "Saved our 1700s colonial! J&M soft-washed our Hope Furnace area home — removed 20 years of moss without touching the historic shingles. True artists!",
      location: "Chopmist Hill, Scituate RI"
    },
    {
      name: "Nancy P.",
      rating: 5,
      date: "Sep 2025",
      text: "Reservoir humidity gone! Black streaks vanished from our North Scituate ranch in 4 hours. Crew respected our land — zero plants hurt.",
      location: "Clayville, Scituate RI"
    },
    {
      name: "Mark T.",
      rating: 5,
      date: "Aug 2025",
      text: "Best in rural RI! Driveway sealing held through winter salt near Ponaganset. J&M is the only one we trust out here.",
      location: "North Scituate RI"
    }
  ],
  'tiverton-ri': [
    {
      name: "Patricia R.",
      rating: 5,
      date: "Oct 2025",
      text: "Coastal farmhouse magic! Salt air was eating our North Tiverton siding—J&M soft-washed it perfectly. No damage to our 200-year-old clapboards!",
      location: "North Tiverton RI"
    },
    {
      name: "David M.",
      rating: 5,
      date: "Sep 2025",
      text: "Nanaquaket Pond area deck looks brand new after 15 years of neglect. Crew was respectful of our orchards and farm animals.",
      location: "Tiverton RI"
    },
    {
      name: "Linda S.",
      rating: 5,
      date: "Aug 2025",
      text: "Stone Bridge waterfront home sparkles! Removed years of bay algae without harming our garden. True professionals.",
      location: "Stone Bridge, Tiverton RI"
    }
  ],
  'north-kingstown-ri': [
    {
      name: "William C.",
      rating: 5,
      date: "Oct 2025",
      text: "Historic Wickford village colonial saved! 1800s home soft-washed—black streaks gone, zero damage to original wood. J&M knows historic homes!",
      location: "Wickford Village, North Kingstown RI"
    },
    {
      name: "Barbara L.",
      rating: 5,
      date: "Sep 2025",
      text: "Saunderstown waterfront estate looks incredible. Bay salt buildup removed from gutters and siding. Professional crew respected our coastal landscaping.",
      location: "Saunderstown, North Kingstown RI"
    },
    {
      name: "James K.",
      rating: 5,
      date: "Aug 2025",
      text: "Near Quonset—military housing community sparkles! Fast, thorough, fair pricing. Best in North Kingstown hands down.",
      location: "Quonset, North Kingstown RI"
    }
  ]
}; // This closes the townReviews object

export function getTownReviews(townSlug: string): Review[] {
  return townReviews[townSlug] || defaultReviews;
}