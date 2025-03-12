// src/data/community.ts
export const communityEngagement = [
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
      cost: 10,
      timeRequired: 1,
      effects: { publicOpinion: +10, money: -10 }
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
      effects: { publicOpinion: +5, knowledge: +5 }
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
      cost: 20,
      timeRequired: 2,
      effects: { publicOpinion: +15, knowledge: +3 }
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
      cost: 25,
      timeRequired: 3,
      effects: { publicOpinion: +20, money: -25 }
    }
  ];
  