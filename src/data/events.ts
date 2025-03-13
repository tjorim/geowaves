// src/data/events.ts

/**
 * Interface defining the standardized structure for event effects
 * All possible effect properties must be included in every event object
 */
export interface EventEffects {
  publicOpinion: number;
  seismicRisk: number;
  money: number;
  time: number;
}

/**
 * Enum for event categories to ensure consistent typing
 */
export enum EventCategory {
  Seismic = "Seismic",
  Community = "Community", 
  Financial = "Financial",
  Environmental = "Environmental",
  Regulatory = "Regulatory"
}

/**
 * Type for event IDs using a template literal to validate format
 * All event IDs must follow the pattern "event_XXX" where XXX is a three-digit number
 */
export type EventId = `event_${string}`;

/**
 * Interface for game events with consistent structure and validation
 */
export interface GameEvent {
  id: EventId;
  category: EventCategory;
  description: {
    en: string;
    nl: string;
    fr: string;
  };
  effects: EventEffects;
}

/**
 * Seismic events - related to earthquake and tremor activity
 */
export const SEISMIC_EVENTS: GameEvent[] = [
  {
    id: "event_001",
    category: EventCategory.Seismic,
    description: {
      en: "Minor tremor detected near the drilling site. Some local residents are worried.",
      nl: "Kleine aardbeving gedetecteerd nabij de boorlocatie. Sommige inwoners maken zich zorgen.",
      fr: "Légère secousse détectée près du site de forage. Certains habitants sont inquiets."
    },
    effects: { publicOpinion: -5, seismicRisk: 5, money: 0, time: 0 }
  },
  {
    id: "event_002",
    category: EventCategory.Seismic,
    description: {
      en: "Seismic activity increases slightly due to drilling operations. Regulators demand a pause.",
      nl: "Seismische activiteit neemt licht toe door de boorwerkzaamheden. Regelgevers eisen een pauze.",
      fr: "L'activité sismique augmente légèrement en raison du forage. Les régulateurs demandent une pause."
    },
    effects: { publicOpinion: -10, seismicRisk: 10, money: 0, time: 2 }
  },
  {
    id: "event_003",
    category: EventCategory.Seismic,
    description: {
      en: "A small earthquake shakes the region. The media amplifies concerns, impacting public trust.",
      nl: "Een kleine aardbeving schudt de regio. De media vergroten de zorgen, wat het vertrouwen van het publiek beïnvloedt.",
      fr: "Un petit tremblement de terre secoue la région. Les médias amplifient les préoccupations, affectant la confiance du public."
    },
    effects: { publicOpinion: -15, seismicRisk: 5, money: -10, time: 0 }
  }
];

/**
 * Community events - related to public perception and relations
 */
export const COMMUNITY_EVENTS: GameEvent[] = [
  {
    id: "event_004",
    category: EventCategory.Community,
    description: {
      en: "A misinformation campaign spreads rumors about the dangers of geothermal energy.",
      nl: "Een desinformatiecampagne verspreidt geruchten over de gevaren van geothermische energie.",
      fr: "Une campagne de désinformation diffuse des rumeurs sur les dangers de l'énergie géothermique."
    },
    effects: { publicOpinion: -10, seismicRisk: 0, money: -5, time: 0 }
  },
  {
    id: "event_005",
    category: EventCategory.Community,
    description: {
      en: "A major environmental group endorses your project after a successful outreach campaign.",
      nl: "Een grote milieuorganisatie steunt uw project na een succesvolle voorlichtingscampagne.",
      fr: "Un grand groupe environnemental soutient votre projet après une campagne de sensibilisation réussie."
    },
    effects: { publicOpinion: 15, seismicRisk: 0, money: 10, time: 0 }
  },
  {
    id: "event_006",
    category: EventCategory.Community,
    description: {
      en: "An outspoken politician criticizes your project, raising concerns in the media.",
      nl: "Een uitgesproken politicus bekritiseert uw project, wat zorgen oproept in de media.",
      fr: "Un politicien influent critique votre projet, suscitant des inquiétudes dans les médias."
    },
    effects: { publicOpinion: -20, seismicRisk: 0, money: -5, time: 1 }
  },
  {
    id: "event_014",
    category: EventCategory.Community,
    description: {
      en: "Local school requests educational tour of your facility.",
      nl: "Lokale school vraagt om educatieve rondleiding door uw faciliteit.",
      fr: "Une école locale demande une visite éducative de votre installation."
    },
    effects: { publicOpinion: 15, seismicRisk: 0, money: -5, time: 0 }
  }
];

/**
 * Financial events - related to funding and budget impacts
 */
