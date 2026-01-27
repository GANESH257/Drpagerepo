'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { loadOnboardingDraft, saveOnboardingDraft } from '@/lib/onboardingStorage';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { OnboardingBasicDetailsForm } from '@/components/onboarding/OnboardingBasicDetailsForm';
import { OnboardingPlanSelect } from '@/components/onboarding/OnboardingPlanSelect';
import { OnboardingPayment } from '@/components/onboarding/OnboardingPayment';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';
import { OnboardingDraft } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Users, Network, Shield } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getSession, isAuthenticated } = useDoctorSession();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/join-us');
      return;
    }

    const session = getSession();
    if (!session?.email) {
      router.push('/join-us');
      return;
    }

    // Load draft or initialize
    const savedDraft = loadOnboardingDraft(session.email);
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
      const newDraft: OnboardingDraft = {
        step: (stepFromParam && stepFromParam >= 1 && stepFromParam <= 4
          ? stepFromParam
          : 1) as 1 | 2 | 3 | 4,
      };
      setDraft(newDraft);
      setCurrentStep(newDraft.step);
    }
  }, [router, searchParams, getSession, isAuthenticated]);

  const updateDraft = (updates: Partial<OnboardingDraft>) => {
    if (!draft) return;

    const session = getSession();
    if (!session?.email) return;

    const updated: OnboardingDraft = {
      ...draft,
      ...updates,
      step: (updates.step || draft.step) as 1 | 2 | 3 | 4,
    };

    setDraft(updated);
    saveOnboardingDraft(session.email, updated);
  };

  const handleStep1Continue = (basicDetails: OnboardingDraft['basicDetails']) => {
    updateDraft({ basicDetails, step: 2 });
    setCurrentStep(2);
    router.push('/join-us/onboarding?step=2', { scroll: false });
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
    router.push('/join-us/onboarding?step=3', { scroll: false });
  };

  const handleStep3Complete = (paymentMethod: 'paypal' | 'card') => {
    updateDraft({ paymentMethod, step: 4 });
    setCurrentStep(4);
    router.push('/join-us/onboarding?step=4', { scroll: false });
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep && draft) {
      setCurrentStep(step as 1 | 2 | 3 | 4);
      updateDraft({ step: step as 1 | 2 | 3 | 4 });
      router.push(`/join-us/onboarding?step=${step}`, { scroll: false });
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

  const session = getSession();
  if (!session?.email) return null;

  return (
    <div ref={sectionRef} className="min-h-screen skin-benefits-enhanced">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              {/* Stepper */}
              <Card>
                <CardContent className="p-6">
                  <OnboardingStepper
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                  />
                </CardContent>
              </Card>

              {/* Benefits Panel */}
              <Card className="bg-brand-dark-blue text-white border-brand-dark-blue">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Why Join?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Network className="h-5 w-5 shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Connect with a trusted network of independent physicians
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Access referral network and patient directory
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Verified profiles and professional credibility
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Streamlined appointment and referral management
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 lg:w-2/3">
            <Card className="shadow-xl">
              <CardContent className="p-6 md:p-8 lg:p-12">
                {/* Mobile Stepper */}
                <div className="lg:hidden mb-8">
                  <OnboardingStepper
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                  />
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark-blue mb-2">
                      Basic Details
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Tell us about yourself and your practice
                    </p>
                    <OnboardingBasicDetailsForm
                      initialData={draft.basicDetails}
                      onContinue={handleStep1Continue}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark-blue mb-2">
                      Choose Your Plan
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Select a membership plan that fits your needs
                    </p>
                    <OnboardingPlanSelect
                      initialPlanId={draft.selectedPlan?.planId}
                      initialBillingCycle={draft.selectedPlan?.billingCycle}
                      onContinue={handleStep2Continue}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark-blue mb-2">
                      Payment
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Complete your membership payment
                    </p>
                    <OnboardingPayment
                      initialPaymentMethod={draft.paymentMethod}
                      onComplete={handleStep3Complete}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <OnboardingComplete email={session.email} draft={draft} />
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

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen skin-benefits-enhanced flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}