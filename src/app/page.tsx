'use client';

import React, { useState } from 'react';
import BuilderForm from '@/components/BuilderForm';
import InvitationCard from '@/components/InvitationCard';
import { CardData } from '@/types/invitation';
import { supabase } from '@/lib/supabaseClient';

const initialData: CardData = {
  theme: {
    coverBgType: 'color',
    coverBgColor: '#1e293b',
    cardOpacity: 92,
    backgroundColor: '#0f172a',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.95)',
    primaryColor: '#1e293b',
    goldColor: '#b59049',
    headingFont: 'Cinzel, serif',
    bodyFont: 'Playfair Display, serif',
    fontSizeScale: 100,
    bgPatternUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
    slideBgUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop'
  },
  cover: {
    tagline: 'The Wedding Celebration Of',
    mainTitle: 'Emma & Liam',
    dateText: 'SUNDAY, OCTOBER 18, 2026',
    audioUrl: 'https://ia800504.us.archive.org/11/items/CanonInD_201405/Canon%20in%20D.mp3'
  },
  slides: [
    {
      id: '1',
      type: 'intro',
      title: 'SPECIAL INVITATION',
      subtitle: 'Emma Sophia & Liam Alexander',
      bodyText: 'Together with their families, we joyfully invite you to celebrate the sacred union and celebration of our wedding day:',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: '2',
      type: 'location',
      title: 'EVENT VENUE',
      locationDetails: {
        venueName: 'The St. Regis Grand Ballroom',
        address: '6 East 55th Street, New York, NY 10022, United States',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      }
    },
    {
      id: '3',
      type: 'tentative',
      title: 'EVENT ITINERARY',
      timeline: [
        { time: '05:00 PM', activity: 'Guest Arrival & Welcome Canapés' },
        { time: '06:00 PM', activity: 'Wedding Solemnization Ceremony' },
        { time: '07:30 PM', activity: 'Grand Banquet Dinner & Speeches' },
        { time: '10:00 PM', activity: 'Celebration Toast & Farewell' }
      ]
    },
    {
      id: '4',
      type: 'thank_you',
      title: 'WITH GRATITUDE',
      bodyText: 'We extend our deepest gratitude for your warm love, blessings, and for being an unforgettable part of our special milestone.'
    }
  ]
};

export default function BuilderPage() {
  const [cardData, setCardData] = useState<CardData>(initialData);
  const [slug, setSlug] = useState<string>(() => `invite-${Math.random().toString(36).substring(2, 9)}`);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | 'cover'>('cover');

  const handleSave = async () => {
    setIsSaving(true);
    const cleanSlug = slug.trim().toLowerCase();

    try {
      const { error } = await supabase.from('invitations').upsert(
        [
          {
            slug: cleanSlug,
            creator_email: 'user@example.com',
            is_paid: false,
            card_data: cardData
          }
        ],
        { onConflict: 'slug' }
      );

      if (error) {
        throw error;
      }

      const fullUrl = `${window.location.origin}/e/${cleanSlug}`;
      setPreviewUrl(fullUrl);
    } catch (err: any) {
      alert('Error saving invitation: ' + (err.message || 'Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center bg-slate-950 text-slate-100">
      
      {/* Main Studio Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
          E-INVITATION BUILDER STUDIO
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Design your custom digital card on the left. Watch real-time interactive animations sync live on the right.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left Side: Builder Form */}
        <div className="lg:col-span-6 w-full">
          <BuilderForm
            data={cardData}
            onChange={setCardData}
            onSave={handleSave}
            isSaving={isSaving}
            slug={slug}
            setSlug={setSlug}
            generatedUrl={previewUrl}
            activeSlideIndex={activeSlideIndex}
            onActiveSlideChange={setActiveSlideIndex}
          />
        </div>

        {/* Right Side: Live Card Preview (All slides shown, no watermark) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center sticky top-6">
          <div className="text-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Live Preview Studio
            </span>
          </div>
          
          <InvitationCard 
            data={cardData} 
            showWatermark={false} 
            activeSlideIndex={activeSlideIndex}
          />
        </div>
      </div>
    </main>
  );
}