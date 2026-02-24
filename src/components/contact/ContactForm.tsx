'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { Playfair_Display } from 'next/font/google';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContactEnquiry } from '@/lib/contactStorage';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const inquiryTypeOptions = [
  'I am a Patient with a question',
  'I am a Physician interested in joining',
  'Other',
];

const subjectOptions = [
  'General Inquiry',
  'Membership Information',
  'Technical Support',
  'Partnership Opportunities',
  'Other',
];

const PRIVACY_CONSENT_TEXT = 'I agree to the privacy policy and authorize Alliance of Independent Physicians to contact me regarding my inquiry';
const SMS_CONSENT_TEXT = 'I consent to receive SMS messages from Alliance of Independent Physicians for appointment confirmations, reminders, and other healthcare-related information.';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'sms' | ''>('');
  const [consentPrivacy, setConsentPrivacy] = useState(true);
  const [consentSms, setConsentSms] = useState(true);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
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
      { threshold: 0.15 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });
    return true;
  };

  const validatePhone = (phoneValue: string): boolean => {
    if (!phoneValue.trim()) {
      setErrors(prev => ({ ...prev, phone: 'Phone number is required' }));
      return false;
    }
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(phoneValue.trim()) || phoneValue.replace(/\D/g, '').length < 10) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      return newErrors;
    });
    return true;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      if (!phoneRegex.test(phone.trim()) || phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!inquiryType.trim()) {
      newErrors.inquiryType = 'Please select an option';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (!consentPrivacy) {
      newErrors.consentPrivacy = 'Privacy consent is required';
    }

    if (!consentSms) {
      newErrors.consentSms = 'SMS consent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSuccess(false);

    if (!validate()) {
      // Scroll to first error
      const firstErrorField = formRef.current?.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        (firstErrorField as HTMLElement).focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const enquiry: Omit<ContactEnquiry, 'id' | 'createdAt'> & { inquiryType?: string } = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        preferredContact: preferredContact || undefined,
        inquiryType: inquiryType.trim() || undefined,
        consentPrivacy: true,
        consentSms: true,
      };

      // Dynamically import to ensure client-side only execution
      const { saveContactEnquiry } = await import('@/lib/contactStorage');
      saveContactEnquiry(enquiry);
      
      // Show success
      setIsSuccess(true);
      
      // Reset form (keep name/email for convenience)
      setPhone('');
      setInquiryType('');
      setSubject('');
      setMessage('');
      setPreferredContact('');
      setConsentPrivacy(false);
      setConsentSms(false);
      setErrors({});

      // Scroll to success message
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setName('');
    setEmail('');
    setPhone('');
    setInquiryType('');
    setSubject('');
    setMessage('');
    setPreferredContact('');
    setConsentPrivacy(false);
    setConsentSms(false);
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <section className="py-16 md:py-24 bg-white" data-scroll-exclude>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white border border-gray-200 shadow-lg" data-scroll-exclude>
            <CardHeader className="pb-4">
              <div
                ref={headerRef}
                className="flex flex-col items-center text-center space-y-1.5"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion
                    ? 'opacity 0.3s ease'
                    : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span
                  className={cn(
                    'inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full border border-brand-dark-blue/20',
                    playfairDisplay.className
                  )}
                >
                  Contact
                </span>
                <h3 className="tracking-tight text-2xl md:text-3xl font-bold text-brand-dark-blue">
                  Send us a{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">
                    Message
                  </span>
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate data-scroll-exclude data-scroll-speed="0">
                {/* Success Message */}
                {isSuccess && (
                  <Alert
                    ref={successRef}
                    className="bg-green-50 border-green-200 text-green-800"
                    role="alert"
                    aria-live="polite"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="font-medium">
                      Thanks — your enquiry has been received.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Summary */}
                {Object.keys(errors).length > 0 && !isSuccess && (
                  <Alert variant="destructive" role="alert" aria-live="polite">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please correct the errors below before submitting.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <Alert variant="destructive" role="alert" aria-live="polite">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                {/* Full Name */}
                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="contact-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.name;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => {
                      if (!name.trim()) {
                        setErrors(prev => ({ ...prev, name: 'Full name is required' }));
                      }
                    }}
                    placeholder="John Doe"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={errors.name ? 'border-destructive' : ''}
                    data-scroll-speed="0"
                    required
                  />
                  {errors.name && (
                    <p
                      id="contact-name-error"
                      className="text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="contact-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    placeholder="your.email@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className={errors.email ? 'border-destructive' : ''}
                    data-scroll-speed="0"
                    required
                  />
                  {errors.email && (
                    <p
                      id="contact-email-error"
                      className="text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="contact-phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) validatePhone(e.target.value);
                    }}
                    onBlur={() => validatePhone(phone)}
                    placeholder="(555) 123-4567"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                    className={errors.phone ? 'border-destructive' : ''}
                    data-scroll-speed="0"
                    required
                  />
                  {errors.phone && (
                    <p
                      id="contact-phone-error"
                      className="text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Inquiry Type */}
                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="contact-inquiry-type">
                    I am... <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={inquiryType}
                    onValueChange={(value) => {
                      setInquiryType(value);
                      if (errors.inquiryType) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.inquiryType;
                          return newErrors;
                        });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="contact-inquiry-type"
                      className={errors.inquiryType ? 'border-destructive' : ''}
                      aria-invalid={!!errors.inquiryType}
                      aria-describedby={errors.inquiryType ? 'contact-inquiry-type-error' : undefined}
                      data-scroll-speed="0"
                    >
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.inquiryType && (
                    <p
                      id="contact-inquiry-type-error"
                      className="text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.inquiryType}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="contact-subject">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={subject}
                    onValueChange={(value) => {
                      setSubject(value);
                      if (errors.subject) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.subject;
                          return newErrors;
                        });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="contact-subject"
                      className={errors.subject ? 'border-destructive' : ''}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                      data-scroll-speed="0"
                    >
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p
                      id="contact-subject-error"
                      className="text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2" data-scroll-exclude>
                  <Label htmlFor="contact-message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) {
                        const msg = e.target.value.trim();
                        if (msg.length >= 10) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.message;
                            return newErrors;
                          });
                        }
                      }
                    }}
                    onBlur={() => {
                      if (!message.trim()) {
                        setErrors(prev => ({ ...prev, message: 'Message is required' }));
                      } else if (message.trim().length < 10) {
                        setErrors(prev => ({ ...prev, message: 'Message must be at least 10 characters' }));
                      }
                    }}
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className={errors.message ? 'border-destructive' : ''}
                    data-scroll-speed="0"
                    required
                  />
                  {errors.message && (
                    <p
                      id="contact-message-error"
                      className="text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-3" data-scroll-exclude data-scroll-speed="0">
                  <Label>Preferred Contact Method</Label>
                  <div className="flex flex-col gap-3 w-full" data-scroll-exclude data-scroll-speed="0">
                    {(['email', 'phone', 'sms'] as const).map((method) => (
                      <div key={method} className="flex items-center space-x-2 w-full" data-scroll-exclude data-scroll-speed="0">
                        <input
                          type="radio"
                          id={`contact-method-${method}`}
                          name="preferredContact"
                          value={method}
                          checked={preferredContact === method}
                          onChange={(e) => setPreferredContact(e.target.value as 'email' | 'phone' | 'sms')}
                          className="h-4 w-4 text-brand-dark-blue focus:ring-brand-dark-blue border-gray-300 flex-shrink-0"
                          data-scroll-speed="0"
                        />
                        <Label
                          htmlFor={`contact-method-${method}`}
                          className="text-sm font-normal cursor-pointer capitalize"
                        >
                          {method === 'sms' ? 'SMS' : method.charAt(0).toUpperCase() + method.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Consent Checkbox */}
                <div className="space-y-2" data-scroll-exclude>
                  <div className="flex items-start space-x-3 w-full">
                    <Checkbox
                      id="contact-privacy-consent"
                      checked={consentPrivacy}
                      onCheckedChange={(checked) => {
                        setConsentPrivacy(checked === true);
                        if (errors.consentPrivacy) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.consentPrivacy;
                            return newErrors;
                          });
                        }
                      }}
                      className={errors.consentPrivacy ? 'border-destructive' : ''}
                      aria-invalid={!!errors.consentPrivacy}
                      aria-describedby={errors.consentPrivacy ? 'contact-privacy-consent-error' : undefined}
                      data-scroll-speed="0"
                    />
                    <Label
                      htmlFor="contact-privacy-consent"
                      className="text-sm leading-relaxed cursor-pointer flex-1 min-w-0"
                    >
                      {PRIVACY_CONSENT_TEXT}{' '}
                      <a
                        href="/privacy-policy"
                        className="text-brand-dark-blue hover:underline"
                        onClick={(e) => {
                          // Check if route exists, otherwise prevent default and show TODO
                          e.preventDefault();
                          // TODO: Add privacy policy page or handle link
                          alert('Privacy Policy page coming soon');
                        }}
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  {errors.consentPrivacy && (
                    <p
                      id="contact-privacy-consent-error"
                      className="text-sm text-destructive ml-7"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.consentPrivacy}
                    </p>
                  )}
                </div>

                {/* SMS Consent Checkbox */}
                <div className="space-y-2" data-scroll-exclude>
                  <div className="flex items-start space-x-3 w-full">
                    <Checkbox
                      id="contact-sms-consent"
                      checked={consentSms}
                      onCheckedChange={(checked) => {
                        setConsentSms(checked === true);
                        if (errors.consentSms) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.consentSms;
                            return newErrors;
                          });
                        }
                      }}
                      className={errors.consentSms ? 'border-destructive' : ''}
                      aria-invalid={!!errors.consentSms}
                      aria-describedby={errors.consentSms ? 'contact-sms-consent-error' : undefined}
                      data-scroll-speed="0"
                    />
                    <Label
                      htmlFor="contact-sms-consent"
                      className="text-sm leading-relaxed cursor-pointer flex-1 min-w-0"
                    >
                      {SMS_CONSENT_TEXT}
                    </Label>
                  </div>
                  {errors.consentSms && (
                    <p
                      id="contact-sms-consent-error"
                      className="text-sm text-destructive ml-7"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.consentSms}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                  </Button>
                  <button
                    type="button"
                    id="contact-clear-button"
                    onClick={handleClear}
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded-md px-8 text-sm font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border-2 border-solid border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 hover:text-brand-dark-blue hover:border-brand-dark-blue hover:shadow-md hover:scale-105 shadow-sm"
                    style={{
                      backgroundColor: 'white',
                      borderColor: '#0F5FA8',
                      color: '#0F5FA8',
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
