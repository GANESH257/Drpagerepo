import Link from 'next/link';
import { doctors } from '@/data/doctors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle2 } from 'lucide-react';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';

export function FeaturedDoctors() {
  const featured = doctors.filter((d) => d.featured).slice(0, 6);

  return (
    <section id="featured-doctors" className="py-16 md:py-24 relative overflow-hidden">
      {/* Enhanced layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-brand-dark-blue/10 to-brand-teal/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-teal/6 via-transparent to-brand-dark-blue/6" />
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-dark-blue rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-teal rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Featured Doctors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet some of our highly rated physicians across various
            specialties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((doctor) => (
            <Card
              key={doctor.id}
              className="hover:shadow-xl transition-all group hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-2 hover:border-brand-teal/30"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {doctor.fullName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {doctor.specialty}
                    </CardDescription>
                  </div>
                  {doctor.verified && (
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold">
                      {doctor.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    ({doctor.reviewCount} reviews)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {doctor.bio}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={getDoctorProfileUrl(doctor)}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link href="/doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
