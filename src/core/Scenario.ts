// Single source of truth for the running travel-planner story.
// Every module reuses these names so the learner builds one mental model.

export const TRAVELER = {
  name: 'Sam',
  request: 'Plan me a 3-day weekend trip to Lisbon under $500, leaving Friday night.',
  budget: 500,
  prefs: ['window seat', 'vegetarian', 'walking over taxis', 'allergic to seafood']
};

export const TOOLS = [
  { id: 'flights',     label: 'Flights API',       color: 'tool',   short: 'flight_search' },
  { id: 'hotels',      label: 'Hotels API',        color: 'tool',   short: 'hotel_search' },
  { id: 'weather',     label: 'Weather API',       color: 'tool',   short: 'weather' },
  { id: 'attractions', label: 'Attractions DB',    color: 'rag',    short: 'attractions' },
  { id: 'restaurants', label: 'Restaurants API',   color: 'tool',   short: 'restaurants' },
  { id: 'budget',      label: 'Budget Tracker',    color: 'accent', short: 'budget' },
  { id: 'calendar',    label: 'Calendar',          color: 'agent',  short: 'calendar' },
  { id: 'maps',        label: 'Maps / Transit',    color: 'tool',   short: 'maps' }
];

export const MEMORY_NOTES = {
  short: [
    'Current request: Lisbon, 3 days, $500',
    'Just fetched: 12 flights, cheapest $180',
    'User confirmed: leave Friday night'
  ],
  longHits: [
    'Tokyo trip (last March): user upgraded to window seat',
    'Always vegetarian — flagged on 4 past trips',
    'Seafood allergy noted in profile since 2024'
  ],
  longMisses: [
    'Berlin business trip (different traveler)',
    'A spam booking from 2019',
    'Cancelled Paris trip — irrelevant'
  ]
};

export const RAG_DOCS = [
  { id: 'd1', title: 'Lisbon neighborhood guide', good: true,  keywords: ['Alfama', 'Bairro Alto', 'tram 28'] },
  { id: 'd2', title: 'Vegetarian restaurants in Lisbon', good: true,  keywords: ['vegan', 'plant-based'] },
  { id: 'd3', title: 'Travel insurance terms 2025',  good: true,  keywords: ['cancellation', 'refund'] },
  { id: 'd4', title: 'Best beaches near Lisbon',     good: true,  keywords: ['Cascais', 'Costa da Caparica'] },
  { id: 'd5', title: 'Tokyo travel guide',           good: false, keywords: ['shrines', 'sushi'] },
  { id: 'd6', title: 'How to renew a US passport',   good: false, keywords: ['passport'] },
  { id: 'd7', title: 'Generic packing checklist',    good: false, keywords: ['toothbrush'] },
  { id: 'd8', title: 'Lisbon airport transfer SOP',  good: true,  keywords: ['Aerobus', 'metro'] },
  { id: 'd9', title: 'Berlin nightlife (irrelevant)',good: false, keywords: ['clubs'] },
  { id: 'd10', title: 'Lisbon weather in March',     good: true,  keywords: ['rain', '15C'] }
];

export const SAMPLE_FLIGHTS = [
  { id: 'F1', route: 'JFK → LIS', price: 380, time: '7h 20m', vendor: 'TAP' },
  { id: 'F2', route: 'JFK → LIS', price: 295, time: '9h 05m', vendor: 'Iberia' },
  { id: 'F3', route: 'EWR → LIS', price: 420, time: '6h 45m', vendor: 'United' }
];

export const SAMPLE_HOTELS = [
  { id: 'H1', name: 'Hostel Alfama',     pricePerNight: 38, rating: 4.4, vegOK: true },
  { id: 'H2', name: 'Bairro Boutique',   pricePerNight: 72, rating: 4.6, vegOK: true },
  { id: 'H3', name: 'LX Riverside',      pricePerNight: 120, rating: 4.7, vegOK: false }
];

// One color = one meaning, applied everywhere (game-UI clarity rule).
export const SEMANTIC_COLORS = {
  user:    '#fbbf24', // user/request — warm gold
  agent:   '#c084fc', // agent brain — purple
  chatbot: '#94a3b8', // plain chatbot — gray
  tool:    '#38bdf8', // external tools — cyan
  memory:  '#f472b6', // memory — pink
  rag:     '#34d399', // RAG / knowledge — green
  good:    '#4ade80',
  bad:     '#ef4444',
  warn:    '#fbbf24'
};
