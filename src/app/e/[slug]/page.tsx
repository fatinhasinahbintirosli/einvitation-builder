import { supabase } from '@/lib/supabaseClient';
import InvitationCard from '@/components/InvitationCard';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';

export const revalidate = 0;

interface Props {
  params: { slug: string };
  searchParams?: { to?: string; v?: string; session_id?: string; payment?: string };
}

export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const { slug } = params;
  const isPremiumParam = searchParams?.v === 'premium';
  const sessionId = searchParams?.session_id;
  const guestName = searchParams?.to ? decodeURIComponent(searchParams.to) : "Honored Guest / Family & Friends";

  // Fetch card data from Supabase
  let { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !invitation) {
    notFound();
  }

  // Instant Verification on Stripe return
  if (sessionId && !invitation.is_paid && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20' as any,
      });
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid' && session.metadata?.slug === slug) {
        await supabase
          .from('invitations')
          .update({ is_paid: true })
          .eq('slug', slug);

        invitation.is_paid = true;
      }
    } catch (err) {
      console.error('Stripe verification note:', err);
    }
  }

  const isActuallyPaid = invitation.is_paid === true;
  const showWatermark = isActuallyPaid ? false : isPremiumParam;
  const maxSlides = isActuallyPaid || isPremiumParam ? undefined : 2;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4">
      {searchParams?.payment === 'success' && (
        <div className="fixed top-4 z-50 px-4 py-2 bg-emerald-500 text-slate-950 rounded-full font-bold text-xs shadow-xl animate-bounce">
          🎉 Payment Successful! Full Premium Access Unlocked.
        </div>
      )}

      <InvitationCard
        data={invitation.card_data}
        showWatermark={showWatermark}
        maxSlides={maxSlides}
        guestName={guestName}
      />
    </main>
  );
}