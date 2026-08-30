'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface AdminItem {
  id: string;
  name: string;
  category: string;
  url: string;
  order_index: number;
}

const ADMIN_SECRET_PIN = '8899';

export default function SecretAdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<'wallpapers' | 'frames' | 'music'>('frames');
  
  // Wallpapers state
  const [wallpapers, setWallpapers] = useState<AdminItem[]>([]);
  const [wpName, setWpName] = useState('');
  const [wpCategory, setWpCategory] = useState('Heritage & Gold');
  const [wpUrl, setWpUrl] = useState('');
  const [isUploadingWp, setIsUploadingWp] = useState(false);

  // Frames state
  const [frames, setFrames] = useState<AdminItem[]>([]);
  const [frameName, setFrameName] = useState('');
  const [frameCategory, setFrameCategory] = useState('Botanical & Leaves');
  const [frameUrl, setFrameUrl] = useState('');
  const [isUploadingFrame, setIsUploadingFrame] = useState(false);

  // Music state
  const [musicList, setMusicList] = useState<AdminItem[]>([]);
  const [musicName, setMusicName] = useState('');
  const [musicCategory, setMusicCategory] = useState('Romantic & Wedding');
  const [musicUrl, setMusicUrl] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallpapers();
      fetchFrames();
      fetchMusic();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_SECRET_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const fetchWallpapers = async () => {
    const { data } = await supabase.from('wallpapers').select('*').order('order_index', { ascending: true });
    if (data) setWallpapers(data);
  };

  const fetchFrames = async () => {
    const { data } = await supabase.from('frames').select('*').order('order_index', { ascending: true });
    if (data) setFrames(data);
  };

  const fetchMusic = async () => {
    const { data } = await supabase.from('music_tracks').select('*').order('order_index', { ascending: true });
    if (data) setMusicList(data);
  };

  // Upload Handlers
  const handleWpFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setWpUrl(event.target?.result as string);
      if (!wpName) setWpName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleFrameFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFrameUrl(event.target?.result as string);
      if (!frameName) setFrameName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleMusicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setMusicUrl(event.target?.result as string);
      if (!musicName) setMusicName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // Save Handlers
  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpName || !wpUrl) return alert('Name and image are required.');
    setIsUploadingWp(true);
    const nextIndex = wallpapers.length > 0 ? Math.max(...wallpapers.map(w => w.order_index || 0)) + 1 : 1;
    await supabase.from('wallpapers').insert([{ name: wpName, category: wpCategory, url: wpUrl, order_index: nextIndex }]);
    setIsUploadingWp(false);
    setWpName('');
    setWpUrl('');
    fetchWallpapers();
  };

  const handleAddFrame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frameName || !frameUrl) return alert('Name and frame image are required.');
    setIsUploadingFrame(true);
    const nextIndex = frames.length > 0 ? Math.max(...frames.map(f => f.order_index || 0)) + 1 : 1;
    await supabase.from('frames').insert([{ name: frameName, category: frameCategory, url: frameUrl, order_index: nextIndex }]);
    setIsUploadingFrame(false);
    setFrameName('');
    setFrameUrl('');
    fetchFrames();
  };

  const handleAddMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicName || !musicUrl) return alert('Name and audio are required.');
    setIsUploadingMusic(true);
    const nextIndex = musicList.length > 0 ? Math.max(...musicList.map(m => m.order_index || 0)) + 1 : 1;
    await supabase.from('music_tracks').insert([{ name: musicName, category: musicCategory, url: musicUrl, order_index: nextIndex }]);
    setIsUploadingMusic(false);
    setMusicName('');
    setMusicUrl('');
    fetchMusic();
  };

  // Delete Handlers
  const handleDeleteWp = async (id: string) => {
    if (!confirm('Delete wallpaper?')) return;
    await supabase.from('wallpapers').delete().eq('id', id);
    fetchWallpapers();
  };

  const handleDeleteFrame = async (id: string) => {
    if (!confirm('Delete frame?')) return;
    await supabase.from('frames').delete().eq('id', id);
    fetchFrames();
  };

  const handleDeleteMusic = async (id: string) => {
    if (!confirm('Delete music track?')) return;
    await supabase.from('music_tracks').delete().eq('id', id);
    fetchMusic();
  };

  // Reorder Handlers
  const moveWp = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= wallpapers.length) return;
    await supabase.from('wallpapers').update({ order_index: wallpapers[target].order_index }).eq('id', wallpapers[index].id);
    await supabase.from('wallpapers').update({ order_index: wallpapers[index].order_index }).eq('id', wallpapers[target].id);
    fetchWallpapers();
  };

  const moveFrame = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= frames.length) return;
    await supabase.from('frames').update({ order_index: frames[target].order_index }).eq('id', frames[index].id);
    await supabase.from('frames').update({ order_index: frames[index].order_index }).eq('id', frames[target].id);
    fetchFrames();
  };

  const moveMusic = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= musicList.length) return;
    await supabase.from('music_tracks').update({ order_index: musicList[target].order_index }).eq('id', musicList[index].id);
    await supabase.from('music_tracks').update({ order_index: musicList[index].order_index }).eq('id', musicList[target].id);
    fetchMusic();
  };

  const handleTogglePlay = (track: AdminItem) => {
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
      player.play().then(() => setPlayingTrackId(track.id));
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <form onSubmit={handleLogin} className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl">
            <i className="fa-solid fa-lock" />
          </div>
          <h2 className="text-lg font-bold text-white">Private Admin Access</h2>
          <p className="text-xs text-slate-400">Enter your secret 4-digit PIN to access asset management.</p>
          
          <input
            type="password"
            maxLength={6}
            placeholder="••••"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full py-3 text-center tracking-[8px] text-lg font-mono rounded-xl bg-slate-950 border border-slate-700 text-amber-300 focus:border-amber-400 outline-none"
            autoFocus
          />

          {pinError && <p className="text-xs text-red-400 font-medium">Incorrect PIN code. Please try again.</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer"
          >
            Unlock Portal
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-6xl mx-auto">
      
      <audio 
        ref={audioPlayerRef} 
        onEnded={() => setPlayingTrackId(null)}
        onError={() => setPlayingTrackId(null)}
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-xl" /> Secret Asset Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload custom MP3 songs, wallpapers, leaf frames, and arrange display order.
          </p>
        </div>
        <Link 
          href="/" 
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-2 border border-slate-700 w-fit"
        >
          <i className="fa-solid fa-arrow-left" /> Back to Studio
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 mb-8 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('frames')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'frames' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-leaf" /> Frames ({frames.length})
        </button>
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
          <i className="fa-solid fa-music" /> Music ({musicList.length})
        </button>
      </div>

      {/* ================= SECTION 1: FRAMES MANAGEMENT ================= */}
      {activeTab === 'frames' && (
        <div className="space-y-8">
          <form onSubmit={handleAddFrame} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up text-emerald-400" /> Upload New Foreground Frame (PNG Transparent)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Frame Title</label>
                <input
                  type="text"
                  placeholder="e.g. Tropical Monstera Leaves Frame"
                  value={frameName}
                  onChange={(e) => setFrameName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Category</label>
                <input
                  type="text"
                  list="frame-categories"
                  placeholder="e.g. Botanical & Leaves"
                  value={frameCategory}
                  onChange={(e) => setFrameCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-emerald-400 outline-none"
                  required
                />
                <datalist id="frame-categories">
                  <option value="Botanical & Leaves" />
                  <option value="Gold Borders" />
                  <option value="Floral Bouquets" />
                  <option value="Vintage Minimal" />
                </datalist>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Upload Image or URL</label>
                <div className="flex gap-2">
                  <label className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold cursor-pointer border border-slate-700 whitespace-nowrap">
                    Choose PNG
                    <input type="file" accept="image/*" onChange={handleFrameFileUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    placeholder="https://...frame.png"
                    value={frameUrl.startsWith('data:image') ? 'Uploaded Local PNG File' : frameUrl}
                    onChange={(e) => setFrameUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {frameUrl && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
                <img src={frameUrl} alt="Frame Preview" className="w-12 h-16 object-contain rounded-xl border border-emerald-400/50 bg-slate-900" />
                <span className="text-xs text-emerald-300 font-medium truncate">Ready to save frame: {frameName || 'Untitled Frame'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploadingFrame}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingFrame ? 'Saving Frame...' : 'Add Frame to Database'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Existing Frames List (Display Order)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {frames.map((frame, idx) => (
                <div key={frame.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center justify-center">
                    <img src={frame.url} alt={frame.name} className="w-full h-full object-contain" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-emerald-400 font-bold text-[10px] border border-emerald-400/30">
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{frame.name}</h4>
                    <span className="text-[10px] text-emerald-300/80 font-medium block">{frame.category}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFrame(idx, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-emerald-300 text-xs flex items-center justify-center cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFrame(idx, 'down')}
                        disabled={idx === frames.length - 1}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-emerald-300 text-xs flex items-center justify-center cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFrame(frame.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center cursor-pointer"
                      title="Delete Frame"
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

      {/* ================= SECTION 2: WALLPAPERS MANAGEMENT ================= */}
      {activeTab === 'wallpapers' && (
        <div className="space-y-8">
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
                  placeholder="e.g. Heritage & Gold"
                  value={wpCategory}
                  onChange={(e) => setWpCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  required
                />
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

            <button
              type="submit"
              disabled={isUploadingWp}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingWp ? 'Saving...' : 'Add Wallpaper to Database'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Existing Wallpapers List
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wallpapers.map((wp, idx) => (
                <div key={wp.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
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

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveWp(idx, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWp(idx, 'down')}
                        disabled={idx === wallpapers.length - 1}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteWp(wp.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center cursor-pointer"
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

      {/* ================= SECTION 3: MUSIC MANAGEMENT ================= */}
      {activeTab === 'music' && (
        <div className="space-y-8">
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
                  placeholder="e.g. Romantic & Wedding"
                  value={musicCategory}
                  onChange={(e) => setMusicCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Upload MP3 File or URL</label>
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

            <button
              type="submit"
              disabled={isUploadingMusic}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingMusic ? 'Saving Track...' : 'Add Music Track to Database'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Existing Music Tracks
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
                      <span className="w-6 h-6 rounded-lg bg-slate-950 text-amber-300 font-bold text-[11px] flex items-center justify-center border border-slate-800">
                        #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTogglePlay(track)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-transform active:scale-90 cursor-pointer ${
                          isPlaying ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                        }`}
                      >
                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`} />
                      </button>

                      <div>
                        <h4 className="text-xs font-bold text-white block">{track.name}</h4>
                        <span className="text-[10px] text-amber-300/80 font-medium">{track.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveMusic(idx, 'up')}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMusic(idx, 'down')}
                          disabled={idx === musicList.length - 1}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 text-xs flex items-center justify-center cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMusic(track.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center cursor-pointer ml-1"
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