import { doctors } from '@/data/doctors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2 } from 'lucide-react';

export function Reviews() {
  // Get reviews from featured doctors
  const featuredDoctors = doctors.filter((d) => d.featured);
  const allReviews = featuredDoctors
    .flatMap((doctor) =>
      doctor.reviews.slice(0, 2).map((review) => ({
        ...review,
        doctorName: doctor.fullName,
        doctorSpecialty: doctor.specialty,
      }))
    )
    .slice(0, 6);

  return (
    <section id="reviews" className="py-16 md:py-24 relative overflow-hidden">
      {/* Enhanced layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/12 via-background via-50% to-brand-teal/12" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/6 via-transparent to-brand-dark-blue/6" />
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-brand-teal rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-dark-blue rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            What Patients Are Saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Read authentic reviews from verified patients who have visited our
            physicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allReviews.map((review) => (
            <Card key={review.id} className="h-full hover:shadow-xl transition-all hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-2 hover:border-brand-teal/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(review.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-semibold">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  {review.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified Visit
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{review.comment}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{review.patientName}</span>
                  <span className="text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {review.doctorName} - {review.doctorSpecialty}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
