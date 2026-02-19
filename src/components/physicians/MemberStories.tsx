'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { memberStories } from '@/data/physiciansPage';
import { Quote } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export function MemberStories() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-12 md:py-24 relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Left Column: Image Collage */}
          <div className="relative w-full h-[350px] md:h-[550px] lg:h-[650px] flex items-center justify-center">
            {/* Background Decorative Accent Shape */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 md:w-56 h-48 md:h-56 bg-brand-teal/5 rounded-[4rem] -z-10 blur-2xl" />

            {/* Main Center Image (Doctor) */}
            <div className="relative w-[70%] h-[80%] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl z-20 border-[8px] md:border-[12px] border-white translate-x-8 md:translate-x-14 translate-y-[-10px] md:translate-y-[-15px]">
              <Image
                src="/Dr.png"
                alt="Our leading physician"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 40vw"
              />
            </div>

            {/* Top-Left Image */}
            <div className="absolute top-[8%] left-[5%] md:left-[2%] w-[45%] h-[40%] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl z-30 border-[6px] md:border-[8px] border-white translate-x-[-10px] md:translate-x-[-15px] translate-y-[-5px] md:translate-y-[-10px]">
              <Image
                src="/for_dr.png"
                alt="Clinical Excellence"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>

            {/* Bottom-Left Image (Team) */}
            <div className="absolute bottom-[10%] left-[12%] md:left-[8%] w-[35%] h-[35%] md:w-[40%] md:h-[40%] rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl z-40 border-[4px] md:border-[6px] border-white">
              <Image
                src="/for_dr2.png"
                alt="Our clinical team"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 20vw"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-[5%] left-[48%] w-10 md:w-14 h-10 md:h-14 rounded-full border-[2px] md:border-[3px] border-brand-teal/30 flex items-center justify-center animate-pulse">
              <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-brand-teal" />
            </div>
          </div>

          {/* Right Column: Content & Carousel */}
          <div className="relative text-center lg:text-left">
            {/* Large Decorative Faded Quotes */}
            <div className="absolute -top-10 lg:-top-24 right-0 lg:right-0 text-[120px] md:text-[220px] font-serif text-gray-100 leading-none select-none -z-10 opacity-70 pointer-events-none">
              "
            </div>

            {/* Section Subtitle */}
            <span className="text-brand-teal font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase mb-6 md:mb-12 block px-4 lg:px-0">
              Hear The Inspiring Stories Of Our Patients
            </span>

            {/* Stories Carousel */}
            <div className="relative bg-transparent mt-6 md:mt-12">
              {mounted && (
                <Swiper
                  modules={[Pagination, Autoplay, EffectFade]}
                  spaceBetween={30}
                  effect="fade"
                  fadeEffect={{ crossFade: true }}
                  loop={true}
                  autoplay={{
                    delay: 8000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    el: '.custom-stories-pagination',
                  }}
                  className="overflow-visible"
                >
                  {memberStories.map((story) => (
                    <SwiperSlide key={story.id}>
                      <div className="flex flex-col gap-6 md:gap-12 px-4 lg:px-0">

                        {/* 1. Main Text - Heading style */}
                        <div className="relative z-10 px-2">
                          <h3 className="text-lg md:text-2xl lg:text-3xl text-slate-600 font-medium italic leading-relaxed">
                            "{story.quote}"
                          </h3>
                        </div>

                        {/* 2. Author Block */}
                        <div className="flex flex-col items-center lg:flex-row lg:items-center gap-4 md:gap-6 mt-2">
                          {/* Avatar rounded square with initials */}
                          <div className="relative w-16 h-16 md:w-28 md:h-28 flex-shrink-0 rounded-[1.2rem] md:rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-white shadow-lg flex items-center justify-center">
                            <span className="font-bold text-brand-dark-blue text-lg md:text-3xl tracking-tighter">
                              {story.author.split(' ').map(n => n[0]).join('')}
                            </span>

                            {/* Quote Badge icon */}
                            <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white p-0.5 md:p-1 rounded-full shadow-sm">
                              <div className="bg-brand-teal p-1 md:p-1.5 rounded-full">
                                <Quote className="w-2 h-2 md:w-3.5 md:h-3.5 text-white fill-current" />
                              </div>
                            </div>
                          </div>

                          {/* Name & Role */}
                          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h4 className="font-bold text-brand-dark-blue text-base md:text-3xl mb-0.5 md:mb-1 tracking-tight">
                              {story.author}
                            </h4>
                            <p className="text-gray-400 font-medium text-xs md:text-lg">
                              {story.role}
                            </p>
                          </div>
                        </div>

                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              {/* 3. Centered Pagination Dots */}
              <div className="custom-stories-pagination flex justify-center lg:justify-start gap-3 mt-10 md:mt-12 z-30" />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-stories-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #e2e8f0;
          opacity: 1;
          transition: all 0.3s ease;
          border-radius: 99px;
          cursor: pointer;
          margin: 0 !important;
        }
        .custom-stories-pagination .swiper-pagination-bullet-active {
          background: #2EC4B6;
          width: 8px; /* Simple dots as per mobile reference */
        }
      `}</style>
    </section>
  );
}
