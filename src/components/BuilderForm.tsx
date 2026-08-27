'use client';

import React, { useState, useRef } from 'react';
import { CardData, SlideType } from '@/types/invitation';

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

// ================= KOLEKSI 50 KERTAS DINDING MENGIKUT KATEGORI =================
interface WallpaperItem {
  id: string;
  name: string;
  category: string;
  url: string;
}

const WALLPAPER_LIBRARY: WallpaperItem[] = [
  // 1. Songket & Warisan Tradisional (8)
  { id: 'w1', name: 'Songket Tenun Emas', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w2', name: 'Songket Hitam Diraja', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w3', name: 'Tekstur Sutera Merah', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w4', name: 'Batik Tembaga Mewah', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1606768666853-403c90a981ad?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w5', name: 'Songket Hijau Lumut', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w6', name: 'Benang Emas Klasik', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w7', name: 'Sutera Biru Diraja', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w8', name: 'Tenunan Krim Perak', category: 'Songket Warisan', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1080&auto=format&fit=crop' },

  // 2. Floral & Bunga Elegan (9)
  { id: 'w9', name: 'Bunga Mawar Gelap', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w10', name: 'Bunga Putih Berseri', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w11', name: 'Orkid Ungu Lembut', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w12', name: 'Bunga Liar Estetik', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w13', name: 'Kelopak Mawar Krim', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w14', name: 'Botanikal Daun Emas', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w15', name: 'Bunga Sakura Romantik', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w16', name: 'Hydrangea Biru Pastel', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w17', name: 'Bouquet Vintage Indah', category: 'Floral & Bunga', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1080&auto=format&fit=crop' },

  // 3. Emas & Kemewahan Diraja (Royal Gold) (8)
  { id: 'w18', name: 'Debu Emas Gemilang', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w19', name: 'Marmar Hitam & Emas', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w20', name: 'Kilauan Manik Kristal', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w21', name: 'Gelombang Sutera Emas', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w22', name: 'Cahaya Bokeh Mewah', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w23', name: 'Latar Kristal Berlian', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w24', name: 'Gangsa Diraja Bersinar', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w25', name: 'Abstrak Gelembung Emas', category: 'Mewah & Gold', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1080&auto=format&fit=crop' },

  // 4. Pastel, Krim & Minimalis (9)
  { id: 'w26', name: 'Tekstur Kertas Mewah', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w27', name: 'Marmar Putih Tulen', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w28', name: 'Awan Merah Jambu Lembut', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w29', name: 'Dinding Simen Estetik', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w30', name: 'Gradien Lavender Sejuk', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w31', name: 'Tekstur Linen Natural', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w32', name: 'Kabus Pagi Damai', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w33', name: 'Sutera Peach Lembut', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w34', name: 'Kanvas Minimalis', category: 'Pastel & Minimalis', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop' },

  // 5. Alam Semula Jadi & Rustic (8)
  { id: 'w35', name: 'Daun Hutan Zamrud', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w36', name: 'Pepohon Rimbun Hening', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w37', name: 'Daun Palma Hijau Segar', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w38', name: 'Taman Bunga Menghijau', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w39', name: 'Kayu Rustic Vintage', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w40', name: 'Pantai & Ombak Syahdu', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w41', name: 'Daun Eucalyptus Estetik', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w42', name: 'Pemandangan Bukit Tenang', category: 'Alam & Rustic', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1080&auto=format&fit=crop' },

  // 6. Geometrik & Seni Islamik (8)
  { id: 'w43', name: 'Corak Arabesque Emas', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w44', name: 'Mozek Jubin Istana', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w45', name: 'Kubah Masjid Bercahaya', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w46', name: 'Gerbang Maghribi Antik', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w47', name: 'Seni Khat Kaligrafi Indah', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w48', name: 'Lampu Tanglung Maghribi', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w49', name: 'Corak Bintang Mandala', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1080&auto=format&fit=crop' },
  { id: 'w50', name: 'Ukir Kayu Tradisi Melayu', category: 'Geometrik Islamik', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop' },
];

const WALLPAPER_CATEGORIES = [
  'Semua',
  'Songket Warisan',
  'Floral & Bunga',
  'Mewah & Gold',
  'Pastel & Minimalis',
  'Alam & Rustic',
  'Geometrik Islamik'
];

// ================= KOLEKSI 50 LAGU MENGIKUT KATEGORI =================
interface MusicItem {
  id: string;
  name: string;
  category: string;
  url: string;
}

const MUSIC_LIBRARY: MusicItem[] = [
  // 1. Melodi Romantik & Kahwin (8)
  { id: 'm1', name: 'Piano Lembut Mahligai Cinta', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-piano-112349.mp3' },
  { id: 'm2', name: 'Gitar Kasih Bersatu', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-acoustic-guitar-15286.mp3' },
  { id: 'm3', name: 'Janji Suci Abadi (Violin & Piano)', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d98d414a.mp3?filename=piano-moment-125010.mp3' },
  { id: 'm4', name: 'Ikatan Dua Hati (Acoustic)', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c0780283.mp3?filename=wedding-piano-10777.mp3' },
  { id: 'm5', name: 'Sumpah Setia Bersamamu', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_9467657982.mp3?filename=love-story-piano-6304.mp3' },
  { id: 'm6', name: 'Mekar Jiwa Asmara', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=gentle-piano-love-117562.mp3' },
  { id: 'm7', name: 'Langkah Pengantin Bahagia', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_29db0efc4b.mp3?filename=wedding-cinematic-124119.mp3' },
  { id: 'm8', name: 'Bidadari Syurga (Instrumental)', category: 'Romantik & Kahwin', url: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_550e50d601.mp3?filename=sweet-romance-140683.mp3' },

  // 2. Tradisional & Gamelan Melayu (8)
  { id: 'm9', name: 'Alunan Gamelan Seri Melayu', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=peaceful-garden-healing-light-ambient-music-7789.mp3' },
  { id: 'm10', name: 'Serunai Kasih Warisan', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3c3a4f655.mp3?filename=asian-traditional-instrumental-20894.mp3' },
  { id: 'm11', name: 'Paluan Kompang & Rebana', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=meditation-ethnic-oriental-flute-18544.mp3' },
  { id: 'm12', name: 'Gambus Istana Raja', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db519e9959.mp3?filename=oriental-traditional-oud-111162.mp3' },
  { id: 'm13', name: 'Zapin Menggamit Rindu', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2023/04/18/audio_2069c9b688.mp3?filename=oriental-journey-147313.mp3' },
  { id: 'm14', name: 'Asli Senandung Malam', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_65cfc5c742.mp3?filename=oriental-strings-instrumental-15287.mp3' },
  { id: 'm15', name: 'Gendang Berarak Majlis', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2023/05/23/audio_731e847be2.mp3?filename=oriental-middle-east-drums-150774.mp3' },
  { id: 'm16', name: 'Seni Silat & Rebana Warisan', category: 'Tradisional & Melayu', url: 'https://cdn.pixabay.com/download/audio/2022/10/18/audio_31362e49c7.mp3?filename=ethnic-percussion-rhythm-123498.mp3' },

  // 3. Akustik & Santai Hening (8)
  { id: 'm17', name: 'Petikan Akustik Damai', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2022/11/18/audio_ec3505c879.mp3?filename=calm-acoustic-guitar-126830.mp3' },
  { id: 'm18', name: 'Sinar Pagi Penuh Harapan', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2022/01/12/audio_47f52504b8.mp3?filename=warm-acoustic-feeling-14980.mp3' },
  { id: 'm19', name: 'Cahaya Senja Lembayung', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2023/03/24/audio_331bfa2b3a.mp3?filename=acoustic-breeze-143890.mp3' },
  { id: 'm20', name: 'Taman Ketenangan Jiwa', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_6702e5b7c2.mp3?filename=peaceful-relaxing-guitar-110034.mp3' },
  { id: 'm21', name: 'Suasana Hati Ceria', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2022/09/27/audio_3a65660893.mp3?filename=acoustic-folk-guitar-121650.mp3' },
  { id: 'm22', name: 'Melodi Kasih Sayang', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2023/01/10/audio_51d283624e.mp3?filename=sweet-home-acoustic-134015.mp3' },
  { id: 'm23', name: 'Kenangan Manis Bersamamu', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2022/06/15/audio_e08d66f687.mp3?filename=relaxing-fingerstyle-guitar-113589.mp3' },
  { id: 'm24', name: 'Angin Sejuk Pegunungan', category: 'Akustik & Santai', url: 'https://cdn.pixabay.com/download/audio/2023/06/14/audio_03d98d414a.mp3?filename=acoustic-sunset-154812.mp3' },

  // 4. Alunan Islamik, Doa & Syahdu (8)
  { id: 'm25', name: 'Doa Selamat & Keberkatan', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_f5539d9147.mp3?filename=islamic-spiritual-ambient-10769.mp3' },
  { id: 'm26', name: 'Syahdu Alunan Ramadan & Syawal', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2022/04/12/audio_145d55b376.mp3?filename=spiritual-arabic-oud-109012.mp3' },
  { id: 'm27', name: 'Zikir Hati Menenangkan', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_82c5f11075.mp3?filename=islamic-healing-ambient-8409.mp3' },
  { id: 'm28', name: 'Nasyid Kedamaian Jiwa', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2022/08/18/audio_24b423ca98.mp3?filename=arabic-spiritual-peace-118834.mp3' },
  { id: 'm29', name: 'Merafakkan Syukur Illahi', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2023/01/25/audio_65cfc5c742.mp3?filename=peaceful-islamic-melody-136420.mp3' },
  { id: 'm30', name: 'Cahaya Iman & Taqwa', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2022/12/10/audio_550e50d601.mp3?filename=spiritual-reflection-129482.mp3' },
  { id: 'm31', name: 'Senandung Kasih Sayang Allah', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2023/04/05/audio_884fe92c21.mp3?filename=ambient-spiritual-flute-145612.mp3' },
  { id: 'm32', name: 'Alunan Menjelang Fajar', category: 'Islamik & Doa', url: 'https://cdn.pixabay.com/download/audio/2022/05/01/audio_1808fbf07a.mp3?filename=dawn-serenity-110294.mp3' },

  // 5. Ceria, Mesra Aqiqah & Hari Jadi (8)
  { id: 'm33', name: 'Kotak Muzik Bayi (Lullaby)', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_9032cb4103.mp3?filename=baby-lullaby-music-box-10512.mp3' },
  { id: 'm34', name: 'Keriangan Si Kecil Manja', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_9ef8a104f2.mp3?filename=happy-kids-ukulele-15290.mp3' },
  { id: 'm35', name: 'Senyuman Puteri & Putera', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_331bfa2b3a.mp3?filename=playful-acoustic-kids-123180.mp3' },
  { id: 'm36', name: 'Hari Bahagia Bersama Keluarga', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2023/02/10/audio_51d283624e.mp3?filename=joyful-ukulele-celebration-138290.mp3' },
  { id: 'm37', name: 'Sentuhan Kasih Ibu & Ayah', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2022/07/20/audio_ec3505c879.mp3?filename=tender-music-box-116230.mp3' },
  { id: 'm38', name: 'Koleksi Mainan & Tawaria', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2023/05/05/audio_29db0efc4b.mp3?filename=whimsical-baby-tune-149020.mp3' },
  { id: 'm39', name: 'Sambutan Penuh Gelak Tawa', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2022/11/02/audio_145d55b376.mp3?filename=cheerful-celebration-124990.mp3' },
  { id: 'm40', name: 'Mimpi Indah Puteri Manis', category: 'Ceria & Aqiqah', url: 'https://cdn.pixabay.com/download/audio/2023/03/12/audio_65cfc5c742.mp3?filename=sweet-dreams-glockenspiel-142100.mp3' },

  // 6. Orkestra & Piano Megah (8)
  { id: 'm41', name: 'Simfoni Diraja Megah', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d0a13f69d2.mp3?filename=cinematic-wedding-orchestra-19200.mp3' },
  { id: 'm42', name: 'Alunan Biola & Piano Klasik', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2022/06/08/audio_c8c0780283.mp3?filename=majestic-grand-piano-113010.mp3' },
  { id: 'm43', name: 'Perarakan Mahligai Impian', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2022/09/15/audio_9467657982.mp3?filename=royal-entrance-strings-120980.mp3' },
  { id: 'm44', name: 'Detik Terindah Seumur Hidup', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2023/01/18/audio_24b423ca98.mp3?filename=epic-romantic-strings-135120.mp3' },
  { id: 'm45', name: 'Kilauan Bintang Diraja', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2022/12/28/audio_db519e9959.mp3?filename=grand-orchestral-waltz-131090.mp3' },
  { id: 'm46', name: 'Pentas Kegemilangan', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2023/04/22/audio_31362e49c7.mp3?filename=ceremonial-majesty-147890.mp3' },
  { id: 'm47', name: 'Irama Cinta Abadi (Cello Solo)', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2022/04/18/audio_884fe92c21.mp3?filename=warm-cello-and-piano-109480.mp3' },
  { id: 'm48', name: 'Harmoni Kasih Menawan', category: 'Orkestra Megah', url: 'https://cdn.pixabay.com/download/audio/2023/06/01/audio_550e50d601.mp3?filename=elegant-ballroom-strings-153210.mp3' },
];

const MUSIC_CATEGORIES = [
  'Semua',
  'Romantik & Kahwin',
  'Tradisional & Melayu',
  'Akustik & Santai',
  'Islamik & Doa',
  'Ceria & Aqiqah',
  'Orkestra Megah'
];

const COLOR_PRESETS = [
  { name: 'Hijau Zamrud', hex: '#2d4a3e' },
  { name: 'Biru Gelap Diraja', hex: '#172554' },
  { name: 'Maroon Baldu', hex: '#451a24' },
  { name: 'Coklat Tanah Klasik', hex: '#3e2723' },
  { name: 'Champagne Emas', hex: '#63513d' },
  { name: 'Hitam Mewah', hex: '#18181b' },
  { name: 'Dusty Rose Pastel', hex: '#5c3a4d' },
  { name: 'Teal Vintage', hex: '#134e4a' },
];

const OPACITY_PRESETS = [
  { label: '100% Solid', value: 100 },
  { label: '90% Jelas', value: 90 },
  { label: '75% Kaca', value: 75 },
  { label: '55% Lutsinar', value: 55 },
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
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // State Modal Pop-up
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [wallpaperModalTarget, setWallpaperModalTarget] = useState<'cover' | 'slide'>('cover');
  const [selectedWallpaperCategory, setSelectedWallpaperCategory] = useState('Semua');

  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('Semua');
  const [previewTrackUrl, setPreviewTrackUrl] = useState<string | null>(null);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

  const bgType = data.theme?.coverBgType || 'color';
  const currentOpacity = typeof data.theme?.cardOpacity === 'number' ? data.theme.cardOpacity : 92;

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

  // Pengendali Audio Preview dalam Modal Lagu
  const handleTogglePreviewMusic = (url: string) => {
    if (previewTrackUrl === url) {
      if (modalAudioRef.current) {
        modalAudioRef.current.pause();
      }
      setPreviewTrackUrl(null);
    } else {
      setPreviewTrackUrl(url);
      if (modalAudioRef.current) {
        modalAudioRef.current.src = url;
        modalAudioRef.current.play().catch(() => {});
      }
    }
  };

  // Pilih Lagu & Tutup Modal
  const handleSelectTrack = (url: string) => {
    if (modalAudioRef.current) {
      modalAudioRef.current.pause();
    }
    setPreviewTrackUrl(null);
    updateData({ ...data, cover: { ...data.cover, audioUrl: url } });
    setIsMusicModalOpen(false);
  };

  // Buka Modal Galeri Wallpaper
  const openWallpaperModal = (target: 'cover' | 'slide') => {
    setWallpaperModalTarget(target);
    setIsWallpaperModalOpen(true);
  };

  // Pilih Wallpaper dari Modal
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

  // Muat Naik Wallpaper Muka Depan
  const handleCoverWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Saiz fail melebihi 3MB. Sila pilih fail lebih kecil.');
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

  // Muat Naik Wallpaper Helaian (Slide)
  const handleSlideWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Saiz fail melebihi 3MB. Sila pilih fail lebih kecil.');
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

  // Muat Naik Gambar Bulat / QR Helaian
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
      title: 'LOKASI MAJLIS',
      locationDetails: {
        venueName: 'Dewan Gemilang Perdana',
        address: 'No. 123, Jalan Raja Chulan, Kuala Lumpur',
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
      alert('Kad perlu mempunyai sekurang-kurangnya 1 helaian.');
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
      updated.title = 'LOKASI MAJLIS';
      updated.locationDetails = {
        venueName: 'Nama Dewan / Tempat',
        address: 'Alamat Penuh Majlis',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      };
    } else if (newType === 'tentative' && !currentSlide.timeline) {
      updated.title = 'SUSUNAN MAJLIS';
      updated.timeline = [
        { time: '11:00 AM', activity: 'Ketibaan Tetamu' },
        { time: '12:00 PM', activity: 'Jamuan Makan' },
        { time: '04:00 PM', activity: 'Majlis Bersurai' }
      ];
    } else if (newType === 'image_qr') {
      updated.title = 'KOD QR / HADIAH';
      updated.subtitle = 'DuitNow / Salam Kausar';
      updated.bodyText = 'Imbas kod QR di bawah untuk ingatan tulus ikhlas anda.';
    } else if (newType === 'guestbook') {
      updated.title = 'BUKU UCAPAN';
      updated.subtitle = 'Titipan Doa & Ucapan';
      updated.bodyText = 'Semoga kehadiran anda membawa seribu keberkatan buat kami.';
    } else if (newType === 'thank_you') {
      updated.title = 'PENGHARGAAN';
      updated.bodyText = 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda sekeluarga.';
    }

    updateSlide(index, updated);
  };

  const addTimelineItem = (slideIndex: number) => {
    const slide = data.slides[slideIndex];
    const currentTimeline = slide.timeline || [];
    const newTimeline = [...currentTimeline, { time: '12:00 PM', activity: 'Aktiviti Baru' }];
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
        alert('Ralat memulakan pembayaran: ' + (resData.error || 'Sila cuba lagi.'));
      }
    } catch (err: any) {
      alert('Ralat rangkaian: ' + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Filter List Wallpaper & Lagu
  const filteredWallpapers = selectedWallpaperCategory === 'Semua' 
    ? WALLPAPER_LIBRARY 
    : WALLPAPER_LIBRARY.filter(w => w.category === selectedWallpaperCategory);

  const filteredMusic = selectedMusicCategory === 'Semua'
    ? MUSIC_LIBRARY
    : MUSIC_LIBRARY.filter(m => m.category === selectedMusicCategory);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl space-y-5">
      
      {/* Hidden Audio Engine untuk Modal Preview */}
      <audio ref={modalAudioRef} onEnded={() => setPreviewTrackUrl(null)} />

      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Pereka Kad Jemputan Digital</h2>
        <p className="text-xs text-slate-400 mt-1">Ubah suai muka depan, latar helaian, ketelusan kad, dan lagu majlis.</p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabChange('cover')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'cover' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Muka Depan
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('slides')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Helaian & Latar ({data.slides?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('music')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'music' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Lagu & Audio Latar
        </button>
      </div>

      {/* ================= TAB 1: MUKA DEPAN SAHAJA ================= */}
      {activeTab === 'cover' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          
          {/* Pilihan Latar Belakang Muka Depan */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Latar Belakang Muka Depan (Cover Sahaja)
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
                  <i className="fa-solid fa-palette mr-1" /> Warna Solid
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
                  <i className="fa-solid fa-image mr-1" /> Gambar / Wallpaper
                </button>
              </div>
            </div>

            {/* Warna Solid Muka Depan */}
            {bgType === 'color' && (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] text-slate-400 block font-medium">Pilih warna tema muka depan:</span>
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
                  <label className="text-[11px] text-slate-400">Atau kod warna sendiri (Hex):</label>
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

            {/* Gambar Muka Depan */}
            {bgType === 'image' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Butang Buka Modal Galeri */}
                  <button
                    type="button"
                    onClick={() => openWallpaperModal('cover')}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-images text-base" /> Pilih dari Galeri Kertas Dinding (50 Koleksi)
                  </button>

                  {/* Muat Naik Sendiri */}
                  <label className="py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Muat Naik Sendiri
                    <input type="file" accept="image/*" onChange={handleCoverWallpaperUpload} className="hidden" />
                  </label>
                </div>
                {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              </div>
            )}
          </div>
          
          {/* Maklumat Teks Muka Depan */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tagline / Panggilan Atas</label>
            <input
              type="text"
              value={data.cover?.tagline || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tajuk / Nama Utama Majlis</label>
            <input
              type="text"
              value={data.cover?.mainTitle || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tarikh Ringkas</label>
            <input
              type="text"
              value={data.cover?.dateText || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: HELAIAN KAD & LATAR HELAIAN ================= */}
      {activeTab === 'slides' && (
        <div className="space-y-4">
          
          {/* KAWALAN KHAS: LATAR BELAKANG HELAIAN DALAMAN & KETELUSAN KAD */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-layer-group" /> Kertas Dinding Latar Helaian (Inner Wallpaper)
              </label>
            </div>

            {/* Butang Galeri Wallpaper untuk Helaian */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => openWallpaperModal('slide')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-images" /> Tukar Kertas Dinding Helaian (50 Koleksi)
              </button>

              <label className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Muat Naik Sendiri
                <input type="file" accept="image/*" onChange={handleSlideWallpaperUpload} className="hidden" />
              </label>
            </div>

            {/* Pelaras Ketelusan Kotak Kad Putih (Card Transparency) */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">Ketelusan Kotak Kad Putih (Transparency):</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentOpacity}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-medium">Lutsinar</span>
                <input
                  type="range"
                  min="20"
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
                <span className="text-[10px] text-slate-400 font-medium">Solid</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Senarai Helaian Kad */}
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
                        <option value="intro">✨ Pengenalan & Ucapan</option>
                        <option value="location">📍 Lokasi & Peta (Maps / Waze)</option>
                        <option value="tentative">📅 Susunan Majlis (Tentatif)</option>
                        <option value="image_qr">📷 Kod QR / DuitNow / Galeri</option>
                        <option value="guestbook">📖 Buku Ucapan & Doa</option>
                        <option value="thank_you">🙏 Ucapan Penghargaan & Penutup</option>
                      </select>

                      {isCurrentlyActive && (
                        <span className="text-[9px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Live di Preview
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.title || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { title: e.target.value })}
                        placeholder="Tajuk Atas"
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right text-slate-300 outline-none w-32"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(idx);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 text-xs"
                        title="Padam Helaian Ini"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>

                  {/* INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Jemputan</label>
                        <textarea
                          rows={2}
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Nama Penuh Yang Diraikan</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
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
                            Pilih Gambar Foto
                            <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOCATION */}
                  {slide.type === 'location' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Nama Tempat / Dewan</label>
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
                        <label className="text-[11px] text-slate-400 block mb-1">Alamat Penuh Majlis</label>
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
                          <label className="text-[10px] text-slate-400 block mb-0.5">Pautan Google Maps</label>
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
                          <label className="text-[10px] text-slate-400 block mb-0.5">Pautan Waze</label>
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
                      <label className="text-[11px] text-slate-400 block">Jadual Atur Cara Majlis:</label>
                      {(slide.timeline || []).map((tItem, tIdx) => (
                        <div key={tIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={tItem.time}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateTimelineItem(idx, tIdx, 'time', e.target.value)}
                            placeholder="Masa"
                            className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 outline-none"
                          />
                          <input
                            type="text"
                            value={tItem.activity}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateTimelineItem(idx, tIdx, 'activity', e.target.value)}
                            placeholder="Aktiviti"
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
                        <i className="fa-solid fa-plus text-[10px]" /> Tambah Baris Masa
                      </button>
                    </div>
                  )}

                  {/* IMAGE_QR */}
                  {slide.type === 'image_qr' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Tajuk QR / Imej</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          placeholder="Contoh: Kod QR DuitNow / Hadiah"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Penerangan Ringkas</label>
                        <input
                          type="text"
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          placeholder="Imbas kod QR di bawah untuk ingatan tulus ikhlas anda."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Muat Naik Kod QR / Gambar</label>
                        <div className="flex items-center gap-3">
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt="QR" className="w-12 h-12 rounded-xl object-contain border border-amber-400 bg-white p-1" />
                          )}
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                            Pilih Gambar QR
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
                        <label className="text-[11px] text-slate-400 block mb-1">Tajuk Ruangan</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Penerangan / Arahan Tetamu</label>
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
                      <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Penghargaan</label>
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
              <i className="fa-solid fa-plus" /> Tambah Helaian Baharu
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LAGU & MUZIK LATAR ================= */}
      {activeTab === 'music' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Pilihan Lagu & Audio Latar Majlis
          </label>

          {/* Butang Buka Modal Perpustakaan 50 Lagu */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Koleksi 50 Lagu Pilihan Rasmi</span>
                <span className="text-[11px] text-slate-400 block">Dengar sampel sebelum memilih lagu untuk majlis anda.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap"
              >
                <i className="fa-solid fa-compact-disc fa-spin" /> Buka Perpustakaan Muzik (50 Lagu)
              </button>
            </div>

            {/* Status Lagu Semasa Dipilih */}
            {data.cover?.audioUrl && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300">
                <span className="font-semibold flex items-center gap-2 truncate">
                  <i className="fa-solid fa-music text-amber-400" /> Lagu Terpilih: {MUSIC_LIBRARY.find(m => m.url === data.cover?.audioUrl)?.name || 'Pautan Tersendiri'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/40">
                  Aktif
                </span>
              </div>
            )}
          </div>

          {/* Input Manual URL Audio */}
          <div className="pt-1 space-y-1.5">
            <label className="text-[11px] text-slate-400 block font-medium">Atau masukkan pautan URL MP3 anda sendiri:</label>
            <input
              type="text"
              placeholder="https://.../lagu-pilihan.mp3"
              value={data.cover?.audioUrl || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, audioUrl: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= BAHAGIAN SIMPAN & CHECKOUT ================= */}
      {onSave && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 pt-3">
          {setSlug && slug !== undefined && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Pautan URL Kad (Slug)</label>
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
                <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" /> Sahkan & Jana Pautan Kad
              </>
            )}
          </button>

          {/* DUAL LINK SECTION */}
          {generatedUrl && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3.5">
              <div className="text-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  🎉 Pautan Kad Anda Berjaya Dijana!
                </span>
              </div>

              {/* 1. LINK PERCUMA */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-emerald-400 font-bold">1. Pautan Percuma (2 Helaian, Tanpa Watermark)</span>
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

              {/* 2. LINK PREMIUM PREVIEW */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-amber-400 font-bold">2. Pautan Premium Preview (Semua Helaian, Ada Watermark)</span>
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

              {/* BUTANG CHECKOUT STRIPE */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left">
                  <span className="text-xs font-bold text-amber-200 block">Buka Kunci Rasmi Tanpa Watermark</span>
                  <span className="text-[10px] text-slate-400 block">Bayaran sekali sahaja via kad / FPX melalui Stripe.</span>
                </div>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={isCheckingOut}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Membuka Stripe...
                    </>
                  ) : (
                    <>
                      <i className="fa-brands fa-stripe text-base" /> Buka Kunci (RM 15)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL POP-UP GALERI 50 KERTAS DINDING (WALLPAPER LIBRARY MODAL) */}
      {/* ========================================================================= */}
      {isWallpaperModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-images text-amber-400" /> 
                  Galeri Kertas Dinding ({wallpaperModalTarget === 'cover' ? 'Muka Depan' : 'Latar Helaian'})
                </h3>
                <p className="text-xs text-slate-400">Pilih daripada 50 corak eksklusif mengikut tema majlis anda.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWallpaperModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Kategori Tabs */}
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {WALLPAPER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedWallpaperCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedWallpaperCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid 50 Wallpaper */}
            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 flex-1">
              {filteredWallpapers.map((wp) => {
                const isSelected = wallpaperModalTarget === 'cover' 
                  ? data.theme?.coverBgUrl === wp.url
                  : data.theme?.slideBgUrl === wp.url;

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
      {/* 2. MODAL POP-UP PERPUSTAKAAN 50 LAGU (MUSIC LIBRARY MODAL) */}
      {/* ========================================================================= */}
      {isMusicModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-compact-disc text-amber-400" /> Perpustakaan Muzik & Audio Majlis
                </h3>
                <p className="text-xs text-slate-400">Pilih daripada 50 lagu instrumen dan melodi syahdu. Tekan butang Main untuk dengar sampel.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (modalAudioRef.current) modalAudioRef.current.pause();
                  setPreviewTrackUrl(null);
                  setIsMusicModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Kategori Tabs */}
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {MUSIC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedMusicCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedMusicCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Senarai 50 Lagu */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
              {filteredMusic.map((track) => {
                const isSelected = data.cover?.audioUrl === track.url;
                const isPreviewing = previewTrackUrl === track.url;

                return (
                  <div
                    key={track.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Butang Main / Pause Preview */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePreviewMusic(track.url)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-transform active:scale-90 ${
                          isPreviewing
                            ? 'bg-amber-500 text-slate-950 shadow-lg animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                        }`}
                        title={isPreviewing ? 'Henti Audio' : 'Dengar Sampel'}
                      >
                        <i className={`fa-solid ${isPreviewing ? 'fa-pause' : 'fa-play ml-0.5'}`} />
                      </button>

                      <div>
                        <span className="text-xs font-bold text-white block">{track.name}</span>
                        <span className="text-[10px] text-amber-300/80">{track.category}</span>
                      </div>
                    </div>

                    {/* Butang Pilih Lagu */}
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <i className="fa-solid fa-check" /> Sedang Digunakan
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectTrack(track.url)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-transform active:scale-95"
                        >
                          Pilih Lagu
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