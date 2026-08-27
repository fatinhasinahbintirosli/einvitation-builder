export interface TimelineItem {
  time: string;
  activity: string;
}

export interface LocationDetails {
  venueName: string;
  address: string;
  gmapsUrl: string;
  wazeUrl: string;
}

export interface SlideData {
  id?: string;
  type: 'intro' | 'tentative' | 'location' | 'thank_you' | string;
  title?: string;
  subtitle?: string;
  bodyText?: string;
  imageUrl?: string;
  timeline?: TimelineItem[];
  locationDetails?: LocationDetails;
}

export interface ThemeConfig {
  primaryColor?: string;
  goldColor?: string;
  cardBackgroundColor?: string;
  bgPatternUrl?: string;
}

export interface CoverData {
  tagline?: string;
  mainTitle?: string;
  dateText?: string;
  audioUrl?: string;
}

export interface CardData {
  theme: ThemeConfig;
  cover: CoverData;
  slides: SlideData[];
}