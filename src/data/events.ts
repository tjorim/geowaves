// src/data/events.ts
export const events = [
    // Seismic Events
    {
      id: "event_001",
      category: "Seismic",
      description: {
        en: "Minor tremor detected near the drilling site. Some local residents are worried.",
        nl: "Kleine aardbeving gedetecteerd nabij de boorlocatie. Sommige inwoners maken zich zorgen.",
        fr: "Légère secousse détectée près du site de forage. Certains habitants sont inquiets."
      },
      effects: { publicOpinion: -5, seismicRisk: +5, money: 0, time: 0 }
    },
    {
      id: "event_002",
      category: "Seismic",
      description: {
        en: "Seismic activity increases slightly due to drilling operations. Regulators demand a pause.",
        nl: "Seismische activiteit neemt licht toe door de boorwerkzaamheden. Regelgevers eisen een pauze.",
        fr: "L'activité sismique augmente légèrement en raison du forage. Les régulateurs demandent une pause."
      },
      effects: { publicOpinion: -10, seismicRisk: +10, time: +2 }
    },
    {
      id: "event_003",
      category: "Seismic",
      description: {
        en: "A small earthquake shakes the region. The media amplifies concerns, impacting public trust.",
        nl: "Een kleine aardbeving schudt de regio. De media vergroten de zorgen, wat het vertrouwen van het publiek beïnvloedt.",
        fr: "Un petit tremblement de terre secoue la région. Les médias amplifient les préoccupations, affectant la confiance du public."
      },
      effects: { publicOpinion: -15, seismicRisk: +5, money: -10 }
    },
  
    // Community Engagement Events
    {
      id: "event_004",
      category: "Community",
      description: {
        en: "A misinformation campaign spreads rumors about the dangers of geothermal energy.",
        nl: "Een desinformatiecampagne verspreidt geruchten over de gevaren van geothermische energie.",
        fr: "Une campagne de désinformation diffuse des rumeurs sur les dangers de l'énergie géothermique."
      },
      effects: { publicOpinion: -10, money: -5, time: 0 }
    },
    {
      id: "event_005",
      category: "Community",
      description: {
        en: "A major environmental group endorses your project after a successful outreach campaign.",
        nl: "Een grote milieuorganisatie steunt uw project na een succesvolle voorlichtingscampagne.",
        fr: "Un grand groupe environnemental soutient votre projet après une campagne de sensibilisation réussie."
      },
      effects: { publicOpinion: +15, money: +10, seismicRisk: 0 }
    },
    {
      id: "event_006",
      category: "Community",
      description: {
        en: "An outspoken politician criticizes your project, raising concerns in the media.",
        nl: "Een uitgesproken politicus bekritiseert uw project, wat zorgen oproept in de media.",
        fr: "Un politicien influent critique votre projet, suscitant des inquiétudes dans les médias."
      },
      effects: { publicOpinion: -20, time: +1, money: -5 }
    },
  
    // Financial Events
    {
      id: "event_007",
      category: "Financial",
      description: {
        en: "Unexpected funding boost from an environmental NGO supporting renewable energy.",
        nl: "Onverwachte financieringsboost van een milieu-NGO die hernieuwbare energie steunt.",
        fr: "Un financement inattendu d'une ONG environnementale soutenant les énergies renouvelables."
      },
      effects: { money: +20, publicOpinion: +5, seismicRisk: 0, time: 0 }
    },
    {
      id: "event_008",
      category: "Financial",
      description: {
        en: "Budget overruns due to unexpected drilling costs.",
        nl: "Budgetoverschrijdingen door onverwachte boorkosten.",
        fr: "Dépassement du budget en raison de coûts de forage imprévus."
      },
      effects: { money: -30, publicOpinion: -5, time: 0 }
    },
  
    // Environmental Events
    {
      id: "event_009",
      category: "Environmental",
      description: {
        en: "A local water source shows slight contamination, requiring additional testing.",
        nl: "Een lokale waterbron toont lichte vervuiling, wat extra testen vereist.",
        fr: "Une source d'eau locale présente une légère contamination, nécessitant des tests supplémentaires."
      },
      effects: { money: -15, publicOpinion: -10, seismicRisk: 0, time: +1 }
    },
    {
      id: "event_010",
      category: "Environmental",
      description: {
        en: "Wildlife in the area is affected by geothermal exploration, raising concerns from environmentalists.",
        nl: "Het wild in de omgeving wordt beïnvloed door geothermische exploratie, wat zorgen oproept bij milieuactivisten.",
        fr: "La faune locale est affectée par l'exploration géothermique, suscitant des préoccupations chez les écologistes."
      },
      effects: { publicOpinion: -10, time: 0, seismicRisk: 0 }
    },
  
    // Regulatory Events
    {
      id: "event_011",
      category: "Regulatory",
      description: {
        en: "The government introduces new safety regulations, increasing costs but ensuring safety.",
        nl: "De overheid introduceert nieuwe veiligheidsvoorschriften, wat de kosten verhoogt maar de veiligheid garandeert.",
        fr: "Le gouvernement introduit de nouvelles réglementations de sécurité, augmentant les coûts mais garantissant la sécurité."
      },
      effects: { money: -10, seismicRisk: -10, publicOpinion: +5, time: +2 }
    },
    {
      id: "event_012",
      category: "Regulatory",
      description: {
        en: "Regulatory approval is delayed due to missing environmental impact reports.",
        nl: "Regelgevende goedkeuring is vertraagd vanwege ontbrekende milieueffectrapporten.",
        fr: "L'approbation réglementaire est retardée en raison de l'absence de rapports d'impact environnemental."
      },
      effects: { time: +3, money: -10, publicOpinion: -5 }
    }
  ];
  