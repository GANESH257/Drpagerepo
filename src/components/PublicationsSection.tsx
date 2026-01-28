import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { doctorPublications } from '@/data/doctorPublications';
import { ExternalLink } from 'lucide-react';

export function PublicationsSection() {
  const displayedPublications = doctorPublications.slice(0, 9);

  return (
    <section id="publications" className="py-16 md:py-24 relative bg-teal-50 overflow-visible" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46, 196, 182, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 75, 127, 0.03) 0%, transparent 50%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Latest Publications by Doctors
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Research and publications from our network of independent physicians
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedPublications.map((publication, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-brand-teal transition-colors">
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-teal flex items-start gap-2"
                  >
                    {publication.title}
                    <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0" />
                  </a>
                </CardTitle>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">{publication.authorName}</span>
                  <span className="text-muted-foreground"> • </span>
                  <span className="text-muted-foreground">{publication.year}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{publication.venue}</p>
                <a
                  href={publication.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand-teal hover:text-brand-dark-blue hover:underline inline-flex items-center gap-1"
                >
                  Read publication
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            View more publications from our physician network
          </p>
        </div>
      </div>
    </section>
  );
}
