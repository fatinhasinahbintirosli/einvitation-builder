import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug kad diperlukan.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Cipta sesi pembayaran selamat Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: `Pakej Premium Kad Digital (${slug})`,
              description: 'Buka kunci semua helaian penuh & buang watermark rasmi.',
            },
            unit_amount: 1500, // RM 15.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        slug: slug,
      },
      // Hantar session_id ke URL kejayaan untuk pengesahan automatik
      success_url: `${origin}/e/${slug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/e/${slug}?v=premium&payment=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}