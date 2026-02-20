// TypeScript interfaces for the voting app

export interface Couple {
  id: string;
  name: string;
  leadName?: string; // Name of the pro dancer
  followName?: string; // Name of the star dancer
  headshot?: string; // Base64 encoded image (legacy, kept for backward compat)
  leadPhoto?: string; // Base64 encoded image for the pro
  followPhoto?: string; // Base64 encoded image for the star
  judgeScore?: number; // 0-60 (raw score from 6 judges x 0-10 each, normalized to 0-50 for final calculation)
  music?: string; // Song/music name (optional)
  dance?: string; // Dance style (optional)
  order?: number; // Display order
  createdAt?: any; // Firestore Timestamp
}

export interface Vote {
  voterName: string;
  timestamp: any; // Firestore serverTimestamp
  fingerprint: string; // Browser fingerprint to prevent duplicate votes
  votes: {
    [coupleId: string]: "yes" | "no";
  };
}

export interface VotingStatus {
  status: "open" | "closed";
  maxHearts?: number; // Maximum number of hearts (yes votes) a user can give
}

export interface ScoreData {
  coupleId: string;
  coupleName: string;
  audienceScore: number; // 0-50
  judgeScore: number; // 0-50
  finalScore: number; // 0-100
  rank: number;
  headshot?: string;
  leadPhoto?: string;
  followPhoto?: string;
  music?: string;
  dance?: string;
}
