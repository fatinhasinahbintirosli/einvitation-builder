import { supabase } from '@/lib/supabaseClient';
import InvitationCard from '@/components/InvitationCard';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { to?: string };
}) {
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!invitation) {
    notFound();
  }

  const guestName = searchParams.to || "Dato' / Datin / Tuan / Puan";

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2">
      <InvitationCard
        data={invitation.card_data}
        isPaid={invitation.is_paid}
        guestName={guestName}
      />
    </main>
  );
}