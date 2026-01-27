'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApplicationStepper } from '@/components/join-us/ApplicationStepper';
import { ApplicationBasicDetailsForm } from '@/components/join-us/ApplicationBasicDetailsForm';
import { ApplicationPlanSelect } from '@/components/join-us/ApplicationPlanSelect';
import { ApplicationPaymentMethod } from '@/components/join-us/ApplicationPaymentMethod';
import { ApplicationReview } from '@/components/join-us/ApplicationReview';
import { ApplicationDraft } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Users, Network, Shield } from 'lucide-react';
import {
  loadApplicationDraft,
  saveApplicationDraft,
  getJoinEmail,
} from '@/lib/joinRequestStorage';

function ApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set visible immediately for better UX
    setIsVisible(true);
    
    // Load draft from localStorage
    const savedDraft = loadApplicationDraft();
    const stepParam = searchParams.get('step');
    const stepFromParam = stepParam ? parseInt(stepParam, 10) : null;

    if (savedDraft) {
      setDraft(savedDraft);
      setCurrentStep(
        (stepFromParam && stepFromParam >= 1 && stepFromParam <= 4
          ? stepFromParam
          : savedDraft.step) as 1 | 2 | 3 | 4
      );
    } else {
      // Initialize new draft
      const email = getJoinEmail();
      const newDraft: ApplicationDraft = {
        step: (stepFromParam && stepFromParam >= 1 && stepFromParam <= 4
          ? stepFromParam
          : 1) as 1 | 2 | 3 | 4,
        basicDetails: email
          ? {
              email,
              fullName: '',
              credentials: '',
              specialty: '',
              phone: '',
              city: '',
              state: '',
            }
          : undefined,
      };
      setDraft(newDraft);
      setCurrentStep(newDraft.step);
    }
  }, [searchParams]);

  const updateDraft = (updates: Partial<ApplicationDraft>) => {
    if (!draft) return;

    const updated: ApplicationDraft = {
      ...draft,
      ...updates,
      step: (updates.step || draft.step) as 1 | 2 | 3 | 4,
    };

    setDraft(updated);
    saveApplicationDraft(updated);
  };

  const handleStep1Continue = (basicDetails: ApplicationDraft['basicDetails']) => {
    if (!basicDetails) return;
    updateDraft({ basicDetails, step: 2 });
    setCurrentStep(2);
    router.push('/join-us/application?step=2', { scroll: false });
  };

  const handleStep2Continue = (
    planId: string,
    billingCycle: 'monthly' | 'annual'
  ) => {
    updateDraft({
      selectedPlan: { planId, billingCycle },
      step: 3,
    });
    setCurrentStep(3);
    router.push('/join-us/application?step=3', { scroll: false });
  };

  const handleStep3Continue = (
    paymentMethod: 'paypal' | 'card',
    paymentDetails?: ApplicationDraft['paymentDetails']
  ) => {
    updateDraft({ paymentMethod, paymentDetails, step: 4 });
    setCurrentStep(4);
    router.push('/join-us/application?step=4', { scroll: false });
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep && draft) {
      setCurrentStep(step as 1 | 2 | 3 | 4);
      updateDraft({ step: step as 1 | 2 | 3 | 4 });
      router.push(`/join-us/application?step=${step}`, { scroll: false });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!draft) {
    return (
      <div className="min-h-screen skin-benefits-enhanced flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="min-h-screen skin-benefits-enhanced">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left Sidebar - Desktop Only */}
          <div 
            className="hidden lg:block lg:w-1/3"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s',
            }}
          >
            <div className="sticky top-24 space-y-6">
              {/* Stepper */}
              <Card className="border-2 border-transparent bg-white hover:border-brand-teal/30 hover:shadow-lg transition-all duration-300 hover-lift">
                <CardContent className="p-6">
                  <ApplicationStepper
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                  />
                </CardContent>
              </Card>

              {/* Benefits Panel */}
              <Card className="bg-brand-dark-blue text-white border-2 border-brand-dark-blue shadow-xl transition-all duration-300 hover:shadow-2xl hover-lift">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Why Join?</h3>
                  <ul className="space-y-3">
                    {[
                      { icon: Network, text: 'Connect with a trusted network of independent physicians' },
                      { icon: Users, text: 'Access referral network and patient directory' },
                      { icon: Shield, text: 'Verified profiles and professional credibility' },
                      { icon: CheckCircle2, text: 'Streamlined appointment and referral management' },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <li 
                          key={index}
                          className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2"
                        >
                          <Icon className="h-5 w-5 shrink-0 mt-0.5 text-brand-teal" />
                          <span className="text-sm">{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Content */}
          <div 
            className="flex-1 lg:w-2/3"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.3s, transform 0.7s ease-out 0.3s',
            }}
          >
            <Card className="card-vibrant">
              <CardContent className="p-6 md:p-8 lg:p-12">
                {/* Mobile Stepper */}
                <div className="lg:hidden mb-8">
                  <ApplicationStepper
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                  />
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-brand-dark-blue mb-2">
                      Basic Information
                    </h2>
                    <p className="text-muted-foreground mb-6 text-base">
                      Tell us about yourself and your practice
                    </p>
                    <ApplicationBasicDetailsForm
                      initialData={draft.basicDetails}
                      onContinue={handleStep1Continue}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-brand-dark-blue mb-2">
                      Select Membership Plan
                    </h2>
                    <p className="text-muted-foreground mb-6 text-base">
                      Choose a plan that fits your needs
                    </p>
                    <ApplicationPlanSelect
                      initialPlanId={draft.selectedPlan?.planId}
                      initialBillingCycle={draft.selectedPlan?.billingCycle}
                      onContinue={handleStep2Continue}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-brand-dark-blue mb-2">
                      Payment Method
                    </h2>
                    <p className="text-muted-foreground mb-6 text-base">
                      Select your preferred payment method
                    </p>
                    <ApplicationPaymentMethod
                      initialPaymentMethod={draft.paymentMethod}
                      initialPaymentDetails={draft.paymentDetails}
                      onContinue={handleStep3Continue}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-brand-dark-blue mb-2">
                      Review & Submit
                    </h2>
                    <p className="text-muted-foreground mb-6 text-base">
                      Review your information before submitting
                    </p>
                    <ApplicationReview draft={draft} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen skin-benefits-enhanced flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
        </div>
      }
    >
      <ApplicationContent />
    </Suspense>
  );
}
