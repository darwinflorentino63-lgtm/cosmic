import React from 'react';

export interface User {
  name: string;
  email: string;
  password?: string;
  role?: 'estudiante' | 'invitado' | 'admin';
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  userName: string;
  userRole: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userName: string;
  userRole: string;
  text: string;
  type: 'opinion' | 'idea' | 'aprendizaje' | 'cambio';
  likes: string[]; // Array de nombres de usuario que dieron like
  comments: Comment[];
  timestamp: number;
}

export interface Planet {
  name: string;
  size: string; 
  orbitSize: number; 
  speed: number; 
  description: string;
  texture: string; 
  hasRings?: boolean;
  tilt?: number; 
  textureZoom?: string; 
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PlanetData {
  introduction: string; 
  description: string;
  keyPoints: string[];
  news: string;
  lastUpdate: string;
}

export interface PlanetInfoResponse {
  data: PlanetData | null;
  sources: GroundingSource[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; 
  sources?: GroundingSource[]; 
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export type ImageSize = '1K' | '2K' | '4K';