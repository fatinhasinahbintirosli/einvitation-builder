'use client';

import React, { useState } from 'react';
import BuilderForm from '@/components/BuilderForm';
import InvitationCard from '@/components/InvitationCard';
import { CardData } from '@/types/invitation';
import { supabase } from '@/lib/supabaseClient';

const initialData: CardData = {
  theme: {
    doorStyle: 'sliding',
    backgroundColor: '#1f2621',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.95)',
    primaryColor: '#3d5343',
    goldColor: '#b59049',
    bgPatternUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop'
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
      type: 'tentative',
      title: 'SUSUNAN MAJLIS',
      timeline: [
        { time: '11:00 AM', activity: 'Ketibaan Tetamu & Jamuan Makan' },
        { time: '12:00 PM', activity: 'Tahnik, Cukur Jambul & Doa Selamat' },
        { time: '04:00 PM', activity: 'Sesi Bergambar & Bersurai' }
      ]
    },
    {
      id: '3',
      type: 'location',
      title: 'LOKASI MAJLIS',
      locationDetails: {
        venueName: 'Kediaman',
        address: 'KM12 Kampung Senin, Layang-Layang Kanan, 32800 Parit, Perak',
        gmapsUrl: 'https://maps.app.goo.gl/ijC3EX1oFmbRKdod9',
        wazeUrl: 'https://waze.com/ul?ll=4.3935298,100.8969494&navigate=yes'
      }
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
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const slug = `kad-${Math.random().toString(36).substring(2, 9)}`;

    const { error } = await supabase.from('invitations').insert([
      {
        slug: slug,
        creator_email: 'user@example.com',
        is_paid: false,
        card_data: cardData
      }
    ]);

    setIsSaving(false);
    if (error) {
      alert('Ralat menyimpan kad: ' + error.message);
    } else {
      setPreviewUrl(`${window.location.origin}/e/${slug}`);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-400 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
          E-INVITATION BUILDER STUDIO
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ubah suai teks, tema, dan helaian di kiri. Pratonton langsung bergerak di kanan.
        </p>
      </header>

      {previewUrl && (
        <div className="w-full bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl mb-6 text-center text-xs space-y-2">
          <p className="font-bold text-amber-300">Pautan Pratonton Anda Telah Dijana (Dengan Watermark):</p>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="underline text-white block">
            {previewUrl}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Bahagian Kiri: Borang Builder */}
        <div className="lg:col-span-6 w-full">
          <BuilderForm
            data={cardData}
            onChange={setCardData}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>

        {/* Bahagian Kanan: Live Preview Kad */}
        <div className="lg:col-span-6 flex justify-center sticky top-6">
          <InvitationCard data={cardData} isPaid={false} />
        </div>
      </div>
    </main>
  );
}