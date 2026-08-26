'use client';

import React from 'react';
import { CardData } from '@/types/invitation';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function BuilderForm({ data, onChange, onSave, isSaving }: Props) {
  const updateTheme = (key: keyof CardData['theme'], val: string) => {
    onChange({ ...data, theme: { ...data.theme, [key]: val } });
  };

  const updateCover = (key: keyof CardData['cover'], val: string) => {
    onChange({ ...data, cover: { ...data.cover, [key]: val } });
  };

  const addSlide = () => {
    const newSlide = {
      id: Math.random().toString(),
      type: 'intro' as const,
      title: 'Helaian Baru',
      bodyText: 'Kandungan teks jemputan anda di sini...',
    };
    onChange({ ...data, slides: [...data.slides, newSlide] });
  };

  const removeSlide = (idx: number) => {
    const newSlides = data.slides.filter((_, i) => i !== idx);
    onChange({ ...data, slides: newSlides });
  };

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
      
      {/* 1. Tetapan Tema & Warna */}
      <div>
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
          1. Tema & Warna
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Warna Utama (Pintu)</label>
            <input
              type="color"
              value={data.theme.primaryColor}
              onChange={(e) => updateTheme('primaryColor', e.target.value)}
              className="w-full h-9 rounded bg-slate-900 border border-slate-700 cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Aksen Emas</label>
            <input
              type="color"
              value={data.theme.goldColor}
              onChange={(e) => updateTheme('goldColor', e.target.value)}
              className="w-full h-9 rounded bg-slate-900 border border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Muka Depan Kad */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
          2. Muka Depan (Cover)
        </h3>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Tagline Acara</label>
          <input
            type="text"
            value={data.cover.tagline}
            onChange={(e) => updateCover('tagline', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Tajuk Utama (Nama)</label>
          <input
            type="text"
            value={data.cover.mainTitle}
            onChange={(e) => updateCover('mainTitle', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Tarikh Acara</label>
          <input
            type="text"
            value={data.cover.dateText}
            onChange={(e) => updateCover('dateText', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
          />
        </div>
      </div>

      {/* 3. Pengurusan Helaian (Slides) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            3. Helaian Dalaman ({data.slides.length})
          </h3>
          <button
            onClick={addSlide}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Helaian
          </button>
        </div>

        {data.slides.map((slide, idx) => (
          <div key={slide.id || idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 relative">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-300">Helaian #{idx + 1}</span>
              {data.slides.length > 1 && (
                <button onClick={() => removeSlide(idx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Tajuk Helaian"
              value={slide.title || ''}
              onChange={(e) => {
                const updated = [...data.slides];
                updated[idx].title = e.target.value;
                onChange({ ...data, slides: updated });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
            />
            <textarea
              placeholder="Kandungan Teks"
              rows={2}
              value={slide.bodyText || ''}
              onChange={(e) => {
                const updated = [...data.slides];
                updated[idx].bodyText = e.target.value;
                onChange({ ...data, slides: updated });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
            />
          </div>
        ))}
      </div>

      {/* Butang Sahkan & Simpan */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Sahkan & Dapatkan Link Preview'}
      </button>
    </div>
  );
}