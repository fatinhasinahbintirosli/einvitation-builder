'use client';

import React, { useState, useEffect } from 'react';
import { CardData, SlideType } from '@/types/invitation';
import { globalAudio } from '@/lib/audioEngine';

type SlideItem = CardData['slides'][number];

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  slug?: string;
  setSlug?: (slug: string) => void;
  generatedUrl?: string | null;
  activeSlideIndex?: number | 'cover';
  onActiveSlideChange?: (index: number | 'cover') => void;
}

// 50 Wallpapers Library
interface WallpaperItem {
  id: string;
  name: string;
  category: string;
  url: string;
}

const WALLPAPER_LIBRARY: WallpaperItem[] = [
  { id: 'w1', name: 'Golden Songket Weave', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w2', name: 'Royal Dark Brocade', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w3', name: 'Crimson Velvet Texture', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w4', name: 'Copper Batik Motif', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1606768666853-403c90a981ad?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w5', name: 'Emerald Royal Cloth', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w6', name: 'Golden Threads Pattern', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w7', name: 'Midnight Navy Silk', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w8', name: 'Ivory Silver Texture', category: 'Heritage & Gold', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w9', name: 'Moody Dark Rose', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w10', name: 'White Blossom Radiance', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w11', name: 'Soft Purple Orchid', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w12', name: 'Wildflower Aesthetic', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w13', name: 'Cream Rose Petals', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w14', name: 'Golden Foliage Leaves', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w15', name: 'Sakura Petals Romance', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w16', name: 'Pastel Blue Hydrangea', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w17', name: 'Vintage Garden Bouquet', category: 'Floral & Botanical', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w18', name: 'Golden Dust Glow', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w19', name: 'Black & Gold Veined Marble', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w20', name: 'Crystal Sparkles Ambient', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w21', name: 'Flowing Gold Waves', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w22', name: 'Warm Bokeh Illumination', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w23', name: 'Diamond Shimmer Backdrop', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w24', name: 'Polished Bronze Sheet', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w25', name: 'Abstract Gilded Orbs', category: 'Luxury Marble', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w26', name: 'Textured Handmade Paper', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w27', name: 'Pure Carrara Marble', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w28', name: 'Blush Sunset Clouds', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w29', name: 'Soft Minimal Plaster', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w30', name: 'Cool Lavender Gradient', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w31', name: 'Natural Oatmeal Linen', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w32', name: 'Peaceful Morning Mist', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w33', name: 'Soft Peach Silk Drape', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w34', name: 'Warm Cream Canvas', category: 'Pastel & Minimalist', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w35', name: 'Emerald Forest Canopy', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w36', name: 'Sunlit Pine Grove', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w37', name: 'Lush Tropical Palms', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w38', name: 'Wild Green Meadows', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w39', name: 'Rustic Cedar Timber', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w40', name: 'Coastline Waves Serenity', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w41', name: 'Silver Dollar Eucalyptus', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w42', name: 'Misty Mountain Horizon', category: 'Nature & Rustic', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w43', name: 'Gilded Arabesque Lattice', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w44', name: 'Royal Palace Mosaic', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w45', name: 'Luminous Dome Illumination', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w46', name: 'Antique Moorish Archway', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w47', name: 'Intricate Calligraphy Stone', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w48', name: 'Moroccan Brass Lanterns', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w49', name: 'Mandala Star Geometry', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w50', name: 'Traditional Carved Woodwork', category: 'Geometric & Art', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop' },
];

const WALLPAPER_CATEGORIES = [
  'All',
  'Heritage & Gold',
  'Floral & Botanical',
  'Luxury Marble',
  'Pastel & Minimalist',
  'Nature & Rustic',
  'Geometric & Art'
];

// 50 High-Quality Melodies Library
interface MusicItem {
  id: string;
  name: string;
  category: string;
  trackCode: string;
}

