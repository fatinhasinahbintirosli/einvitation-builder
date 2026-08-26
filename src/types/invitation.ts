export interface TimelineItem {
  time: string;
  activity: string;
}

export interface SlideItem {
  id: string;
  type: 'intro' | 'date_countdown' | 'tentative' | 'location' | 'thank_you';
  title?: string;
  subtitle?: string;
  bodyText?: string;
  imageUrl?: string;
  eventDate?: string;
  locationDetails?: {
    venueName: string;
    address: string;
    gmapsUrl: string;
    wazeUrl: string;
  };
  timeline?: TimelineItem[];
}

export interface CardData {
  theme: {
    doorStyle: 'sliding' | 'curtain';
    backgroundColor: string;
    cardBackgroundColor: string;
    primaryColor: string;
    goldColor: string;
    bgPatternUrl: string;
  };
  cover: {
    tagline: string;
    mainTitle: string;
    dateText: string;
    audioUrl: string;
  };
  slides: SlideItem[];
}