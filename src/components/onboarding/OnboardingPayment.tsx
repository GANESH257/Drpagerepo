'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingPaymentProps {
  initialPaymentMethod?: 'paypal' | 'card';
  onComplete: (paymentMethod: 'paypal' | 'card') => void;
}

export function OnboardingPayment({
  initialPaymentMethod,
  onComplete,
}: OnboardingPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card' | null>(
    initialPaymentMethod || null
  );
  const [cardName, setCardName] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = (method: 'paypal' | 'card') => {
    setPaymentMethod(method);
  };

  const handleCompletePayment = async () => {
    if (!paymentMethod) return;

    setIsProcessing(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Dummy payment success
    onComplete(paymentMethod);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
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

      {/* Payment Form */}
      {paymentMethod === 'paypal' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-700">
                You will be redirected to PayPal to complete your payment
              </p>
              <Button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                {isProcessing ? 'Processing...' : 'Continue with PayPal'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === 'card' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardLast4">Last 4 Digits</Label>
                <Input
                  id="cardLast4"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardExp">Expiration</Label>
                <Input
                  id="cardExp"
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-800">
                <strong>Demo Mode:</strong> This is a dummy payment form. No
                actual payment will be processed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Payment Button */}
      {paymentMethod && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleCompletePayment}
            disabled={isProcessing || (paymentMethod === 'card' && !cardName)}
            className="bg-brand-teal hover:bg-brand-teal/90"
          >
            {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
          </Button>
        </div>
      )}
    </div>
  );
}