const MUSIC_LIBRARY: MusicItem[] = [
  { id: 'm1', name: 'Pachelbel - Canon in D (Piano & Strings)', category: 'Romantic & Wedding', trackCode: 'm1' },
  { id: 'm2', name: 'Debussy - Clair de Lune (Soft Serenade)', category: 'Romantic & Wedding', trackCode: 'm2' },
  { id: 'm3', name: 'Mendelssohn - Wedding March (Royal Fanfare)', category: 'Romantic & Wedding', trackCode: 'm3' },
  { id: 'm4', name: 'Chopin - Nocturne Op. 9 No. 2 (Sweet Romance)', category: 'Romantic & Wedding', trackCode: 'm4' },
  { id: 'm5', name: 'Erik Satie - Gymnopédie No. 1 (Tranquility)', category: 'Romantic & Wedding', trackCode: 'm5' },
  { id: 'm6', name: 'Liszt - Liebestraum No. 3 (Love Dream)', category: 'Romantic & Wedding', trackCode: 'm6' },
  { id: 'm7', name: 'J.S. Bach - Air on the G String (Strings Pad)', category: 'Romantic & Wedding', trackCode: 'm7' },
  { id: 'm8', name: 'Brahms - Lullaby of Devotion', category: 'Romantic & Wedding', trackCode: 'm8' },
  { id: 'm9', name: 'Peaceful Gamelan Heritage Chimes', category: 'Traditional & Heritage', trackCode: 'm9' },
  { id: 'm10', name: 'Rainforest Sape Folk Acoustic', category: 'Traditional & Heritage', trackCode: 'm10' },
  { id: 'm11', name: 'Arabian Oud Royal Serenade', category: 'Traditional & Heritage', trackCode: 'm11' },
  { id: 'm12', name: 'Eastern Bamboo Flute (Zen Spirit)', category: 'Traditional & Heritage', trackCode: 'm12' },
  { id: 'm13', name: 'Enchanted Angklung Harmony', category: 'Traditional & Heritage', trackCode: 'm13' },
  { id: 'm14', name: 'Palace Gamelan Royal Entrance', category: 'Traditional & Heritage', trackCode: 'm14' },
  { id: 'm15', name: 'Meditative Suling Flute', category: 'Traditional & Heritage', trackCode: 'm15' },
  { id: 'm16', name: 'Silk Road Ambient Strings', category: 'Traditional & Heritage', trackCode: 'm16' },
  { id: 'm17', name: 'Spring Breeze Acoustic Guitar', category: 'Acoustic & Chill', trackCode: 'm17' },
  { id: 'm18', name: 'Fingerstyle Warmth & Love', category: 'Acoustic & Chill', trackCode: 'm18' },
  { id: 'm19', name: 'Gentle Afternoon Strumming', category: 'Acoustic & Chill', trackCode: 'm19' },
  { id: 'm20', name: 'Golden Sunset Acoustic Glow', category: 'Acoustic & Chill', trackCode: 'm20' },
  { id: 'm21', name: 'Coffeehouse Piano & Nylon Guitar', category: 'Acoustic & Chill', trackCode: 'm21' },
  { id: 'm22', name: 'Sweet Memories with Friends', category: 'Acoustic & Chill', trackCode: 'm22' },
  { id: 'm23', name: 'Morning Dew Ambient Reflection', category: 'Acoustic & Chill', trackCode: 'm23' },
  { id: 'm24', name: 'Highland Serenity Folk', category: 'Acoustic & Chill', trackCode: 'm24' },
  { id: 'm25', name: 'Spiritual Grace & Blessing Ambient', category: 'Spiritual & Ambient', trackCode: 'm25' },
  { id: 'm26', name: 'Ney Flute Sacred Meditation', category: 'Spiritual & Ambient', trackCode: 'm26' },
  { id: 'm27', name: 'Dawn Awakening Spiritual Strings', category: 'Spiritual & Ambient', trackCode: 'm27' },
  { id: 'm28', name: 'Humble Gratitude Oud Harmony', category: 'Spiritual & Ambient', trackCode: 'm28' },
  { id: 'm29', name: 'Peaceful Sanctuary Meditation', category: 'Spiritual & Ambient', trackCode: 'm29' },
  { id: 'm30', name: 'Ambient Light Healing Pads', category: 'Spiritual & Ambient', trackCode: 'm30' },
  { id: 'm31', name: 'Mystic Desert Flute Reverie', category: 'Spiritual & Ambient', trackCode: 'm31' },
  { id: 'm32', name: 'Evening Prayer of Gratitude', category: 'Spiritual & Ambient', trackCode: 'm32' },
  { id: 'm33', name: 'Music Box Lullaby Dreams', category: 'Celebration & Joy', trackCode: 'm33' },
  { id: 'm34', name: 'Twinkle Glockenspiel Chime', category: 'Celebration & Joy', trackCode: 'm34' },
  { id: 'm35', name: 'Happy Ukulele Celebration', category: 'Celebration & Joy', trackCode: 'm35' },
  { id: 'm36', name: 'Sweet Dreams Nursery Tune', category: 'Celebration & Joy', trackCode: 'm36' },
  { id: 'm37', name: 'Playful Sunshine Acoustic', category: 'Celebration & Joy', trackCode: 'm37' },
  { id: 'm38', name: 'Joyful Family Gathering', category: 'Celebration & Joy', trackCode: 'm38' },
  { id: 'm39', name: 'Tender Motherly Music Box', category: 'Celebration & Joy', trackCode: 'm39' },
  { id: 'm40', name: 'First Steps of Wonder', category: 'Celebration & Joy', trackCode: 'm40' },
  { id: 'm41', name: 'Lively Birthday Festive Waltz', category: 'Celebration & Joy', trackCode: 'm41' },
  { id: 'm42', name: 'Vivaldi - Four Seasons (Spring Allegro)', category: 'Majestic Orchestra', trackCode: 'm42' },
  { id: 'm43', name: 'Tchaikovsky - Waltz of the Flowers', category: 'Majestic Orchestra', trackCode: 'm43' },
  { id: 'm44', name: 'Mozart - Eine kleine Nachtmusik', category: 'Majestic Orchestra', trackCode: 'm44' },
  { id: 'm45', name: 'J.S. Bach - Brandenburg Concerto No. 3', category: 'Majestic Orchestra', trackCode: 'm45' },
  { id: 'm46', name: 'Beethoven - Moonlight Sonata Adagio', category: 'Majestic Orchestra', trackCode: 'm46' },
  { id: 'm47', name: 'Royal Grand Ballroom Waltz', category: 'Majestic Orchestra', trackCode: 'm47' },
  { id: 'm48', name: 'Imperial Coronation Symphony', category: 'Majestic Orchestra', trackCode: 'm48' },
  { id: 'm49', name: 'Cinematic Gala Theme', category: 'Majestic Orchestra', trackCode: 'm49' },
  { id: 'm50', name: 'Grand Finale Strings & Brass', category: 'Majestic Orchestra', trackCode: 'm50' },
];

