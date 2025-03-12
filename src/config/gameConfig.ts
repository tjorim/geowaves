/**
 * Game configuration file for GeoWaves
 * Contains game settings and balancing parameters
 */

/**
 * Interface defining the structure of game configuration
 */
export interface GameConfig {
  initialValues: {
    money: number;
    turns: number;
    opinion: number;
    risk: number;
    research: number;
  };
  maxValues: {
    money: number;
    turns: number;
    opinion: number;
    risk: number;
    research: number;
  };
  limits: {
    researchNeeded: number;
    maxRisk: number;
  };
  effects: {
    highRiskThreshold: number;
    highRiskOpinionLoss: number;
    passiveRewards: {
      researchPerTurn: number;   // Research points gained each turn
      moneyPerTurn: number;      // Money gained each turn 
      opinionThreshold: number;  // Public opinion needed for passive money rewards
    };
  };
  events: {
    baseChance: number;         // Base chance of an event (percentage)
    minTurnsBetweenEvents: number; // Minimum turns between events for pacing
    maxConsecutiveQuietTurns: number; // Max turns without events before forcing one
    riskMultiplier: number;     // How much risk impacts event chance
    bigEventThreshold: number;  // Risk threshold for major events
  };
  winConditions: {
    research: number;   // Research points needed to win
    maxRisk: number;    // Maximum risk level before game over
  };
  passiveRewards: {
    baseResearchPerTurn: number;  // Research points gained each turn
    baseFundingPerTurn: number;   // Money gained each turn based on opinion
  };
}

/**
 * Default game configuration values
 * These can be overridden for different difficulty levels or game modes
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  initialValues: {
    money: 200,       // Starting funds (increased from 100)
    turns: 15,        // Available turns (increased from 10)
    opinion: 100,     // Initial public opinion
    risk: 10,         // Initial seismic risk (increased from 0 to create more events)
    research: 0       // Starting research points
  },
  maxValues: {
    money: 2000,      // Maximum funds
    turns: 15,        // Maximum available turns
    opinion: 100,     // Maximum public opinion
    risk: 100,        // Maximum risk level
    research: 100     // Maximum research points
  },
  limits: {
    researchNeeded: 50, // Research points needed to win
    maxRisk: 100        // Maximum possible risk level
  },
  effects: {
    highRiskThreshold: 50, // Risk above this causes passive opinion loss
    highRiskOpinionLoss: 5, // Amount of opinion lost per turn when risk is high
    passiveRewards: {
      researchPerTurn: 1,     // Gain 1 research point naturally each turn
      moneyPerTurn: 5,        // Passive income of $5 per turn
      opinionThreshold: 60    // Need 60+ public opinion to receive passive income
    }
  },
  events: {
    baseChance: 15,       // 15% base chance of event regardless of risk
    minTurnsBetweenEvents: 2, // At least 2 turns between events for gameplay pacing
    maxConsecutiveQuietTurns: 3, // Force event after 3 quiet turns
    riskMultiplier: 0.7,   // Each point of risk adds 0.7% to event chance
    bigEventThreshold: 70  // Risk above 70 enables major event types
  },
  winConditions: {
    research: 50,     // Research points needed to win (same as limits.researchNeeded)
    maxRisk: 100      // Risk threshold that causes game over (same as limits.maxRisk)
  },
  passiveRewards: {
    baseResearchPerTurn: 1, // Research points gained each turn
    baseFundingPerTurn: 5   // Base funding gained per turn (scaled by opinion)
  }
};