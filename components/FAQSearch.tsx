"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, ArrowRight, X, HelpCircle, Leaf, Sun, Snowflake, Droplets, MapPin, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, LucideIcon> = {
  HelpCircle,
  Leaf,
  Sun,
  Snowflake,
  Droplets,
  MapPin,
};

interface FAQItem {
  question: string;
  answer: string;
  source?: string;
}

interface FAQCategory {
  title: string;
  slug: string;
  iconName: string;
  questions: FAQItem[];
}

export function FAQSearch({ categories }: { categories: FAQCategory[] }) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;

    const lowerQuery = query.toLowerCase().trim();
    return categories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(lowerQuery) ||
            q.answer.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [query, categories]);

  const totalResults = filteredCategories.reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            data-testid="input-faq-search"
          />
          {query && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setQuery("")}
              data-testid="button-faq-search-clear"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {query.trim() && (
          <p
            className="text-sm text-muted-foreground mt-2 text-center"
            data-testid="text-faq-search-count"
          >
            {totalResults === 0
              ? "No questions match your search. Try different keywords."
              : `${totalResults} result${totalResults === 1 ? "" : "s"} found`}
          </p>
        )}
      </div>

      {filteredCategories.length === 0 && query.trim() && (
        <div
          className="text-center py-12 space-y-4"
          data-testid="section-faq-no-results"
        >
          <p className="text-lg font-semibold">No matching questions found</p>
          <p className="text-muted-foreground">
            Try searching with different keywords, or browse all categories
            below.
          </p>
          <Button
            variant="outline"
            onClick={() => setQuery("")}
            data-testid="button-faq-clear-search"
          >
            Show All Questions
          </Button>
        </div>
      )}

      {filteredCategories.map((category) => {
        const IconComponent = ICON_MAP[category.iconName] || HelpCircle;
        return (
        <section
          key={category.slug}
          id={category.slug}
          className="scroll-mt-24"
          data-testid={`section-faq-${category.slug}`}
        >
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <IconComponent
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <h2
                className="text-2xl font-bold"
                data-testid={`text-faq-category-${category.slug}`}
              >
                {category.title}
              </h2>
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full"
              data-testid={`accordion-${category.slug}`}
            >
              {category.questions.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`${category.slug}-${index}`}
                >
                  <AccordionTrigger
                    className="text-left text-base font-semibold hover:text-primary"
                    data-testid={`faq-question-${category.slug}-${index}`}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-muted-foreground"
                    data-testid={`faq-answer-${category.slug}-${index}`}
                  >
                    <p>{faq.answer}</p>
                    {faq.source && (
                      <Link
                        href={`/services/${faq.source}`}
                        className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                        data-testid={`link-faq-source-${category.slug}-${index}`}
                      >
                        Learn more about this service
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        );
      })}
    </div>
  );
}
