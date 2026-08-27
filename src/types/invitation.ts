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

export type SlideType = 'intro' | 'location' | 'tentative' | 'image_qr' | 'guestbook' | 'thank_you' | string;

export interface SlideData {
  id?: string;
  type: SlideType;
  title?: string;
  subtitle?: string;
  bodyText?: string;
  imageUrl?: string;
  timeline?: TimelineItem[];
  locationDetails?: LocationDetails;
  [key: string]: any;
}

export interface ThemeConfig {
  primaryColor?: string;
  goldColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  bgPatternUrl?: string;
  doorStyle?: string;
  [key: string]: any;
}

export interface CoverData {
  tagline?: string;
  mainTitle?: string;
  dateText?: string;
  audioUrl?: string;
  [key: string]: any;
}

export interface CardData {
  theme: ThemeConfig;
  cover: CoverData;
  slides: SlideData[];
  [key: string]: any;
}