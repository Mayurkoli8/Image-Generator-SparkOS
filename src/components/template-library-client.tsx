import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TemplateRecord = {
  id: string;
  name: string;
  campaignType: string;
  description: string;
  promptScaffold: string;
  layoutGuidance: string;
  defaultCta: string | null;
};

export function TemplateLibraryClient({ templates }: { templates: TemplateRecord[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{template.name}</CardTitle>
              <Badge>{template.campaignType}</Badge>
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white">Prompt scaffold</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{template.promptScaffold}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Layout guidance</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{template.layoutGuidance}</p>
            </div>
            {template.defaultCta ? (
              <div>
                <p className="text-sm font-medium text-white">Default CTA</p>
                <p className="mt-2 text-sm text-slate-400">{template.defaultCta}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
