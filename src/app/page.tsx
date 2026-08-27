'use client';

import React, { useState } from 'react';
import BuilderForm from '@/components/BuilderForm';
import InvitationCard from '@/components/InvitationCard';
import { CardData } from '@/types/invitation';
import { supabase } from '@/lib/supabaseClient';

const initialData: CardData = {
  theme: {
    coverBgType: 'color',
    coverBgColor: '#2d4a3e',
    cardOpacity: 92, // Nilai ketelusan lalai (92%)
    backgroundColor: '#1f2621',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.95)',
    primaryColor: '#2d4a3e',
    goldColor: '#b59049',
    bgPatternUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop'
  },
  cover: {
    tagline: 'Walimatul Aqiqah & Kesyukuran',
    mainTitle: 'Airis Sabrina',
    dateText: 'AHAD, 6 SEPTEMBER 2026',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-piano-112349.mp3'
  },
  slides: [
    {
      id: '1',
      type: 'intro',
      title: 'JEMPUTAN MAJLIS AQIQAH',
      subtitle: 'Airis Sabrina Binti Mohd Fadli',
      bodyText: 'Merafakkan setinggi-tinggi rasa syukur ke hadrat Allah SWT, kami berbesar hati menjemput hadirin sekeluarga hadir ke majlis aqiqah puteri kami:',
      imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: '2',
      type: 'location',
      title: 'LOKASI MAJLIS',
      locationDetails: {
        venueName: 'Kediaman',
        address: 'KM12 Kampung Senin, Layang-Layang Kanan, 32800 Parit, Perak',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com/ul?ll=4.3935298,100.8969494&navigate=yes'
      }
    },
    {
      id: '3',
      type: 'tentative',
      title: 'SUSUNAN MAJLIS',
      timeline: [
        { time: '11:00 AM', activity: 'Ketibaan Tetamu & Jamuan Makan' },
        { time: '12:00 PM', activity: 'Tahnik, Cukur Jambul & Doa Selamat' },
        { time: '04:00 PM', activity: 'Sesi Bergambar & Bersurai' }
      ]
    },
    {
      id: '4',
      type: 'thank_you',
      title: 'TERIMA KASIH',
      bodyText: 'Sekalung penghargaan dan ucapan terima kasih atas kehadiran, doa serta ingatan tulus ikhlas daripada anda semua.'
    }
  ]
};

export default function BuilderPage() {
  const [cardData, setCardData] = useState<CardData>(initialData);
  const [slug, setSlug] = useState<string>(() => `kad-${Math.random().toString(36).substring(2, 9)}`);
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
      alert('Ralat semasa menyimpan kad: ' + (err.message || 'Sila cuba lagi.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center bg-slate-950 text-slate-100">
      
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
          E-INVITATION BUILDER STUDIO
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Ubah suai teks, tema, susunan helaian, dan ketelusan kad. Pratonton langsung bergerak secara automatik.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Bahagian Kiri: Borang Builder */}
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

        {/* Bahagian Kanan: Live Preview Kad */}
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