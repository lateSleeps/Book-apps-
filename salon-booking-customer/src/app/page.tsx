import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-s16 py-s16 md:px-s32 flex items-center justify-between bg-bg/80 backdrop-blur-md">
        <div className="text-t24 font-bold tracking-tight text-accent-dark">
          Rara Beauty
        </div>
        <Link href="/book/rara-beauty">
          <Button size="sm">Book Now</Button>
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-[120px] pb-s48 px-s16 md:px-s32 flex flex-col md:flex-row items-center gap-s32 max-w-7xl mx-auto w-full">
        <div className="flex-1 space-y-s24 text-center md:text-left z-10">
          <h1 className="text-[48px] leading-[1.1] md:text-[72px] font-medium text-label tracking-tight">
            Own your <br className="hidden md:block" />
            <span className="text-accent">beauty journey.</span>
          </h1>
          <p className="text-t18 md:text-t20 text-label2 max-w-md mx-auto md:mx-0">
            Discover a personalized salon experience designed to celebrate your unique style.
          </p>
          <div className="pt-s8">
            <Link href="/book/rara-beauty">
              <Button size="default" className="w-full md:w-auto">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div className="relative aspect-[4/5] md:aspect-square w-full rounded-[40px] overflow-hidden shadow-shell animate-sIn">
            <Image
              src="/images/hero.png"
              alt="Rara Beauty Salon Interior"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* MANIFESTO SECTION */}
      <section className="bg-accent py-[120px] px-s16 md:px-s32 text-center text-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-s32 relative z-10">
          <h2 className="text-t32 md:text-[56px] leading-[1.1] font-medium tracking-tight">
            We believe your beauty routine should be a moment of absolute peace.
          </h2>
          <p className="text-t18 md:text-t24 text-accent-soft opacity-90 max-w-2xl mx-auto">
            Take a step back from the busy world and let us take care of you, in a space that feels like home.
          </p>
          <div className="pt-s16">
             <Link href="/book/rara-beauty">
                <Button className="bg-white text-accent hover:bg-bg w-full md:w-auto">
                  Start Your Journey
                </Button>
             </Link>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] opacity-20 pointer-events-none">
           <Image src="/images/sage.png" alt="Abstract Sage" fill className="object-cover rounded-full mix-blend-screen" />
        </div>
      </section>

      {/* FEATURE 1: PEACH */}
      <section className="bg-c-peach py-s48 md:py-[100px] px-s16 md:px-s32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-s40 md:gap-s48">
          <div className="flex-1 space-y-s20 order-2 md:order-1">
            <h2 className="text-t32 md:text-[48px] font-medium text-label leading-[1.1] tracking-tight">
              Expert care, <br />tailored to you.
            </h2>
            <p className="text-t18 text-label2 max-w-md">
              From the moment you sit in our chair, our stylists are dedicated to understanding your hair and your vision. No rush, just perfect results.
            </p>
          </div>
          <div className="flex-1 w-full order-1 md:order-2">
            <div className="relative aspect-square w-full md:w-[80%] ml-auto rounded-r32 overflow-hidden shadow-button">
              <Image src="/images/peach.png" alt="Expert Care" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2: BLUE */}
      <section className="bg-c-blue py-s48 md:py-[100px] px-s16 md:px-s32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-s40 md:gap-s48">
          <div className="flex-1 w-full">
            <div className="relative aspect-square w-full md:w-[80%] rounded-r32 overflow-hidden shadow-button">
              <Image src="/images/blue.png" alt="Relaxing Spa" fill className="object-cover" />
            </div>
          </div>
          <div className="flex-1 space-y-s20">
            <h2 className="text-t32 md:text-[48px] font-medium text-label leading-[1.1] tracking-tight">
              A deeply <br />relaxing ritual.
            </h2>
            <p className="text-t18 text-label2 max-w-md">
              Melt away the stress with our signature hair washing and scalp massage rituals. Let the cool tones and calm atmosphere reset your mind.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE 3: YELLOW */}
      <section className="bg-c-yellow py-s48 md:py-[100px] px-s16 md:px-s32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-s40 md:gap-s48">
          <div className="flex-1 space-y-s20 order-2 md:order-1">
            <h2 className="text-t32 md:text-[48px] font-medium text-label leading-[1.1] tracking-tight">
              Premium products, <br />pure ingredients.
            </h2>
            <p className="text-t18 text-label2 max-w-md">
              We exclusively use top-tier, nourishing products that keep your hair healthy long after you leave the salon.
            </p>
          </div>
          <div className="flex-1 w-full order-1 md:order-2">
            <div className="relative aspect-square w-full md:w-[80%] ml-auto rounded-r32 overflow-hidden shadow-button">
              <Image src="/images/yellow.png" alt="Premium Products" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CORE PILLARS */}
      <section className="bg-surface py-[100px] px-s16 md:px-s32">
        <div className="max-w-7xl mx-auto text-center space-y-s48">
          <h2 className="text-t32 md:text-[48px] font-medium text-label tracking-tight">Our philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-s24 md:gap-s32">
            <div className="bg-c-peach rounded-[24px] p-s32 text-left space-y-s16 transition-transform hover:-translate-y-2 duration-300">
              <h3 className="text-t24 font-medium text-label">Refresh</h3>
              <p className="text-t16 text-label2">Walk in with the weight of the world, walk out feeling instantly lighter and revitalized.</p>
            </div>
            <div className="bg-c-blue rounded-[24px] p-s32 text-left space-y-s16 transition-transform hover:-translate-y-2 duration-300">
              <h3 className="text-t24 font-medium text-label">Rejuvenate</h3>
              <p className="text-t16 text-label2">Deeply nourish your hair and skin with our meticulously selected treatments.</p>
            </div>
            <div className="bg-c-mint rounded-[24px] p-s32 text-left space-y-s16 transition-transform hover:-translate-y-2 duration-300">
              <h3 className="text-t24 font-medium text-label">Radiate</h3>
              <p className="text-t16 text-label2">Embrace a look that makes your inner confidence shine effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-bg py-s48 px-s16 md:px-s32 border-t border-sep">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-s24">
          <div className="text-t20 font-bold text-accent-dark">Rara Beauty</div>
          <div className="text-t14 text-label3 text-center md:text-left">
            © {new Date().getFullYear()} Rara Beauty. All rights reserved.
          </div>
          <Link href="/book/rara-beauty">
            <Button size="sm" variant="ghost">Book Now</Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
