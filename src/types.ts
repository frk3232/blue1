export interface UserProfile {
  uid: string;
  homeCity?: string;
  savedDestinations?: SavedDestination[];
}

export interface SavedDestination {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface TrafficLog {
  routeId: string;
  currentTravelTime: number;
  aiPredictedTime: number;
  isPredictedJam: boolean;
  recommendationText: string;
  timestamp: string;
}

export interface SafetyHotspot {
  id: string;
  locationName: string;
  lat: number;
  lng: number;
  riskLevel: 'Low' | 'Med' | 'High';
}
