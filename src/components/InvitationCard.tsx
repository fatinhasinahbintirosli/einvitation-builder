'use client';

import React, { useState } from 'react';
import { CardData, SlideData } from '@/types/invitation';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  initialData: CardData;
  onDataChange: (data: CardData) => void;
}

// Senarai Pilihan Wallpaper Cadangan Admin
const PRESET_WALLPAPERS = [
  {
    id: 'songket_gold',
    name: 'Songket Emas Warisan',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
    previewColor: '#0f172a'
  },
  {
    id: 'dark_floral',
    name: 'Botanikal Bunga Klasik',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1080&auto=format&fit=crop',
    previewColor: '#1e1b4b'
  },
  {
    id: 'royal_emerald',
    name: 'Hijau Zamrud Mewah',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop',
    previewColor: '#064e3b'
  },
  {
    id: 'cream_texture',
    name: 'Tekstur Kertas Bersejarah',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1080&auto=format&fit=crop',
    previewColor: '#451a03'
  }
];

export default function BuilderForm({ initialData, onDataChange }: Props) {
  const [formData, setFormData] = useState<CardData>(initialData);
  const [slug, setSlug] = useState<string>('kad-' + Math.random().toString(36).substring(2, 9));
  const [isSaving, setIsSaving] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateData = (newData: CardData) => {
    setFormData(newData);
    onDataChange(newData);
  };

  // Pengendali Muat Naik Wallpaper Sendiri
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Saiz fail melebihi 3MB. Sila pilih gambar yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const updated = {
        ...formData,
        theme: {
          ...formData.theme,
          bgPatternUrl: base64Url
        }
      };
      updateData(updated);
    };
    reader.readAsDataURL(file);
  };

  // Pilih Wallpaper Preset
  const handleSelectPreset = (url: string) => {
    const updated = {
      ...formData,
      theme: {
        ...formData.theme,
        bgPatternUrl: url
      }
    };
    updateData(updated);
  };

  // Simpan ke Supabase
  const handleSaveInvitation = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .upsert({
          slug: slug.trim().toLowerCase(),
          card_data: formData,
          is_paid: false
        });

      if (error) throw error;
      const fullUrl = `${window.location.origin}/e/${slug.trim().toLowerCase()}`;
      setGeneratedUrl(fullUrl);
    } catch (err: any) {
      alert('Ralat menyimpan kad: ' + (err.message || 'Sila cuba lagi.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl space-y-6">
      
      {/* Tajuk Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Pereka Kad Jemputan Digital</h2>
        <p className="text-xs text-slate-400 mt-1">Ubah suai tema, corak latar, dan teks jemputan anda secara langsung.</p>
      </div>

      {/* ================= 1. BAHAGIAN WALLPAPER & TEMA ================= */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-image" /> Kertas Dinding (Wallpaper)
          </label>
        </div>

        {/* Kotak Panduan Saiz Wallpaper */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <i className="fa-solid fa-circle-info text-base mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold block text-amber-200 mb-0.5">Saiz Gambar Dicadangkan:</span>
            <span className="font-semibold text-white">1080 × 1920 px</span> (Nisbah 9:16 skrin telefon). Format WebP / JPG bawah 2MB untuk kelajuan maksimum.
          </div>
        </div>

        {/* Pilihan Wallpaper Cadangan Admin */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">Pilihan Corak Cadangan:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_WALLPAPERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all group ${
                  formData.theme.bgPatternUrl === preset.url
                    ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                    : 'border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] text-white font-medium truncate w-full text-left">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Muat Naik Kertas Dinding Sendiri */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">Atau Muat Naik Gambar Sendiri:</span>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-4 cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all">
            <i className="fa-solid fa-cloud-arrow-up text-xl text-amber-400 mb-1" />
            <span className="text-xs text-slate-300 font-medium">Klik untuk pilih gambar dari peranti</span>
            <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP (Maksimum 3MB)</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
          {uploadError && (
            <p className="text-xs text-red-400 mt-1.5">{uploadError}</p>
          )}
        </div>
      </div>

      {/* ================= 2. BAHAGIAN MUKA DEPAN ================= */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <label className="text-sm font-bold text-amber-400 uppercase tracking-wider block">
          Maklumat Muka Depan (Cover)
        </label>
        
        <div>
          <label className="text-xs text-slate-400 block mb-1">Tagline / Panggilan</label>
          <input
            type="text"
            value={formData.cover.tagline}
            onChange={(e) => updateData({ ...formData, cover: { ...formData.cover, tagline: e.target.value } })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:border-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Tajuk Utama Majlis</label>
          <input
            type="text"
            value={formData.cover.mainTitle}
            onChange={(e) => updateData({ ...formData, cover: { ...formData.cover, mainTitle: e.target.value } })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:border-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Tarikh Ringkas</label>
          <input
            type="text"
            value={formData.cover.dateText}
            onChange={(e) => updateData({ ...formData, cover: { ...formData.cover, dateText: e.target.value } })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:border-amber-400 outline-none"
          />
        </div>
      </div>

      {/* ================= 3. URL SLUG & BUTANG JANA ================= */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Pautan URL Kad (Slug)</label>
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm">
            <span className="text-slate-500 select-none">/e/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())}
              className="bg-transparent border-none outline-none text-amber-300 w-full ml-1"
            />
          </div>
        </div>

        <button
          onClick={handleSaveInvitation}
          disabled={isSaving}
          type="button"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane" /> Sahkan & Dapatkan Link Preview
            </>
          )}
        </button>

        {generatedUrl && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <span className="text-xs text-amber-300 font-semibold block">Pautan Kad Anda Sedia Dikongsi:</span>
            <a 
              href={generatedUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-bold text-white underline break-all hover:text-amber-200"
            >
              {generatedUrl}
            </a>
          </div>
        )}
      </div>

    </div>
  );
}