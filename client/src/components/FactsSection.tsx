import { Card, CardContent } from "@/components/ui/card";

interface Fact {
  label: string;
  value: string;
}

interface FactsSectionProps {
  title: string;
  facts: Fact[];
  testId?: string;
}

export function FactsSection({ title, facts, testId = "section-facts" }: FactsSectionProps) {
  if (!facts || facts.length === 0) {
    return null;
  }

  return (
    <div data-testid={testId}>
      <Card className="shadow-lg">
        <CardContent className="p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{title}</h2>
          <div className="space-y-0">
            {facts.map((fact, index) => (
              <div
                key={index}
                className={`flex justify-between items-center py-5 ${
                  index !== facts.length - 1 ? 'border-b border-border' : ''
                }`}
                data-testid={`fact-${index}`}
              >
                <span className="text-foreground font-medium text-base md:text-lg">
                  {fact.label}
                </span>
                <span className="text-foreground font-semibold text-base md:text-lg text-right">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
