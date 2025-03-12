// src/data/researchTheoretical.ts
export const researchTheoretical = [
    {
      id: "theory_001",
      name: {
        en: "Geothermal Resource Assessment",
        nl: "Beoordeling van geothermische bronnen",
        fr: "Évaluation des ressources géothermiques"
      },
      description: {
        en: "Analyze subsurface temperatures and geological structures to evaluate resource potential.",
        nl: "Analyseer ondergrondse temperaturen en geologische structuren om de hulpbronnen te beoordelen.",
        fr: "Analyse des températures souterraines et des structures géologiques pour évaluer le potentiel de la ressource."
      },
      cost: 15,
      timeRequired: 2,
      effects: { seismicRisk: -5, publicOpinion: 0, knowledge: +10 }
    },
    {
      id: "theory_002",
      name: {
        en: "Thermodynamic Modeling",
        nl: "Thermodynamische modellering",
        fr: "Modélisation thermodynamique"
      },
      description: {
        en: "Develop simulation models to optimize energy extraction efficiency.",
        nl: "Ontwikkel simulatiemodellen om de efficiëntie van energie-extractie te optimaliseren.",
        fr: "Développez des modèles de simulation pour optimiser l'efficacité de l'extraction d'énergie."
      },
      cost: 20,
      timeRequired: 3,
      effects: { knowledge: +15, seismicRisk: -3 }
    },
    {
      id: "theory_003",
      name: {
        en: "Risk Mitigation Studies",
        nl: "Onderzoek naar risicobeperking",
        fr: "Études de réduction des risques"
      },
      description: {
        en: "Study ways to minimize induced seismicity through controlled drilling techniques.",
        nl: "Onderzoek methoden om geïnduceerde seismische activiteit te minimaliseren door gecontroleerde boortechnieken.",
        fr: "Étudiez les moyens de minimiser la sismicité induite grâce à des techniques de forage contrôlées."
      },
      cost: 25,
      timeRequired: 3,
      effects: { seismicRisk: -10, knowledge: +10 }
    }
  ];
  