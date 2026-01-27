import Link from 'next/link';
import { ExternalLink, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PillarResource } from '@/types';

interface ResourceCardProps {
  resource: PillarResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const isExternal = resource.type === 'external';
  const fileSizeText = resource.fileSize ? ` (${resource.fileSize})` : '';

  return (
    <Card className="h-full card-vibrant">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{resource.title}</CardTitle>
        <CardDescription className="text-sm">
          {resource.description}
          {fileSizeText && <span className="text-xs text-muted-foreground">{fileSizeText}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isExternal ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link href={resource.url} target="_blank" rel="noreferrer">
              Open Resource
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link href={resource.url} download>
              Download Guide
              <Download className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