const MUSIC_CATEGORIES = [
  'All',
  'Romantic & Wedding',
  'Traditional & Heritage',
  'Acoustic & Chill',
  'Spiritual & Ambient',
  'Celebration & Joy',
  'Majestic Orchestra'
];

const FONT_PRESETS_HEADING = [
  { name: 'Cinzel (Royal Roman)', value: 'Cinzel, serif' },
  { name: 'Great Vibes (Romantic Calligraphy)', value: 'Great Vibes, cursive' },
  { name: 'Playfair Display (Luxury Serif)', value: 'Playfair Display, serif' },
  { name: 'Cormorant Garamond (Editorial Vintage)', value: 'Cormorant Garamond, serif' },
  { name: 'Montserrat (Modern Geometric)', value: 'Montserrat, sans-serif' },
  { name: 'Alex Brush (Formal Script)', value: 'Alex Brush, cursive' },
  { name: 'Poppins (Clean Chic Sans)', value: 'Poppins, sans-serif' },
];

const FONT_PRESETS_BODY = [
  { name: 'Playfair Display (Classic Serif)', value: 'Playfair Display, serif' },
  { name: 'Inter (Sleek Clean Sans)', value: 'Inter, sans-serif' },
  { name: 'Lora (Literary Modern Serif)', value: 'Lora, serif' },
  { name: 'Cinzel (Uppercase Elegance)', value: 'Cinzel, serif' },
  { name: 'Montserrat (Refined Sans)', value: 'Montserrat, sans-serif' },
];

const FONT_SIZE_PRESETS = [
  { label: 'Compact (90%)', value: 90 },
  { label: 'Standard (100%)', value: 100 },
  { label: 'Large (110%)', value: 110 },
  { label: 'X-Large (120%)', value: 120 },
];

const COLOR_PRESETS = [
  { name: 'Emerald Forest', hex: '#2d4a3e' },
  { name: 'Royal Navy', hex: '#172554' },
  { name: 'Deep Maroon', hex: '#451a24' },
  { name: 'Espresso Brown', hex: '#3e2723' },
  { name: 'Champagne Gold', hex: '#63513d' },
  { name: 'Midnight Onyx', hex: '#18181b' },
  { name: 'Dusty Rose', hex: '#5c3a4d' },
  { name: 'Classic Slate', hex: '#1e293b' },
];

const CARD_BOX_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Warm Ivory', hex: '#fdfbf7' },
  { name: 'Cream Linen', hex: '#f5f0e8' },
  { name: 'Midnight Glass', hex: '#0f172a' },
  { name: 'Deep Emerald', hex: '#142820' },
  { name: 'Velvet Maroon', hex: '#2e1219' },
  { name: 'Charcoal Tint', hex: '#1e293b' },
];

const OPACITY_PRESETS = [
  { label: '0% Invisible', value: 0 },
  { label: '50% Glass', value: 50 },
  { label: '75% Frosted', value: 75 },
  { label: '90% Crisp', value: 90 },
  { label: '100% Solid', value: 100 },
];

