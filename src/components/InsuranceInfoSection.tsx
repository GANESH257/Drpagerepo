import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { insuranceResources, insuranceTypes } from '@/data/insuranceResources';
import { ExternalLink } from 'lucide-react';

export function InsuranceInfoSection() {
  return (
    <section id="insurance" className="py-16 md:py-24 relative bg-white overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Insurance Information
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Understanding your health insurance coverage helps you make informed healthcare decisions. Learn about plan types, coverage basics, and how to maximize your benefits.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-teal-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 text-brand-dark-blue">Understanding Your Coverage</h3>
            <p className="text-gray-700 mb-4">
              Health insurance plans vary in how they cover services, providers, and costs. Key concepts include checking in-network coverage, understanding referral requirements, prior authorizations for certain procedures, preventive care benefits (often covered at no cost), and knowing the difference between urgent care and emergency coverage.
            </p>
            <div className="text-gray-700">
              <p className="mb-2">
                Coverage varies by plan. Confirm with your insurer about specific benefits, deductibles, copays, and out-of-pocket maximums.
              </p>
              <p>
                If you need help finding a physician who accepts your insurance, visit our <Link href="/practices" className="text-brand-teal hover:underline">Find a Practice</Link> directory.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Quick Insurance Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark-blue">Quick Insurance Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Verify your plan is active and coverage dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Check if your doctor is in-network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Understand your deductible and out-of-pocket maximum</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Know your copay amounts for visits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Check if referrals are needed for specialists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Review preventive care coverage (often free)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Keep your insurance card with you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-teal font-bold">✓</span>
                  <span>Save all medical bills and Explanation of Benefits</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Right Column: Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark-blue">Resources</CardTitle>
              <CardDescription>Helpful links and guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insuranceResources.slice(0, 8).map((resource, index) => (
                  <div key={index}>
                    {resource.type === 'external' ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-brand-teal hover:text-brand-dark-blue hover:underline flex items-center gap-1"
                      >
                        {resource.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={resource.url}
                        className="text-sm text-brand-teal hover:text-brand-dark-blue hover:underline"
                      >
                        {resource.title}
                      </Link>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Types Explanation */}
        <div className="max-w-5xl mx-auto mt-8">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-brand-dark-blue">Common Plan Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-brand-dark-blue">{insuranceTypes.hmo.name}</h4>
                  <p className="text-sm text-gray-700">{insuranceTypes.hmo.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-brand-dark-blue">{insuranceTypes.ppo.name}</h4>
                  <p className="text-sm text-gray-700">{insuranceTypes.ppo.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-brand-dark-blue">{insuranceTypes.epo.name}</h4>
                  <p className="text-sm text-gray-700">{insuranceTypes.epo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 italic">
            Coverage varies by plan. Confirm with your insurer.
          </p>
          <div className="text-sm text-gray-600 mt-2">
            <span>Accepted insurance varies by physician.{' '}</span>
            <Link href="/practices" className="text-brand-teal hover:underline">
              Find a practice who accepts your insurance
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
