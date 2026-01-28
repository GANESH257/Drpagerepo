'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApplicationDraft } from '@/types';

interface ApplicationPaymentMethodProps {
  initialPaymentMethod?: 'paypal' | 'card';
  initialPaymentDetails?: ApplicationDraft['paymentDetails'];
  onContinue: (paymentMethod: 'paypal' | 'card', paymentDetails?: ApplicationDraft['paymentDetails']) => void;
}

export function ApplicationPaymentMethod({
  initialPaymentMethod,
  initialPaymentDetails,
  onContinue,
}: ApplicationPaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card' | null>(
    initialPaymentMethod || null
  );
  const [cardName, setCardName] = useState(initialPaymentDetails?.cardName || '');
  const [billingZip, setBillingZip] = useState(initialPaymentDetails?.billingZip || '');

  const handlePaymentMethodSelect = (method: 'paypal' | 'card') => {
    setPaymentMethod(method);
  };

  const handleContinue = () => {
    if (!paymentMethod) return;

    const paymentDetails = paymentMethod === 'card' 
      ? { cardName: cardName.trim() || undefined, billingZip: billingZip.trim() || undefined }
      : undefined;

    onContinue(paymentMethod, paymentDetails);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800 font-medium">
            No charge will be made today. Payment will only be processed after approval.
          </p>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PayPal Option */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            paymentMethod === 'paypal' && 'ring-2 ring-brand-teal'
          )}
          onClick={() => handlePaymentMethodSelect('paypal')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  paymentMethod === 'paypal'
                    ? 'bg-brand-teal/10'
                    : 'bg-gray-100'
                )}
              >
                <Wallet
                  className={cn(
                    'h-6 w-6',
                    paymentMethod === 'paypal'
                      ? 'text-brand-teal'
                      : 'text-gray-400'
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-brand-dark-blue">PayPal</h3>
                <p className="text-sm text-muted-foreground">
                  Pay securely with PayPal
                </p>
              </div>
              {paymentMethod === 'paypal' && (
                <div className="w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credit Card Option */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            paymentMethod === 'card' && 'ring-2 ring-brand-teal'
          )}
          onClick={() => handlePaymentMethodSelect('card')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  paymentMethod === 'card' ? 'bg-brand-teal/10' : 'bg-gray-100'
                )}
              >
                <CreditCard
                  className={cn(
                    'h-6 w-6',
                    paymentMethod === 'card'
                      ? 'text-brand-teal'
                      : 'text-gray-400'
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-brand-dark-blue">
                  Credit/Debit Card
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visa, Mastercard, Amex
                </p>
              </div>
              {paymentMethod === 'card' && (
                <div className="w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Form */}
      {paymentMethod === 'card' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card (Optional)</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingZip">Billing ZIP Code (Optional)</Label>
              <Input
                id="billingZip"
                value={billingZip}
                onChange={(e) => setBillingZip(e.target.value)}
                placeholder="12345"
                maxLength={10}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Full payment details will be collected after approval. This information is for reference only.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {paymentMethod && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleContinue}
            className="bg-brand-teal hover:bg-brand-teal/90"
          >
            Continue to Review
          </Button>
        </div>
      )}
    </div>
  );
}
