
export type TriageCategory = 'POLICE' | 'SHELTER';

export interface TriageLink {
  title: string;
  url: string;
}

export interface TriageResult {
  species: string;
  category: TriageCategory;
  advice: string;
  injury_details: string;
  links: TriageLink[];
}

export interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
}

export interface ServicePoint {
  name: string;
  type: TriageCategory;
  lat: number;
  lng: number;
  phone?: string;
  address: string;
}

export interface AnimalFact {
  name: string;
  description: string;
  habitat: string;
  diet: string;
  funFact: string;
  furColor: string;
  characteristics: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
