'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { membershipPolicies } from '@/data/membershipPolicies';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';

export function PoliciesSection() {
  return (
    <section id="policies" className="py-16 md:py-24 bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-teal/10 mb-4">
            <FileText className="h-8 w-8 text-brand-teal" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Membership Policies
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our membership policies ensure clarity, fairness, and professional standards for all Alliance members.
          </p>
        </div>

        {/* Policies Accordion */}
        <div className="max-w-6xl mx-auto mb-12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {membershipPolicies.map((policyCategory) => (
              <AccordionItem
                key={policyCategory.category}
                value={policyCategory.category}
                className="border border-gray-200 rounded-lg px-6 bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold text-brand-dark-blue hover:no-underline">
                  {policyCategory.category} ({policyCategory.items.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-4">
                    {policyCategory.items.map((item) => (
                      <Card key={item.id} className="border-gray-100">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-semibold text-brand-dark-blue">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">{item.body}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* PDF Download */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="border-brand-teal/20 bg-white">
            <CardContent className="p-6">
              <FileText className="h-12 w-12 text-brand-teal mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-dark-blue mb-2">
                Complete Membership Policy Document
              </h3>
              <p className="text-gray-700 mb-6">
                Download the full membership policy document for detailed information about all policies and procedures.
              </p>
              <Button
                className="bg-brand-teal hover:bg-brand-teal/90 text-white"
                asChild
              >
                <Link href="/policies/membership-policy.pdf" target="_blank">
                  <Download className="mr-2 h-4 w-4" />
                  Download Membership Policy PDF
                </Link>
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                {/* TODO: Replace with actual PDF file */}
                Note: PDF placeholder - replace with actual membership policy document
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
