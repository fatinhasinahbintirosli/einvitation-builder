'use client';

import React, { useState } from 'react';
import { CardData } from '@/types/invitation';

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  slug?: string;
  setSlug?: (slug: string) => void;
  generatedUrl?: string | null;
}

// Senarai Pilihan Kertas Dinding (Wallpaper) Cadangan
const PRESET_WALLPAPERS = [
  {
    id: 'songket_gold',
    name: 'Songket Emas Warisan',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'dark_floral',
    name: 'Botanikal Bunga Klasik',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'royal_emerald',
    name: 'Hijau Zamrud Mewah',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'cream_texture',
    name: 'Tekstur Krim Elegan',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1080&auto=format&fit=crop',
  }
];

export default function BuilderForm({ 
  data, 
  onChange, 
  onSave, 
  isSaving = false,
  slug,
  setSlug,
  generatedUrl
}: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateData = (newData: CardData) => {
    onChange(newData);
  };

  // Pengendali Muat Naik Wallpaper Sendiri (Convert ke Base64)
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
      updateData({
        ...data,
        theme: {
          ...data.theme,
          bgPatternUrl: base64Url
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    updateData({
      ...data,
      theme: {
        ...data.theme,
        bgPatternUrl: url
      }
    });
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Pereka Kad Jemputan Digital</h2>
        <p className="text-xs text-slate-400 mt-1">Sesuaikan tema, kertas dinding, dan teks jemputan secara terus.</p>
      </div>

      {/* ================= 1. BAHAGIAN WALLPAPER & TEMA ================= */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/20 space-y-4">
        <label className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-image" /> Kertas Dinding (Wallpaper)
        </label>

        {/* Petunjuk Saiz Disyorkan */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <i className="fa-solid fa-circle-info text-base mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold block text-amber-200 mb-0.5">Saiz Gambar Dicadangkan:</span>
            <span className="font-semibold text-white">1080 × 1920 px</span> (Nisbah 9:16 skrin telefon). Format WebP / JPG bawah 2MB.
          </div>
        </div>

        {/* Pilihan Wallpaper Preset */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">Pilihan Corak Cadangan:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_WALLPAPERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  data.theme?.bgPatternUrl === preset.url
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

        {/* Muat Naik Fail Sendiri */}
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
            value={data.cover?.tagline || ''}
            onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:border-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Tajuk Utama Majlis</label>
          <input
            type="text"
            value={data.cover?.mainTitle || ''}
            onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:border-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Tarikh Ringkas</label>
          <input
            type="text"
            value={data.cover?.dateText || ''}
            onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:border-amber-400 outline-none"
          />
        </div>
      </div>

      {/* ================= 3. BUTANG SIMPAN / JANA ================= */}
      {onSave && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          {setSlug && slug !== undefined && (
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
          )}

          <button
            onClick={onSave}
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
              <span className="text-xs text-amber-300 font-semibold block">Pautan Kad Anda:</span>
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
      )}

    </div>
  );
}