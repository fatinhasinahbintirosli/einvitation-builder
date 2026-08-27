import { supabase } from '@/lib/supabaseClient';
import InvitationCard from '@/components/InvitationCard';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface Props {
  params: { slug: string };
  searchParams?: { to?: string; v?: string };
}

export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const { slug } = params;
  const isPremiumParam = searchParams?.v === 'premium';
  const guestName = searchParams?.to ? decodeURIComponent(searchParams.to) : "Dato' / Datin / Tuan / Puan";

  // Ambil data kad dari Supabase berdasarkan slug
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !invitation) {
    notFound();
  }

  const isActuallyPaid = invitation.is_paid === true;

  // 1. Status Watermark: Hanya aktif jika belum bayar dan pengguna buka link preview (?v=premium)
  const showWatermark = isActuallyPaid ? false : isPremiumParam;

  // 2. Had Helaian: Hadkan kepada 2 helaian jika versi percuma biasa (tanpa ?v=premium dan belum bayar)
  const maxSlides = isActuallyPaid || isPremiumParam ? undefined : 2;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4">
      <InvitationCard
        data={invitation.card_data}
        showWatermark={showWatermark}
        maxSlides={maxSlides}
        guestName={guestName}
      />
    </main>
  );
}