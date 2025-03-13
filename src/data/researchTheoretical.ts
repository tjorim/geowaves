// src/data/researchTheoretical.ts
import { ActionData } from '../ui/ActionOption';

/**
 * Array of theoretical research actions available to the player
 * 
 * These represent academic and computational research actions that:
 * - Generally have lower costs and time requirements
 * - Typically reduce seismic risk
 * - Provide moderate knowledge gains
 * - Have minimal direct financial return
 */
export const researchTheoretical: ActionData[] = [
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
      cost: 10,
      timeRequired: 1,
      effects: { seismicRisk: -5, publicOpinion: 2, knowledge: 12, money: 0 }
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
      cost: 15,
      timeRequired: 2,
      effects: { knowledge: 18, seismicRisk: -3, money: 10, publicOpinion: 0 }
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
      effects: { seismicRisk: -10, knowledge: 10, publicOpinion: 0, money: 0 }
    }
  ];
  