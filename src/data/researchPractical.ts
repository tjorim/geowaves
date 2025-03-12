// src/data/researchPractical.ts
export const researchPractical = [
    {
      id: "practical_001",
      name: {
        en: "Exploratory Drilling",
        nl: "Verkennende boringen",
        fr: "Forage exploratoire"
      },
      description: {
        en: "Drill a test well to gather temperature and pressure data.",
        nl: "Boor een testput om temperatuur- en drukgegevens te verzamelen.",
        fr: "Forer un puits test pour collecter des données de température et de pression."
      },
      cost: 30, // Reduced from 40
      timeRequired: 2, // Reduced from 3
      effects: { seismicRisk: +10, knowledge: +20, publicOpinion: -5, money: +15 } // Added money benefit, increased knowledge
    },
    {
      id: "practical_002",
      name: {
        en: "Seismic Monitoring Stations",
        nl: "Seismische monitoringsstations",
        fr: "Stations de surveillance sismique"
      },
      description: {
        en: "Deploy seismic sensors around the area to track activity and improve risk assessment.",
        nl: "Plaats seismische sensoren in het gebied om activiteit te volgen en de risicobeoordeling te verbeteren.",
        fr: "Déployez des capteurs sismiques dans la région pour suivre l'activité et améliorer l'évaluation des risques."
      },
      cost: 20, // Reduced from 30
      timeRequired: 1, // Reduced from 2
      effects: { seismicRisk: -10, knowledge: +12, publicOpinion: +10 } // Increased all benefits
    },
    {
      id: "practical_003",
      name: {
        en: "Pilot Plant Construction",
        nl: "Bouw van een proefinstallatie",
        fr: "Construction d'une usine pilote"
      },
      description: {
        en: "Build a small-scale geothermal plant to test energy production.",
        nl: "Bouw een kleinschalige geothermische centrale om de energieproductie te testen.",
        fr: "Construisez une petite centrale géothermique pour tester la production d'énergie."
      },
      cost: 60,
      timeRequired: 5,
      effects: { knowledge: +30, publicOpinion: +10, seismicRisk: +5 }
    }
  ];
  