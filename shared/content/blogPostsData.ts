import type { BlogPostData } from '../blogContent';
import { getExpandedClusterHtml, COST_CLUSTER_CONTENT } from './wave1/costClusterPosts';
import { guidePath } from '../contentHubs';

const PILLAR = guidePath('boise-cabinet-cost-guide');

function clusterFaqs(
  topic: string,
): Array<{ question: string; answer: string }> {
  return [
    {
      question: `How much do ${topic} cost in Boise?`,
      answer:
        'Planning ranges depend on line, finishes, and scope. See the tables in this article and our Boise Cabinet Cost Guide for full context.',
    },
    {
      question: 'What is included in a cabinet quote?',
      answer:
        'Our quotes specify cabinet line, boxes, fronts, hardware, delivery, and installation—countertops and appliances are typically separate.',
    },
    {
      question: 'How long until cabinets are installed?',
      answer:
        'Timelines vary by line and finish—often several weeks of design plus 6–12 weeks fabrication after design lock.',
    },
    {
      question: 'Can I supply my own countertops?',
      answer:
        'Yes—we coordinate cabinet installation with your countertop fabricator’s schedule.',
    },
    {
      question: 'Do you serve Meridian and Eagle?',
      answer:
        'Yes. We serve Boise, Meridian, Eagle, Kuna, Star, Middleton, Nampa, and Caldwell.',
    },
    {
      question: 'How do I get a firm price?',
      answer:
        'Schedule a consultation for a written scope after we review your room and goals.',
    },
    {
      question: 'Why do cabinet bids vary?',
      answer:
        'Different lines, box materials, hardware, and install scope change bids. Compare aligned specifications.',
    },
    {
      question: 'Should I hold contingency?',
      answer:
        'Yes—10–15% is prudent for field adjustments and late layout changes in older Treasure Valley homes.',
    },
  ];
}

function makeCostCluster(
  slug: keyof typeof COST_CLUSTER_CONTENT,
  title: string,
  seoTitle: string,
  metaDescription: string,
  excerpt: string,
  tags: string[],
): BlogPostData {
  const pack = COST_CLUSTER_CONTENT[slug];
  return {
    slug,
    title,
    seoTitle,
    metaDescription,
    excerpt,
    content: getExpandedClusterHtml(slug),
    author: 'Boise Cabinet Co',
    category: 'Boise Cabinet Costs',
    hubSlug: 'cabinet-costs',
    tags,
    publishedAt: '2026-05-02',
    faqs: clusterFaqs(title.toLowerCase()),
    quickAnswer: pack.quickAnswer,
    keyTakeaways: pack.takeaways,
    relatedLinks: [
      { url: PILLAR, anchor: 'Boise Cabinet Cost Guide' },
      { url: '/cabinets/kitchen' },
      { url: '/cabinets/bathroom' },
      { url: '/guides/treasure-valley-cabinet-guide' },
    ],
    primaryKeyword: slug.replace(/-/g, ' '),
    wordCountTarget: 'cluster',
  };
}

export const WAVE1_COST_CLUSTERS: BlogPostData[] = [
  makeCostCluster(
    'kitchen-cabinet-cost-boise',
    'Kitchen Cabinet Cost Boise (2026 Planning Ranges)',
    'Kitchen Cabinet Cost Boise | Treasure Valley',
    'Kitchen cabinet cost in Boise, Meridian, and Eagle: lines, finishes, installation, and budgeting from a local custom cabinet team.',
    'Kitchen cabinets in Boise typically range from about $15,000 to $45,000+ installed depending on line, layout, and finishes.',
    ['kitchen', 'cost', 'cabinets', 'boise'],
  ),
  makeCostCluster(
    'bathroom-vanity-cost-boise',
    'Bathroom Vanity Cost Boise: Guest vs Master',
    'Bathroom Vanity Cost Boise Idaho',
    'Bathroom vanity cabinet cost in Boise and the Treasure Valley: guest baths, master suites, and storage options.',
    'Guest and master vanity cabinets sit on different budgets—plan with realistic Treasure Valley ranges.',
    ['bathroom', 'cost', 'vanity', 'boise'],
  ),
  makeCostCluster(
    'whole-home-cabinet-cost-boise',
    'Whole-Home Cabinet Cost Boise',
    'Whole-Home Cabinet Cost Boise Idaho',
    'Whole-home cabinet package cost planning for Boise, Meridian, and Eagle: phasing, finishes, and coordinated delivery.',
    'Whole-home cabinet programs often plan between $40,000 and $120,000+ depending on room count and line.',
    ['whole-home', 'cost', 'cabinets'],
  ),
  makeCostCluster(
    'luxury-custom-cabinet-cost-boise',
    'Luxury Custom Cabinet Cost Boise & Eagle',
    'Luxury Custom Cabinet Cost Boise Idaho',
    'Luxury custom cabinet costs in Eagle, the Foothills, and premium Boise neighborhoods: finishes, design time, and installation.',
    'Luxury custom cabinets often exceed $60,000 for multi-room scope with premium finishes and hardware.',
    ['luxury', 'cost', 'cabinets', 'eagle'],
  ),
  makeCostCluster(
    'what-impacts-cabinet-costs-boise',
    'What Impacts Cabinet Costs in Boise?',
    'What Impacts Cabinet Costs Boise',
    'Top cost drivers for Treasure Valley cabinets: line, box material, finishes, accessories, and installation complexity.',
    'Cabinet line, finish level, interior accessories, and field conditions move Boise cabinet costs more than room size alone.',
    ['cost', 'planning', 'cabinets', 'boise'],
  ),
  makeCostCluster(
    'how-to-budget-cabinets-boise',
    'How to Budget for Cabinets in Boise',
    'How to Budget for Cabinets Boise',
    'Step-by-step cabinet budget framework for Idaho homeowners: contingency, hardware, and comparing quotes.',
    'Budget cabinet line, finishes, hardware, and install separately for a realistic Treasure Valley plan.',
    ['budget', 'planning', 'cabinets', 'boise'],
  ),
];