export const FINANCIAL_EVENTS: GameEvent[] = [
  {
    id: "event_007",
    category: EventCategory.Financial,
    description: {
      en: "Unexpected funding boost from an environmental NGO supporting renewable energy.",
      nl: "Onverwachte financieringsboost van een milieu-NGO die hernieuwbare energie steunt.",
      fr: "Un financement inattendu d'une ONG environnementale soutenant les énergies renouvelables."
    },
    effects: { publicOpinion: 10, seismicRisk: 0, money: 40, time: 0 }
  },
  {
    id: "event_008",
    category: EventCategory.Financial,
    description: {
      en: "Budget overruns due to unexpected drilling costs.",
      nl: "Budgetoverschrijdingen door onverwachte boorkosten.",
      fr: "Dépassement du budget en raison de coûts de forage imprévus."
    },
    effects: { publicOpinion: -5, seismicRisk: 0, money: -20, time: 0 }
  },
  {
    id: "event_013",
    category: EventCategory.Financial,
    description: {
      en: "Local business consortium offers funding in exchange for future energy credits.",
      nl: "Lokaal bedrijvenconsortium biedt financiering in ruil voor toekomstige energiekredieten.",
      fr: "Un consortium d'entreprises locales offre un financement en échange de crédits d'énergie futurs."
    },
    effects: { publicOpinion: 5, seismicRisk: 0, money: 35, time: 0 }
  }
];

/**
 * Environmental events - related to ecological impacts
 */
export const ENVIRONMENTAL_EVENTS: GameEvent[] = [
  {
    id: "event_009",
    category: EventCategory.Environmental,
    description: {
      en: "A local water source shows slight contamination, requiring additional testing.",
      nl: "Een lokale waterbron toont lichte vervuiling, wat extra testen vereist.",
      fr: "Une source d'eau locale présente une légère contamination, nécessitant des tests supplémentaires."
    },
    effects: { publicOpinion: -10, seismicRisk: 0, money: -15, time: 1 }
  },
  {
    id: "event_010",
    category: EventCategory.Environmental,
    description: {
      en: "Wildlife in the area is affected by geothermal exploration, raising concerns from environmentalists.",
      nl: "Het wild in de omgeving wordt beïnvloed door geothermische exploratie, wat zorgen oproept bij milieuactivisten.",
      fr: "La faune locale est affectée par l'exploration géothermique, suscitant des préoccupations chez les écologistes."
    },
    effects: { publicOpinion: -10, seismicRisk: 0, money: 0, time: 0 }
  }
];

/**
 * Regulatory events - related to government and compliance requirements
 */
export const REGULATORY_EVENTS: GameEvent[] = [
  {
    id: "event_011",
    category: EventCategory.Regulatory,
    description: {
      en: "The government introduces new safety regulations, increasing costs but ensuring safety.",
      nl: "De overheid introduceert nieuwe veiligheidsvoorschriften, wat de kosten verhoogt maar de veiligheid garandeert.",
      fr: "Le gouvernement introduit de nouvelles réglementations de sécurité, augmentant les coûts mais garantissant la sécurité."
    },
    effects: { publicOpinion: 5, seismicRisk: -10, money: -10, time: 2 }
  },
  {
    id: "event_012",
    category: EventCategory.Regulatory,
    description: {
      en: "Regulatory approval is delayed due to missing environmental impact reports.",
      nl: "Regelgevende goedkeuring is vertraagd vanwege ontbrekende milieueffectrapporten.",
      fr: "L'approbation réglementaire est retardée en raison de l'absence de rapports d'impact environnemental."
    },
    effects: { publicOpinion: -5, seismicRisk: 0, money: -10, time: 2 }
  }
];

/**
 * Helper function to get a weighted random selection of events based on game state
 * @param options Object containing weighted event arrays
 * @returns Array of GameEvent objects with proper weighting
 */
export function getWeightedEvents(options: {
  seismic?: number;   // Weight for seismic events (default: 1)
  community?: number; // Weight for community events (default: 1)
  financial?: number; // Weight for financial events (default: 1)
  environmental?: number; // Weight for environmental events (default: 1)
  regulatory?: number; // Weight for regulatory events (default: 1)
}): GameEvent[] {
  const weights = {
    seismic: options.seismic || 1,
    community: options.community || 1,
    financial: options.financial || 1,
    environmental: options.environmental || 1,
    regulatory: options.regulatory || 1
  };
  
  const events: GameEvent[] = [];
  
  // Add each category according to its weight
  for (let i = 0; i < weights.seismic; i++) {
    events.push(...SEISMIC_EVENTS);
  }
  
  for (let i = 0; i < weights.community; i++) {
    events.push(...COMMUNITY_EVENTS);
  }
  
  for (let i = 0; i < weights.financial; i++) {
    events.push(...FINANCIAL_EVENTS);
  }
  
  for (let i = 0; i < weights.environmental; i++) {
    events.push(...ENVIRONMENTAL_EVENTS);
  }
  
  for (let i = 0; i < weights.regulatory; i++) {
    events.push(...REGULATORY_EVENTS);
  }
  
  return events;
}

/**
 * Combined array of all game events with standardized effect properties
 */
export const events: GameEvent[] = [
  ...SEISMIC_EVENTS,
  ...COMMUNITY_EVENTS,
  ...FINANCIAL_EVENTS, 
  ...ENVIRONMENTAL_EVENTS,
  ...REGULATORY_EVENTS
];
  