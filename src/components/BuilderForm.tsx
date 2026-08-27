'use client';

import React, { useState } from 'react';
import { CardData } from '@/types/invitation';

type SlideItem = CardData['slides'][number];

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  slug?: string;
  setSlug?: (slug: string) => void;
  generatedUrl?: string | null;
}

const MODULE_OPTIONS = [
  { value: 'location', label: '📍 Lokasi Majlis & Navigasi Peta', free: true },
  { value: 'tentative', label: '🕒 Susunan Acara / Tentatif', free: false },
  { value: 'guestbook', label: '✍️ Buku Ucapan & RSVP Tetamu', free: false },
  { value: 'gallery', label: '🖼️ Galeri Gambar Memori', free: false },
  { value: 'gift', label: '🎁 Salam Kaus / DuitNow QR Pay', free: false },
  { value: 'thank_you', label: '🌸 Ucapan Penghargaan & Doa', free: false },
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

  const handleModuleChange = (slideIndex: number, newType: string) => {
    let defaultTitle = 'JEMPUTAN';
    if (newType === 'location') defaultTitle = 'LOKASI MAJLIS';
    if (newType === 'tentative') defaultTitle = 'ATUR CARA MAJLIS';
    if (newType === 'guestbook') defaultTitle = 'BUKU UCAPAN & DOA';
    if (newType === 'gallery') defaultTitle = 'MEMORI INDAH';
    if (newType === 'gift') defaultTitle = 'SALAM KAUS';
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

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl space-y-5">
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Pereka Kad Jemputan Digital</h2>
        <p className="text-xs text-slate-400 mt-1">Pilih modul khusus bagi setiap helaian mengikut kehendak majlis anda.</p>
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

                {/* DROPDOWN PEMILIHAN MODUL */}
                {idx === 0 ? (
                  <span className="text-xs text-slate-400 font-semibold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                    📜 Muka Utama (Intro / Nama Pengantin)
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={slide.type}
                      onChange={(e) => handleModuleChange(idx, e.target.value)}
                      className="bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                    >
                      {MODULE_OPTIONS.map((opt) => (
                        <option 
                          key={opt.value} 
                          value={opt.value}
                          disabled={idx === 1 && !opt.free} // Hadkan Slaid 2 kepada module percuma sahaja (Location)
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

              {/* INPUT BORANG MENGIKUT MODUL YANG DIPILIH */}
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
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pautan Waze"
                      value={slide.locationDetails?.wazeUrl || ''}
                      onChange={(e) => updateSlide(idx, {
                        locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), wazeUrl: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {slide.type === 'tentative' && (
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block">Jadual Majlis:</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none"
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
            {/* 1. Pautan Percuma */}
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

            {/* 2. Pakej Premium */}
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