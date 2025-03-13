// src/data/researchPractical.ts
import { ActionData } from '../ui/ActionOption';

/**
 * Array of practical research actions available to the player
 * 
 * These represent field-based, physical research actions that:
 * - Generally have higher costs and time requirements than theoretical research
 * - Provide greater knowledge gains
 * - Can have mixed effects on seismic risk (some increase, some decrease)
 * - May have more significant public opinion impacts (both positive and negative)
 * - Can sometimes generate direct financial returns
 */
export const researchPractical: ActionData[] = [
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
      cost: 30,
      timeRequired: 2,
      effects: { seismicRisk: 10, knowledge: 20, publicOpinion: -5, money: 15 }
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
      cost: 20,
      timeRequired: 1,
      effects: { seismicRisk: -10, knowledge: 12, publicOpinion: 10, money: 0 }
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
      effects: { knowledge: 30, publicOpinion: 10, seismicRisk: 5, money: 0 }
    }
  ];
  