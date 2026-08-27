'use client';

import React, { useState } from 'react';
import { CardData } from '@/types/invitation';

type SlideItem = CardData['slides'][number];
type ValidSlideType = NonNullable<SlideItem['type']>;

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  slug?: string;
  setSlug?: (slug: string) => void;
  generatedUrl?: string | null;
}

const MODULE_OPTIONS: { value: ValidSlideType; label: string; free: boolean }[] = [
  { value: 'location', label: '📍 Lokasi Majlis & Navigasi Peta', free: true },
  { value: 'date_countdown', label: '⏳ Tarikh & Kira Detik (Countdown)', free: false },
  { value: 'tentative', label: '🕒 Susunan Acara / Tentatif', free: false },
  { value: 'thank_you', label: '🌸 Ucapan Penghargaan & Doa', free: false },
];

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
  slug = 'kad-jemputan',
  setSlug,
  generatedUrl
}: Props) {
  const [activeTab, setActiveTab] = useState<'theme' | 'cover' | 'slides'>('slides');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateData = (newData: CardData) => {
    onChange(newData);
  };

  const updateSlide = (index: number, updatedFields: Partial<SlideItem>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      ...updatedFields
    };
    updateData({ ...data, slides: updatedSlides });
  };

  const handleModuleChange = (slideIndex: number, newType: ValidSlideType) => {
    let defaultTitle = 'JEMPUTAN';
    if (newType === 'location') defaultTitle = 'LOKASI MAJLIS';
    if (newType === 'date_countdown') defaultTitle = 'KIRA DETIK MAJLIS';
    if (newType === 'tentative') defaultTitle = 'ATUR CARA MAJLIS';
    if (newType === 'thank_you') defaultTitle = 'SEKALUNG PENGHARGAAN';

    updateSlide(slideIndex, {
      type: newType,
      title: defaultTitle
    });
  };

  const addSlide = () => {
    const newSlide: SlideItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'location',
      title: 'LOKASI MAJLIS',
      locationDetails: {
        venueName: '',
        address: '',
        gmapsUrl: '',
        wazeUrl: ''
      }
    };
    updateData({ ...data, slides: [...data.slides, newSlide] });
  };

  const removeSlide = (index: number) => {
    if (data.slides.length <= 2) return;
    const updated = data.slides.filter((_, i) => i !== index);
    updateData({ ...data, slides: updated });
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Saiz gambar melebihi 3MB. Sila pilih gambar yang lebih kecil.');
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

  const handleSlideImageUpload = (slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const updatedSlides = [...data.slides];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        imageUrl: base64Url
      };
      updateData({ ...data, slides: updatedSlides });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl space-y-5">
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Pereka Kad Jemputan Digital</h2>
        <p className="text-xs text-slate-400 mt-1">Sesuaikan tema, kertas dinding, dan modul setiap helaian kad.</p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'theme' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Tema & Wallpaper
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cover')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'cover' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Muka Depan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('slides')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Modul Helaian ({data.slides?.length || 0})
        </button>
      </div>

      {/* ================= TAB 1: TEMA & WALLPAPER ================= */}
      {activeTab === 'theme' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/20 space-y-4">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-image" /> Kertas Dinding (Wallpaper)
            </label>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <i className="fa-solid fa-circle-info text-base mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block text-amber-200">Saiz Gambar Dicadangkan:</span>
                <span className="font-semibold text-white">1080 × 1920 px</span> (Nisbah 9:16). Format WebP/JPG bawah 2MB.
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-2 font-medium">Pilihan Corak Sedia Ada:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_WALLPAPERS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, bgPatternUrl: preset.url } })}
                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      data.theme?.bgPatternUrl === preset.url
                        ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                        : 'border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white truncate w-full text-left font-medium">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-2 font-medium">Atau Muat Naik Gambar Sendiri:</span>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-4 cursor-pointer bg-slate-900/50 transition-all">
                <i className="fa-solid fa-cloud-arrow-up text-xl text-amber-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">Pilih fail gambar dari peranti</span>
                <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
              </label>
              {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Pautan Lagu Latar (MP3 Direct URL)
            </label>
            <input
              type="text"
              placeholder="https://.../lagu.mp3"
              value={data.cover?.audioUrl || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, audioUrl: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: MUKA DEPAN ================= */}
      {activeTab === 'cover' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Maklumat Muka Depan Kad (Cover)
          </label>
          
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tagline / Panggilan Atas</label>
            <input
              type="text"
              value={data.cover?.tagline || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tajuk / Nama Utama Majlis</label>
            <input
              type="text"
              value={data.cover?.mainTitle || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tarikh Ringkas</label>
            <input
              type="text"
              value={data.cover?.dateText || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 3: HELAIAN KAD DENGAN DROPDOWN ================= */}
      {activeTab === 'slides' && (
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {data.slides.map((slide, idx) => (
            <div 
              key={slide.id || idx} 
              className="p-4 rounded-2xl border bg-slate-950/80 border-slate-800 space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Helaian {idx + 1}
                </span>

                {idx === 0 ? (
                  <span className="text-xs text-slate-400 font-semibold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                    📜 Muka Utama (Intro)
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={slide.type}
                      onChange={(e) => handleModuleChange(idx, e.target.value as ValidSlideType)}
                      className="bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                    >
                      {MODULE_OPTIONS.map((opt) => (
                        <option 
                          key={opt.value} 
                          value={opt.value}
                          disabled={idx === 1 && !opt.free}
                        >
                          {opt.label} {idx === 1 && !opt.free ? '🔒 (Pro Sahaja)' : ''}
                        </option>
                      ))}
                    </select>

                    {idx > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlide(idx)}
                        className="text-red-400 hover:text-red-300 text-xs p-1"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* INPUT BORANG MENGIKUT MODUL */}
              {slide.type === 'intro' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Jemputan</label>
                    <textarea
                      rows={2}
                      value={slide.bodyText || ''}
                      onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nama Penuh Yang Diraikan</label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Gambar Bulat Tengah</label>
                    <div className="flex items-center gap-3">
                      {slide.imageUrl && (
                        <img src={slide.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                      )}
                      <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                        Pilih Gambar Baharu
                        <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === 'location' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nama Dewan / Rumah</label>
                    <input
                      type="text"
                      value={slide.locationDetails?.venueName || ''}
                      onChange={(e) => updateSlide(idx, {
                        locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), venueName: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Alamat Penuh</label>
                    <textarea
                      rows={2}
                      value={slide.locationDetails?.address || ''}
                      onChange={(e) => updateSlide(idx, {
                        locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), address: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Pautan Google Maps"
                      value={slide.locationDetails?.gmapsUrl || ''}
                      onChange={(e) => updateSlide(idx, {
                        locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), gmapsUrl: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Pautan Waze"
                      value={slide.locationDetails?.wazeUrl || ''}
                      onChange={(e) => updateSlide(idx, {
                        locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), wazeUrl: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {slide.type === 'tentative' && (
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block">Jadual Atur Cara Majlis:</label>
                  {(slide.timeline || []).map((tItem, tIdx) => (
                    <div key={tIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={tItem.time}
                        onChange={(e) => {
                          const newT = [...(slide.timeline || [])];
                          newT[tIdx].time = e.target.value;
                          updateSlide(idx, { timeline: newT });
                        }}
                        className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-amber-300"
                      />
                      <input
                        type="text"
                        value={tItem.activity}
                        onChange={(e) => {
                          const newT = [...(slide.timeline || [])];
                          newT[tIdx].activity = e.target.value;
                          updateSlide(idx, { timeline: newT });
                        }}
                        className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {slide.type === 'thank_you' && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ucapan Penutup</label>
                  <textarea
                    rows={2}
                    value={slide.bodyText || ''}
                    onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addSlide}
            className="w-full py-2.5 rounded-xl border border-dashed border-amber-400/50 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus" /> Tambah Helaian Slaid Baharu
          </button>
        </div>
      )}

      {/* ================= JANA DUA PILIHAN LINK (FREE VS PRO) ================= */}
      <div className="pt-3 border-t border-slate-800 space-y-4">
        {setSlug && (
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nama Pautan Unik (/e/slug)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs outline-none"
            />
          </div>
        )}

        <button
          onClick={onSave}
          disabled={isSaving}
          type="button"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-paper-plane" />}
          JANA KEDUA-DUA PAUTAN KAD
        </button>

        {generatedUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                Pilihan 1: Versi Percuma
              </span>
              <p className="text-[11px] text-slate-400">2 Helaian (Intro + Lokasi) & Watermark.</p>
              <a 
                href={generatedUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block text-xs font-bold text-amber-400 underline break-all"
              >
                Buka Link Percuma ↗
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2 text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                Pilihan 2: Versi Penuh (Pro)
              </span>
              <p className="text-[11px] text-slate-300">Semua Helaian Lengkap, Bebas Watermark & Muzik Sendiri.</p>
              <button 
                type="button"
                onClick={() => alert(`Sila buat bayaran RM15 untuk mengaktifkan pautan: ${generatedUrl}`)}
                className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow hover:bg-amber-400"
              >
                Buka Kunci Versi Penuh (RM15)
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}