export default function BuilderForm({ 
  data, 
  onChange, 
  onSave, 
  isSaving = false,
  slug,
  setSlug,
  generatedUrl,
  activeSlideIndex,
  onActiveSlideChange
}: Props) {
  const [activeTab, setActiveTab] = useState<'cover' | 'slides' | 'music'>('cover');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioUploadSuccess, setAudioUploadSuccess] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modals state
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [wallpaperModalTarget, setWallpaperModalTarget] = useState<'cover' | 'slide'>('cover');
  const [selectedWallpaperCategory, setSelectedWallpaperCategory] = useState('All');

  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('All');
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Synchronize audio playing state with global Audio Service
  useEffect(() => {
    const unsubscribe = globalAudio.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
      setPreviewTrackId(state.trackId);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const bgType = data.theme?.coverBgType || 'color';
  const currentOpacity = typeof data.theme?.cardOpacity === 'number' ? data.theme.cardOpacity : 90;
  const currentBoxColor = data.theme?.cardBoxColor || '#ffffff';

  const updateData = (newData: CardData) => {
    onChange(newData);
  };

  const handleTabChange = (tab: 'cover' | 'slides' | 'music') => {
    setActiveTab(tab);
    if (tab === 'cover') {
      onActiveSlideChange?.('cover');
    } else if (tab === 'slides') {
      onActiveSlideChange?.(typeof activeSlideIndex === 'number' ? activeSlideIndex : 0);
    } else if (tab === 'music') {
      onActiveSlideChange?.('cover');
    }
  };

  // Direct Audio Upload from Device (100% Offline & Reliable!)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Audio file size exceeds 8MB. Please choose a smaller MP3 file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Audio = event.target?.result as string;
      updateData({ ...data, cover: { ...data.cover, audioUrl: base64Audio } });
      setAudioUploadSuccess(`Loaded: ${file.name}`);
      globalAudio.play(base64Audio);
    };
    reader.readAsDataURL(file);
  };

  // Instant Audio Play / Stop in Modal
  const handleTogglePreviewMusic = (trackCode: string) => {
    if (previewTrackId === trackCode && isPlayingAudio) {
      globalAudio.stop();
    } else {
      globalAudio.play(trackCode);
    }
  };

  const handleSelectTrack = (trackCode: string) => {
    globalAudio.stop();
    updateData({ ...data, cover: { ...data.cover, audioUrl: trackCode } });
    setIsMusicModalOpen(false);
  };

  const openWallpaperModal = (target: 'cover' | 'slide') => {
    setWallpaperModalTarget(target);
    setIsWallpaperModalOpen(true);
  };

  const handleSelectWallpaper = (url: string) => {
    if (wallpaperModalTarget === 'cover') {
      updateData({
        ...data,
        theme: {
          ...data.theme,
          coverBgType: 'image',
          coverBgUrl: url
        }
      });
      onActiveSlideChange?.('cover');
    } else {
      updateData({
        ...data,
        theme: {
          ...data.theme,
          slideBgUrl: url,
          bgPatternUrl: url
        }
      });
      if (activeSlideIndex === 'cover') {
        onActiveSlideChange?.(0);
      }
    }
    setIsWallpaperModalOpen(false);
  };

  const handleCoverWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('File size exceeds 3MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: {
          ...data.theme,
          coverBgType: 'image',
          coverBgUrl: base64Url
        }
      });
      onActiveSlideChange?.('cover');
    };
    reader.readAsDataURL(file);
  };

  const handleSlideWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('File size exceeds 3MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: {
          ...data.theme,
          slideBgUrl: base64Url,
          bgPatternUrl: base64Url
        }
      });
      if (activeSlideIndex === 'cover') {
        onActiveSlideChange?.(0);
      }
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
      onActiveSlideChange?.(slideIndex);
    };
    reader.readAsDataURL(file);
  };

  const updateSlide = (index: number, updatedFields: Partial<SlideItem>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      ...updatedFields
    };
    updateData({ ...data, slides: updatedSlides });
    onActiveSlideChange?.(index);
  };

  const addNewSlide = () => {
    const newSlide: SlideItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'location',
      title: 'EVENT LOCATION',
      locationDetails: {
        venueName: 'The Grand Ballroom',
        address: '123 Luxury Boulevard, Suite 500, New York',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      }
    };
    const newIndex = data.slides.length;
    updateData({ ...data, slides: [...data.slides, newSlide] });
    onActiveSlideChange?.(newIndex);
  };

  const removeSlide = (index: number) => {
    if (data.slides.length <= 1) {
      alert('The card requires at least 1 slide.');
      return;
    }
    const updatedSlides = data.slides.filter((_, idx) => idx !== index);
    updateData({ ...data, slides: updatedSlides });
    onActiveSlideChange?.(Math.max(0, index - 1));
  };

  const handleTypeChange = (index: number, newType: SlideType) => {
    const currentSlide = data.slides[index];
    let updated: Partial<SlideItem> = { type: newType };

    if (newType === 'location' && !currentSlide.locationDetails) {
      updated.title = 'EVENT VENUE';
      updated.locationDetails = {
        venueName: 'Grand Estate & Ballroom',
        address: 'Full address details here...',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      };
    } else if (newType === 'tentative' && !currentSlide.timeline) {
      updated.title = 'EVENT SCHEDULE';
      updated.timeline = [
        { time: '05:00 PM', activity: 'Guest Arrival & Welcome Drinks' },
        { time: '06:30 PM', activity: 'Solemnization / Main Ceremony' },
        { time: '08:00 PM', activity: 'Gala Dinner & Speeches' }
      ];
    } else if (newType === 'image_qr') {
      updated.title = 'GIFT REGISTRY / QR';
      updated.subtitle = 'Digital Angpow & Blessings';
      updated.bodyText = 'Scan the QR code below for your warm gift and thoughts.';
    } else if (newType === 'guestbook') {
      updated.title = 'GUESTBOOK & WISHES';
      updated.subtitle = 'Leave a Warm Blessing';
      updated.bodyText = 'May your presence and prayers bring joy to our new chapter.';
    } else if (newType === 'thank_you') {
      updated.title = 'WITH GRATITUDE';
      updated.bodyText = 'Heartfelt thanks for being part of our special celebration.';
    }

    updateSlide(index, updated);
  };

  const addTimelineItem = (slideIndex: number) => {
    const slide = data.slides[slideIndex];
    const currentTimeline = slide.timeline || [];
    const newTimeline = [...currentTimeline, { time: '07:00 PM', activity: 'New Activity' }];
    updateSlide(slideIndex, { timeline: newTimeline });
  };

  const removeTimelineItem = (slideIndex: number, itemIndex: number) => {
    const slide = data.slides[slideIndex];
    const newTimeline = (slide.timeline || []).filter((_, idx) => idx !== itemIndex);
    updateSlide(slideIndex, { timeline: newTimeline });
  };

  const updateTimelineItem = (slideIndex: number, itemIndex: number, field: 'time' | 'activity', value: string) => {
    const slide = data.slides[slideIndex];
    const newTimeline = [...(slide.timeline || [])];
    newTimeline[itemIndex] = { ...newTimeline[itemIndex], [field]: value };
    updateSlide(slideIndex, { timeline: newTimeline });
  };

  const handleStripeCheckout = async () => {
    if (!slug) return;
    setIsCheckingOut(true);

    try {
      if (onSave) {
        await onSave();
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });

      const resData = await res.json();
      if (resData.url) {
        window.location.href = resData.url;
      } else {
        alert('Error starting checkout: ' + (resData.error || 'Please try again.'));
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredWallpapers = selectedWallpaperCategory === 'All' 
    ? WALLPAPER_LIBRARY 
    : WALLPAPER_LIBRARY.filter(w => w.category === selectedWallpaperCategory);

  const filteredMusic = selectedMusicCategory === 'All'
    ? MUSIC_LIBRARY
    : MUSIC_LIBRARY.filter(m => m.category === selectedMusicCategory);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl space-y-5">
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Digital Invitation Studio</h2>
        <p className="text-xs text-slate-400 mt-1">Independent cover & slide font customization, box color & 0-100% transparency.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabChange('cover')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'cover' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Cover Page
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('slides')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Slides & Box Styling ({data.slides?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('music')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'music' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Music & Sound
        </button>
      </div>

      {/* ================= TAB 1: COVER PAGE ONLY ================= */}
      {activeTab === 'cover' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          
          {/* COVER TYPOGRAPHY */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/25 space-y-3.5">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-font" /> Cover Typography (Front Page Only)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Cover Header Font</label>
                <select
                  value={data.theme?.coverHeadingFont || 'Cinzel, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, coverHeadingFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs font-semibold outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_HEADING.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Cover Guest Name Font</label>
                <select
                  value={data.theme?.coverBodyFont || 'Playfair Display, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, coverBodyFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_BODY.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Font Size Scaling */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium">Cover Font Scaling:</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {data.theme?.coverFontSizeScale || 100}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FONT_SIZE_PRESETS.map((scalePreset) => (
                  <button
                    key={scalePreset.value}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, coverFontSizeScale: scalePreset.value } })}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      (data.theme?.coverFontSizeScale || 100) === scalePreset.value
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {scalePreset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COVER BACKGROUND */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Cover Background (Front Page Only)
              </label>
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    updateData({ ...data, theme: { ...data.theme, coverBgType: 'color' } });
                    onActiveSlideChange?.('cover');
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bgType === 'color' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-palette mr-1" /> Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateData({ ...data, theme: { ...data.theme, coverBgType: 'image' } });
                    onActiveSlideChange?.('cover');
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bgType === 'image' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-image mr-1" /> Image / Wallpaper
                </button>
              </div>
            </div>

            {bgType === 'color' && (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] text-slate-400 block font-medium">Select a theme palette color:</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => {
                        updateData({
                          ...data,
                          theme: { ...data.theme, coverBgColor: color.hex, primaryColor: color.hex }
                        });
                        onActiveSlideChange?.('cover');
                      }}
                      className={`h-10 rounded-xl border-2 transition-transform flex items-center justify-center ${
                        (data.theme?.coverBgColor || data.theme?.primaryColor) === color.hex
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-slate-700 hover:scale-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {(data.theme?.coverBgColor || data.theme?.primaryColor) === color.hex && (
                        <i className="fa-solid fa-check text-white text-xs" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="text-[11px] text-slate-400">Custom Hex Color:</label>
                  <input
                    type="color"
                    value={data.theme?.coverBgColor || data.theme?.primaryColor || '#2d4a3e'}
                    onChange={(e) => {
                      updateData({
                        ...data,
                        theme: { ...data.theme, coverBgColor: e.target.value, primaryColor: e.target.value }
                      });
                      onActiveSlideChange?.('cover');
                    }}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="text-xs text-amber-300 font-mono font-bold">
                    {data.theme?.coverBgColor || data.theme?.primaryColor || '#2d4a3e'}
                  </span>
                </div>
              </div>
            )}

            {bgType === 'image' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => openWallpaperModal('cover')}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-images text-base" /> Choose Cover Wallpaper (50 Items)
                  </button>

                  <label className="py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Upload Image
                    <input type="file" accept="image/*" onChange={handleCoverWallpaperUpload} className="hidden" />
                  </label>
                </div>
                {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              </div>
            )}
          </div>
          
          {/* Cover Text Inputs */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Top Tagline / Sub-Header</label>
            <input
              type="text"
              value={data.cover?.tagline || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
              placeholder="e.g. The Wedding Celebration Of"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Main Event Title / Couple Names</label>
            <input
              type="text"
              value={data.cover?.mainTitle || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
              placeholder="e.g. Emma & Liam"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Event Date (Short Display)</label>
            <input
              type="text"
              value={data.cover?.dateText || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
              placeholder="e.g. SUNDAY, OCTOBER 18, 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: SLIDES & CARD BOX STYLING ================= */}
      {activeTab === 'slides' && (
        <div className="space-y-4">
          
          {/* 1. CARD BOX COLOR & 0-100% OPACITY */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-box-open" /> Card Box Color & Transparency (0% - 100%)
              </label>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                {currentOpacity === 0 ? '0% (Invisible Box)' : `${currentOpacity}% Opacity`}
              </span>
            </div>

            {/* Choose Card Box Color */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 block font-medium">Select Card Box Color:</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {CARD_BOX_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, cardBoxColor: color.hex } })}
                    className={`h-9 rounded-xl border-2 transition-transform flex items-center justify-center ${
                      currentBoxColor === color.hex ? 'border-amber-400 scale-105 shadow' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {currentBoxColor === color.hex && (
                      <i className={`fa-solid fa-check text-xs ${color.hex === '#ffffff' || color.hex === '#fdfbf7' || color.hex === '#f5f0e8' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="text-[11px] text-slate-400">Custom Box Color:</label>
                <input
                  type="color"
                  value={currentBoxColor}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, cardBoxColor: e.target.value } })}
                  className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <span className="text-xs text-amber-300 font-mono font-bold">{currentBoxColor}</span>
              </div>
            </div>

            {/* 0-100% Opacity Slider */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold">0% (Invisible)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentOpacity}
                  onChange={(e) => {
                    updateData({
                      ...data,
                      theme: { ...data.theme, cardOpacity: Number(e.target.value) }
                    });
                    if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 font-bold">100% (Solid)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {OPACITY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      updateData({
                        ...data,
                        theme: { ...data.theme, cardOpacity: preset.value }
                      });
                      if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
                    }}
                    className={`py-1 px-2 rounded-lg text-[10px] font-medium border transition-all ${
                      currentOpacity === preset.value
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. SLIDE TYPOGRAPHY */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-font" /> Slide Typography (Inner Pages Only)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Slide Header Font</label>
                <select
                  value={data.theme?.slideHeadingFont || 'Cinzel, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, slideHeadingFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs font-semibold outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_HEADING.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Slide Content Font</label>
                <select
                  value={data.theme?.slideBodyFont || 'Playfair Display, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, slideBodyFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_BODY.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slide Font Size Scaling */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium">Slide Content Scaling:</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {data.theme?.slideFontSizeScale || 100}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FONT_SIZE_PRESETS.map((scalePreset) => (
                  <button
                    key={scalePreset.value}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, slideFontSizeScale: scalePreset.value } })}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      (data.theme?.slideFontSizeScale || 100) === scalePreset.value
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {scalePreset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. INNER SLIDE WALLPAPER */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group" /> Inner Slide Wallpaper
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => openWallpaperModal('slide')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-images" /> Choose Slide Wallpaper (50 Items)
              </button>

              <label className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Upload File
                <input type="file" accept="image/*" onChange={handleSlideWallpaperUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* 4. SLIDE LIST */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {data.slides.map((slide, idx) => {
              const isCurrentlyActive = activeSlideIndex === idx;

              return (
                <div 
                  key={slide.id || idx} 
                  onClick={() => onActiveSlideChange?.(idx)}
                  className={`p-4 rounded-2xl bg-slate-950/80 border transition-all space-y-3.5 ${
                    isCurrentlyActive ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isCurrentlyActive ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <select
                        value={slide.type}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => handleTypeChange(idx, e.target.value as SlideType)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-semibold outline-none cursor-pointer focus:border-amber-400"
                      >
                        <option value="intro">✨ Introduction & Welcome</option>
                        <option value="location">📍 Location & Maps (Google / Waze)</option>
                        <option value="tentative">📅 Schedule & Timeline</option>
                        <option value="image_qr">📷 Gift Registry / QR Code</option>
                        <option value="guestbook">📖 Guestbook & Wishes</option>
                        <option value="thank_you">🙏 Thank You & Closing Note</option>
                      </select>

                      {isCurrentlyActive && (
                        <span className="text-[9px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Active in Preview
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.title || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { title: e.target.value })}
                        placeholder="Slide Header"
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right text-slate-300 outline-none w-32"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(idx);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 text-xs"
                        title="Delete This Slide"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>

                  {/* INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Welcome Message</label>
                        <textarea
                          rows={2}
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Celebrant / Couple Full Name</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Center Portrait Photo</label>
                        <div className="flex items-center gap-3">
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                          )}
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                            Choose Photo File
                            <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOCATION */}
                  {slide.type === 'location' && slide.locationDetails && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Venue / Ballroom Name</label>
                        <input
                          type="text"
                          value={slide.locationDetails?.venueName || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, {
                            locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), venueName: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Full Venue Address</label>
                        <textarea
                          rows={2}
                          value={slide.locationDetails?.address || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, {
                            locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), address: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Google Maps URL</label>
                          <input
                            type="text"
                            value={slide.locationDetails?.gmapsUrl || ''}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateSlide(idx, {
                              locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), gmapsUrl: e.target.value }
                            })}
                            placeholder="http://googleusercontent.com/maps.google.com/4..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Waze Navigation URL</label>
                          <input
                            type="text"
                            value={slide.locationDetails?.wazeUrl || ''}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateSlide(idx, {
                              locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), wazeUrl: e.target.value }
                            })}
                            placeholder="https://waze.com/ul/..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TENTATIVE */}
                  {slide.type === 'tentative' && (
                    <div className="space-y-2.5">
                      <label className="text-[11px] text-slate-400 block">Itinerary / Timeline Table:</label>
                      {(slide.timeline || []).map((tItem, tIdx) => (
                        <div key={tIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={tItem.time}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateTimelineItem(idx, tIdx, 'time', e.target.value)}
                            placeholder="Time"
                            className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 outline-none"
                          />
                          <input
                            type="text"
                            value={tItem.activity}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateTimelineItem(idx, tIdx, 'activity', e.target.value)}
                            placeholder="Activity / Program"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeTimelineItem(idx, tIdx)}
                            className="text-red-400 hover:text-red-300 px-1 text-xs"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTimelineItem(idx)}
                        className="text-xs text-amber-400 font-semibold hover:underline pt-1 flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-plus text-[10px]" /> Add Timeline Row
                      </button>
                    </div>
                  )}

                  {/* IMAGE_QR */}
                  {slide.type === 'image_qr' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">QR Title / Label</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          placeholder="e.g. Gift Registry / Digital Angpow"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Brief Description</label>
                        <input
                          type="text"
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          placeholder="Scan the QR code below for your warm gift."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Upload QR Code Image</label>
                        <div className="flex items-center gap-3">
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt="QR" className="w-12 h-12 rounded-xl object-contain border border-amber-400 bg-white p-1" />
                          )}
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                            Choose QR Image
                            <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GUESTBOOK */}
                  {slide.type === 'guestbook' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Section Title</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Guest Instructions</label>
                        <textarea
                          rows={2}
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* THANK_YOU */}
                  {slide.type === 'thank_you' && (
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Closing Note of Appreciation</label>
                      <textarea
                        rows={2}
                        value={slide.bodyText || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                </div>
              );
            })}

            <button
              type="button"
              onClick={addNewSlide}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus" /> Add New Slide
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MUSIC & SOUND ================= */}
      {activeTab === 'music' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Background Music & Audio Track
          </label>

          {/* 1. DIRECT AUDIO FILE UPLOAD (100% RELIABLE) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-cloud-arrow-up text-emerald-400 text-sm" /> 
                Upload MP3 Audio File from Your Device
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                Guaranteed Audio
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload any song directly from your phone or computer. Plays 100% offline with zero server restrictions.
            </p>
            
            <label className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-400/70 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-inner">
              <i className="fa-solid fa-file-audio text-emerald-400 text-base" /> 
              {audioUploadSuccess ? audioUploadSuccess : 'Choose MP3 File from Device (Max 8MB)'}
              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            </label>
          </div>

          {/* 2. PRESET 50 MUSIC LIBRARY */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Curated 50 Melody Library</span>
                <span className="text-[11px] text-slate-400 block">Instant synthesis playback with zero delay.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap"
              >
                <i className="fa-solid fa-compact-disc fa-spin" /> Open Music Library (50 Tracks)
              </button>
            </div>

            {/* Currently Selected Track Status */}
            {data.cover?.audioUrl && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300">
                <span className="font-semibold flex items-center gap-2 truncate">
                  <i className="fa-solid fa-music text-amber-400" /> Active Audio: {MUSIC_LIBRARY.find(m => m.trackCode === data.cover?.audioUrl)?.name || (data.cover?.audioUrl.startsWith('data:audio') ? 'Custom Uploaded MP3' : 'Custom Track')}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/40">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* 3. MANUAL MP3 URL */}
          <div className="pt-1 space-y-1.5">
            <label className="text-[11px] text-slate-400 block font-medium">Or enter a custom direct MP3 URL:</label>
            <input
              type="text"
              placeholder="https://.../your-track.mp3"
              value={data.cover?.audioUrl && !data.cover?.audioUrl.startsWith('data:audio') && !data.cover?.audioUrl.startsWith('m') ? data.cover.audioUrl : ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, audioUrl: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= SAVE & CHECKOUT ================= */}
      {onSave && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 pt-3">
          {setSlug && slug !== undefined && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Invitation URL Path (Slug)</label>
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs">
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Generating Invitation...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" /> Save & Generate Invitation Links
              </>
            )}
          </button>

          {/* DUAL LINK SECTION */}
          {generatedUrl && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3.5">
              <div className="text-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  🎉 Your Invitation Link is Ready!
                </span>
              </div>

              {/* 1. FREE LINK */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-emerald-400 font-bold">1. Free Link (2 Slides, Clean / No Watermark)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">FREE</span>
                </div>
                <a 
                  href={generatedUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-bold text-slate-200 underline break-all block hover:text-white"
                >
                  {generatedUrl}
                </a>
              </div>

              {/* 2. PREMIUM PREVIEW LINK */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-amber-400 font-bold">2. Premium Preview Link (All Slides, Watermarked)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">PREVIEW</span>
                </div>
                <a 
                  href={`${generatedUrl}?v=premium`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-bold text-amber-300 underline break-all block hover:text-amber-200"
                >
                  {`${generatedUrl}?v=premium`}
                </a>
              </div>

              {/* STRIPE CHECKOUT BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left">
                  <span className="text-xs font-bold text-amber-200 block">Unlock Full Access Without Watermark</span>
                  <span className="text-[10px] text-slate-400 block">One-time instant unlock via Card / FPX.</span>
                </div>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={isCheckingOut}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Opening Stripe...
                    </>
                  ) : (
                    <>
                      <i className="fa-brands fa-stripe text-base" /> Unlock Full Access (RM 15)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL: 50-ITEM WALLPAPER GALLERY */}
      {/* ========================================================================= */}
      {isWallpaperModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-images text-amber-400" /> 
                  Wallpaper Gallery ({wallpaperModalTarget === 'cover' ? 'Cover Page' : 'Inner Slides'})
                </h3>
                <p className="text-xs text-slate-400">Choose from 50 high-resolution portrait textures matching your event style.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWallpaperModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {WALLPAPER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedWallpaperCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedWallpaperCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 flex-1">
              {filteredWallpapers.map((wp) => {
                const isSelected = wallpaperModalTarget === 'cover' 
                  ? data.theme?.coverBgUrl === wp.url
                  : (data.theme?.slideBgUrl === wp.url || data.theme?.bgPatternUrl === wp.url);

                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectWallpaper(wp.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-[9/16] ${
                      isSelected
                        ? 'border-amber-400 ring-4 ring-amber-400/40 scale-[1.02]'
                        : 'border-slate-800 hover:border-amber-400/70 hover:scale-[1.02]'
                    }`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <span className="text-[11px] font-bold text-white line-clamp-1">{wp.name}</span>
                      <span className="text-[9px] text-amber-300/90 font-medium">{wp.category}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                        <i className="fa-solid fa-check" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: 50-TRACK MUSIC LIBRARY WITH INSTANT SYNTH AUDIO PLAYBACK */}
      {/* ========================================================================= */}
      {isMusicModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-compact-disc text-amber-400" /> Event Music Library
                </h3>
                <p className="text-xs text-slate-400">Click the Play / Pause (▶️ / ⏸️) button to toggle live audio.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  globalAudio.stop();
                  setIsMusicModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {MUSIC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedMusicCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedMusicCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {filteredMusic.map((track) => {
                const isSelected = data.cover?.audioUrl === track.trackCode;
                const isCurrentPreview = previewTrackId === track.trackCode && isPlayingAudio;

                return (
                  <div
                    key={track.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Play / Pause Toggle Button */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePreviewMusic(track.trackCode)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-base transition-transform active:scale-90 cursor-pointer ${
                          isCurrentPreview
                            ? 'bg-amber-500 text-slate-950 shadow-lg ring-2 ring-amber-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                        }`}
                        title={isCurrentPreview ? 'Stop Audio' : 'Play Audio'}
                      >
                        {isCurrentPreview ? (
                          <i className="fa-solid fa-pause" />
                        ) : (
                          <i className="fa-solid fa-play ml-0.5 text-sm" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white block">{track.name}</span>
                          {isCurrentPreview && (
                            <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold animate-pulse">
                              <i className="fa-solid fa-volume-high" /> Playing
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-300/80 font-medium">{track.category}</span>
                      </div>
                    </div>

                    {/* Choose Track Button */}
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <i className="fa-solid fa-check" /> Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectTrack(track.trackCode)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          Select Track
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}