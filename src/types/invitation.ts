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
  
  // Card Box Appearance & Custom Color
  cardBoxColor?: string; // Hex color for card box (default: #ffffff)
  cardOpacity?: number; // 0 to 100 (default: 90)

  // Separate Wallpaper Controls
  slideBgUrl?: string;
  bgPatternUrl?: string;
  coverBgType?: 'color' | 'image';
  coverBgColor?: string;
  coverBgUrl?: string;

  // Separate Cover Typography
  coverHeadingFont?: string;
  coverBodyFont?: string;
  coverFontSizeScale?: number; // 90 to 130 (default: 100)

  // Separate Slide Typography
  slideHeadingFont?: string;
  slideBodyFont?: string;
  slideFontSizeScale?: number; // 90 to 130 (default: 100)

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