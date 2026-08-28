'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface WallpaperItem {
  id: string;
  name: string;
  category: string;
  url: string;
  order_index: number;
}

interface MusicItem {
  id: string;
  name: string;
  category: string;
  url: string;
  order_index: number;
}

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'music'>('wallpapers');
  
  // Wallpapers state
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [wpName, setWpName] = useState('');
  const [wpCategory, setWpCategory] = useState('Heritage & Gold');
  const [wpUrl, setWpUrl] = useState('');
  const [isUploadingWp, setIsUploadingWp] = useState(false);

  // Music state
  const [musicList, setMusicList] = useState<MusicItem[]>([]);
  const [musicName, setMusicName] = useState('');
  const [musicCategory, setMusicCategory] = useState('Romantic & Wedding');
  const [musicUrl, setMusicUrl] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchWallpapers();
    fetchMusic();
  }, []);

  const fetchWallpapers = async () => {
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*')
      .order('order_index', { ascending: true });
    if (data && !error) setWallpapers(data);
  };

  const fetchMusic = async () => {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .order('order_index', { ascending: true });
    if (data && !error) setMusicList(data);
  };

  // Upload Wallpaper File (Convert to Base64 / URL)
  const handleWpFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Image file size exceeds 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setWpUrl(event.target?.result as string);
      if (!wpName) setWpName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Upload MP3 File (Convert to Base64 / URL)
  const handleMusicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Audio file size exceeds 8MB. Please choose a smaller MP3.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setMusicUrl(event.target?.result as string);
      if (!musicName) setMusicName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Save Wallpaper
  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpName || !wpUrl) {
      alert('Please fill in the name and provide an image.');
      return;
    }
    setIsUploadingWp(true);
    const nextIndex = wallpapers.length > 0 ? Math.max(...wallpapers.map(w => w.order_index || 0)) + 1 : 1;

    const { error } = await supabase.from('wallpapers').insert([
      {
        name: wpName,
        category: wpCategory,
        url: wpUrl,
        order_index: nextIndex
      }
    ]);

    setIsUploadingWp(false);
    if (error) {
      alert('Error saving wallpaper: ' + error.message);
    } else {
      setWpName('');
      setWpUrl('');
      fetchWallpapers();
    }
  };

  // Save Music Track
  const handleAddMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicName || !musicUrl) {
      alert('Please fill in the track name and provide an audio file or URL.');
      return;
    }
    setIsUploadingMusic(true);
    const nextIndex = musicList.length > 0 ? Math.max(...musicList.map(m => m.order_index || 0)) + 1 : 1;

    const { error } = await supabase.from('music_tracks').insert([
      {
        name: musicName,
        category: musicCategory,
        url: musicUrl,
        order_index: nextIndex
      }
    ]);

    setIsUploadingMusic(false);
    if (error) {
      alert('Error saving music track: ' + error.message);
    } else {
      setMusicName('');
      setMusicUrl('');
      fetchMusic();
    }
  };

  // Delete Handlers
  const handleDeleteWp = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallpaper?')) return;
    await supabase.from('wallpapers').delete().eq('id', id);
    fetchWallpapers();
  };

  const handleDeleteMusic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this music track?')) return;
    if (playingTrackId === id && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingTrackId(null);
    }
    await supabase.from('music_tracks').delete().eq('id', id);
    fetchMusic();
  };

  // Reorder Wallpaper (Up / Down)
  const moveWp = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= wallpapers.length) return;

    const currentItem = wallpapers[index];
    const targetItem = wallpapers[targetIndex];

    const currentOrder = currentItem.order_index;
    const targetOrder = targetItem.order_index;

    // Swap order indices in Supabase
    await supabase.from('wallpapers').update({ order_index: targetOrder }).eq('id', currentItem.id);
    await supabase.from('wallpapers').update({ order_index: currentOrder }).eq('id', targetItem.id);

    fetchWallpapers();
  };

  // Reorder Music (Up / Down)
  const moveMusic = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= musicList.length) return;

    const currentItem = musicList[index];
    const targetItem = musicList[targetIndex];

    const currentOrder = currentItem.order_index;
    const targetOrder = targetItem.order_index;

    await supabase.from('music_tracks').update({ order_index: targetOrder }).eq('id', currentItem.id);
    await supabase.from('music_tracks').update({ order_index: currentOrder }).eq('id', targetItem.id);

    fetchMusic();
  };

  // Audio Play / Pause in Admin
  const handleTogglePlay = (track: MusicItem) => {
    if (!audioPlayerRef.current) return;
    const player = audioPlayerRef.current;

    if (playingTrackId === track.id) {
      player.pause();
      setPlayingTrackId(null);
    } else {
      player.pause();
      player.src = track.url;
      player.currentTime = 0;
      player.load();
      player.play().then(() => {
        setPlayingTrackId(track.id);
      }).catch(err => alert('Unable to play track: ' + err.message));
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-6xl mx-auto">
      
      {/* Audio Engine */}
      <audio 
        ref={audioPlayerRef} 
        onEnded={() => setPlayingTrackId(null)}
        onError={() => setPlayingTrackId(null)}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-xl" /> Admin Asset Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload custom MP3 songs, wallpapers, assign categories, and arrange display order.
          </p>
        </div>
        <Link 
          href="/" 
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-2 border border-slate-700 w-fit"
        >
          <i className="fa-solid fa-arrow-left" /> Back to Studio Builder
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 mb-8 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('wallpapers')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'wallpapers' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-images" /> Wallpapers ({wallpapers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('music')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'music' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-music" /> Music Tracks ({musicList.length})
        </button>
      </div>

      {/* ================= SECTION 1: WALLPAPER MANAGEMENT ================= */}
      {activeTab === 'wallpapers' && (
        <div className="space-y-8">
          
          {/* Add Wallpaper Form */}
          <form onSubmit={handleAddWallpaper} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Upload New Wallpaper
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Wallpaper Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Emerald Velvet"
                  value={wpName}
                  onChange={(e) => setWpName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Category</label>
                <input
                  type="text"
                  list="wp-categories"
                  placeholder="e.g. Heritage & Gold"
                  value={wpCategory}
                  onChange={(e) => setWpCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  required
                />
                <datalist id="wp-categories">
                  <option value="Heritage & Gold" />
                  <option value="Floral & Botanical" />
                  <option value="Luxury Marble" />
                  <option value="Pastel & Minimalist" />
                  <option value="Nature & Rustic" />
                  <option value="Geometric & Art" />
                </datalist>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Upload Image or Enter URL</label>
                <div className="flex gap-2">
                  <label className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer border border-slate-700 whitespace-nowrap">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleWpFileUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    placeholder="https://...image.jpg"
                    value={wpUrl.startsWith('data:image') ? 'Uploaded Local Image File' : wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Preview Selected Image */}
            {wpUrl && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-amber-400/30">
                <img src={wpUrl} alt="Preview" className="w-12 h-16 object-cover rounded-xl border border-amber-400/50" />
                <span className="text-xs text-slate-300 font-medium truncate">Ready to save: {wpName || 'Untitled'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploadingWp}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingWp ? 'Saving...' : 'Add Wallpaper to Database'}
            </button>
          </form>

          {/* Wallpaper List & Sorting Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Existing Wallpapers List (Display Order)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wallpapers.map((wp, idx) => (
                <div key={wp.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                  
                  {/* Image Card */}
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-amber-400 font-bold text-[10px] border border-amber-400/30">
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{wp.name}</h4>
                    <span className="text-[10px] text-amber-300/80 font-medium block">{wp.category}</span>
                  </div>

                  {/* Move Up / Down & Delete Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveWp(idx, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWp(idx, 'down')}
                        disabled={idx === wallpapers.length - 1}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteWp(wp.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                      title="Delete Wallpaper"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= SECTION 2: MUSIC MANAGEMENT ================= */}
      {activeTab === 'music' && (
        <div className="space-y-8">
          
          {/* Add Music Form */}
          <form onSubmit={handleAddMusic} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Upload New Music Track (MP3)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Track Title</label>
                <input
                  type="text"
                  placeholder="e.g. Romantic Acoustic Guitar"
                  value={musicName}
                  onChange={(e) => setMusicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Category</label>
                <input
                  type="text"
                  list="music-categories"
                  placeholder="e.g. Romantic & Wedding"
                  value={musicCategory}
                  onChange={(e) => setMusicCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  required
                />
                <datalist id="music-categories">
                  <option value="Romantic & Wedding" />
                  <option value="Traditional & Heritage" />
                  <option value="Acoustic & Chill" />
                  <option value="Spiritual & Ambient" />
                  <option value="Celebration & Joy" />
                  <option value="Majestic Orchestra" />
                </datalist>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Upload MP3 File or Direct URL</label>
                <div className="flex gap-2">
                  <label className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold cursor-pointer border border-slate-700 whitespace-nowrap">
                    Choose MP3
                    <input type="file" accept="audio/*" onChange={handleMusicFileUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    placeholder="https://...song.mp3"
                    value={musicUrl.startsWith('data:audio') ? 'Uploaded Local MP3 File' : musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {musicUrl && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
                <i className="fa-solid fa-file-audio text-emerald-400 text-xl" />
                <span className="text-xs text-emerald-300 font-medium truncate">Ready to save track: {musicName || 'Untitled Track'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploadingMusic}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingMusic ? 'Saving Track...' : 'Add Music Track to Database'}
            </button>
          </form>

          {/* Music Track List & Sorting Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Existing Music Tracks (Display Order)
            </h3>

            <div className="space-y-2.5">
              {musicList.map((track, idx) => {
                const isPlaying = playingTrackId === track.id;

                return (
                  <div 
                    key={track.id} 
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isPlaying ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Order Tag */}
                      <span className="w-6 h-6 rounded-lg bg-slate-950 text-amber-300 font-bold text-[11px] flex items-center justify-center border border-slate-800">
                        #{idx + 1}
                      </span>

                      {/* Play Button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(track)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-transform active:scale-90 cursor-pointer ${
                          isPlaying ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                        }`}
                        title={isPlaying ? 'Stop' : 'Play'}
                      >
                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`} />
                      </button>

                      <div>
                        <h4 className="text-xs font-bold text-white block">{track.name}</h4>
                        <span className="text-[10px] text-amber-300/80 font-medium">{track.category}</span>
                      </div>
                    </div>

                    {/* Reorder & Delete */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveMusic(idx, 'up')}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMusic(idx, 'down')}
                          disabled={idx === musicList.length - 1}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMusic(track.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center cursor-pointer ml-1"
                        title="Delete Track"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </main>
  );
}