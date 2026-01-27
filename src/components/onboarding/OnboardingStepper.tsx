'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: 'Basic Details' },
  { number: 2, label: 'Plan' },
  { number: 3, label: 'Payment' },
  { number: 4, label: 'Finish' },
];

export function OnboardingStepper({ currentStep, onStepClick }: OnboardingStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal stepper */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    isCompleted &&
                      'bg-brand-teal border-brand-teal text-white cursor-pointer hover:bg-brand-teal/90',
                    isCurrent &&
                      'bg-brand-teal/10 border-brand-teal text-brand-teal',
                    !isCompleted &&
                      !isCurrent &&
                      'bg-white border-gray-300 text-gray-400',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCurrent || isCompleted
                      ? 'text-brand-dark-blue'
                      : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2',
                    isCompleted ? 'bg-brand-teal' : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Compact horizontal scroll */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div
              key={step.number}
              className={cn(
                'flex items-center gap-2 shrink-0',
                isCurrent && 'flex-1'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0',
                  isCompleted &&
                    'bg-brand-teal border-brand-teal text-white',
                  isCurrent &&
                    'bg-brand-teal/10 border-brand-teal text-brand-teal',
                  !isCompleted &&
                    !isCurrent &&
                    'bg-white border-gray-300 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{step.number}</span>
                )}
              </div>
              {isCurrent && (
                <span className="text-xs font-medium text-brand-dark-blue whitespace-nowrap">
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}