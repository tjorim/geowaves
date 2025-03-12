// src/data/community.ts
import { ActionData } from '../ui/ActionOption';

/**
 * Array of community engagement actions available to the player
 */
export const communityEngagement: ActionData[] = [
    {
      id: "community_001",
      name: {
        en: "Public Information Session",
        nl: "Informatiesessie voor het publiek",
        fr: "Session d'information publique"
      },
      description: {
        en: "Hold a community meeting to address concerns and answer questions.",
        nl: "Houd een bijeenkomst voor de gemeenschap om zorgen te bespreken en vragen te beantwoorden.",
        fr: "Organisez une réunion communautaire pour répondre aux préoccupations et aux questions."
      },
      cost: 5, // Reduced from 10
      timeRequired: 1,
      effects: { publicOpinion: 15, money: 0, seismicRisk: 0, knowledge: 0 } // Added missing properties, removed + sign
    },
    {
      id: "community_002",
      name: {
        en: "Educational Workshops",
        nl: "Educatieve workshops",
        fr: "Ateliers éducatifs"
      },
      description: {
        en: "Develop and distribute materials about geothermal energy.",
        nl: "Ontwikkel en verspreid materialen over geothermische energie.",
        fr: "Développez et distribuez du matériel sur l'énergie géothermique."
      },
      cost: 15,
      timeRequired: 2,
      effects: { publicOpinion: 5, knowledge: 5, seismicRisk: 0, money: 0 } // Added missing properties, removed + signs
    },
    {
      id: "community_003",
      name: {
        en: "Media Outreach Campaign",
        nl: "Mediacampagne",
        fr: "Campagne médiatique"
      },
      description: {
        en: "Launch a positive PR campaign to counter misinformation.",
        nl: "Start een positieve PR-campagne om desinformatie te bestrijden.",
        fr: "Lancez une campagne de relations publiques pour contrer la désinformation."
      },
      cost: 15, // Reduced from 20
      timeRequired: 1, // Reduced from 2
      effects: { publicOpinion: 20, knowledge: 5, money: 5, seismicRisk: 0 } // Added missing seismicRisk, removed + signs
    },
    {
      id: "community_004",
      name: {
        en: "Local Hiring and Training",
        nl: "Lokale aanwerving en training",
        fr: "Recrutement et formation locale"
      },
      description: {
        en: "Provide job opportunities and training for local residents.",
        nl: "Bied werkgelegenheid en training aan lokale inwoners.",
        fr: "Offrez des opportunités d'emploi et de formation aux résidents locaux."
      },
      cost: 20, // Reduced from 25
      timeRequired: 2, // Reduced from 3
      effects: { publicOpinion: 25, money: -10, knowledge: 5, seismicRisk: 0 } // Added missing seismicRisk, removed + signs
    },
    {
      id: "community_005",
      name: {
        en: "Government Partnership",
        nl: "Partnerschap met de overheid",
        fr: "Partenariat gouvernemental"
      },
      description: {
        en: "Establish formal partnership with local government for project support.",
        nl: "Breng een formeel partnerschap tot stand met de lokale overheid voor projectsteun.",
        fr: "Établir un partenariat formel avec le gouvernement local pour le soutien au projet."
      },
      cost: 30,
      timeRequired: 2,
      effects: { publicOpinion: 15, money: 30, seismicRisk: -5, knowledge: 0 } // Added missing knowledge, removed + signs
    }
  ];
  