'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { departments } from '@/data/departments';
import { doctors } from '@/data/doctors';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  // Get first 5 departments for floating specialty tags
  const featuredSpecialties = departments.slice(0, 5);
  
  // Count total doctors (using actual count from data)
  const totalDoctors = doctors.length;
  const doctorsCount = totalDoctors >= 150 ? '150+' : `${totalDoctors}+`;

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Backgroundnew.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
            Find Your Trusted
            <br />
            <span className="text-brand-teal drop-shadow-md">Independent Physician</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-md">
            Connect with highly skilled doctors across multiple specialties.
            Quality care, personalized attention.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
            <Button asChild size="lg" className="bg-brand-teal hover:bg-brand-teal/90 text-white w-full sm:w-auto">
              <Link href="/doctors">
                Browse Doctors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
            >
              <Link href="/#departments">View Medical Specialties</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
            >
              <Link href="/#how-it-works">How It Works</Link>
            </Button>
          </div>

          {/* Stats Section - Left Side */}
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-5 rounded-2xl max-w-fit border border-white/50 shadow-lg">
            <div className="text-4xl font-bold text-brand-dark-blue">190K+</div>
            <div className="flex flex-col text-sm text-gray-700">
              <span>Cured satisfied patients</span>
              <span>around the globe</span>
            </div>
            <div className="flex items-center ml-2">
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop"
                alt="Patient"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-[3px] border-white object-cover"
              />
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop"
                alt="Patient"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-[3px] border-white -ml-2 object-cover"
              />
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop"
                alt="Patient"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-[3px] border-white -ml-2 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Specialty Tags - Right Side */}
      <div className="absolute top-1/2 right-4 md:right-8 lg:right-20 transform -translate-y-1/2 z-20 hidden lg:flex flex-col items-end gap-3">
        {featuredSpecialties.map((dept) => (
          <Link
            key={dept.slug}
            href={`/doctors?specialty=${dept.slug}`}
            className="bg-slate-600/75 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium border border-white/20 transition-all duration-300 hover:bg-brand-teal/90 hover:-translate-x-2 hover:shadow-lg"
          >
            {dept.name}
          </Link>
        ))}
      </div>

      {/* Floating Doctors Card - Bottom Right */}
      <div className="absolute bottom-16 md:bottom-20 right-4 md:right-8 lg:right-20 z-20 hidden lg:flex items-center gap-4 bg-white rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-brand-dark-blue">{doctorsCount}</span>
          <span className="text-sm text-gray-600 font-medium">Doctors</span>
        </div>
        <div className="flex items-center -ml-2">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
            alt="Doctor"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-[3px] border-white object-cover"
          />
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
            alt="Doctor"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-[3px] border-white -ml-2 object-cover"
          />
          <Image
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop"
            alt="Doctor"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-[3px] border-white -ml-2 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
