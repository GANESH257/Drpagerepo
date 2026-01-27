import Link from 'next/link';
import { Download, FileText, Calendar, ClipboardList, FileCheck, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calendar,
  ClipboardList,
  FileCheck,
  Briefcase,
  Download,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon] || FileText;

  return (
    <Card className="h-full card-vibrant">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand-teal/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-brand-teal" />
          </div>
          <CardTitle className="text-lg">{tool.title}</CardTitle>
        </div>
        <CardDescription className="text-sm">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Link href={tool.url} download>
            Download Tool
            <Download className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
