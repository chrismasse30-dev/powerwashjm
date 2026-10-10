import React from 'react';
import { Link } from 'react-router-dom';
import { townsData } from '../data/townsData';

interface TownLinkedTextProps {
  children: string;
  className?: string;
}

const townMap = new Map<string, { name: string; slug: string }>();

townsData.forEach(town => {
  townMap.set(town.name.toLowerCase(), { name: town.name, slug: town.slug });

  const withComma = `${town.name}, ${town.stateAbbr}`.toLowerCase();
  townMap.set(withComma, { name: town.name, slug: town.slug });

  const fullState = `${town.name}, ${town.state}`.toLowerCase();
  townMap.set(fullState, { name: town.name, slug: town.slug });
});

const townNames = Array.from(
  new Set(townsData.map(t => t.name))
).sort((a, b) => b.length - a.length);

const serviceKeywords = new Map<string, { text: string; url: string; priority: number }>([
  ['get your custom pricing', { text: 'get your custom pricing', url: '/get-quote', priority: 3 }],
  ['flexible financing', { text: 'flexible financing', url: '/financing', priority: 2 }],
  ['financing options', { text: 'financing options', url: '/financing', priority: 2 }],
  ['payment plans', { text: 'payment plans', url: '/financing', priority: 2 }],
  ['deck restoration', { text: 'deck restoration', url: '/deck-cleaning', priority: 2 }],
  ['commercial power washing', { text: 'commercial power washing', url: '/commercial', priority: 2 }],
  ['request a quote', { text: 'request a quote', url: '/get-quote', priority: 2 }],
  ['house washing', { text: 'house washing', url: '/house-washing', priority: 1 }],
  ['roof cleaning', { text: 'roof cleaning', url: '/roof-cleaning', priority: 1 }],
  ['deck cleaning', { text: 'deck cleaning', url: '/deck-cleaning', priority: 1 }],
  ['gutter cleaning', { text: 'gutter cleaning', url: '/gutter-cleaning', priority: 1 }],
  ['concrete cleaning', { text: 'concrete cleaning', url: '/concrete-cleaning', priority: 1 }],
  ['driveway cleaning', { text: 'driveway cleaning', url: '/concrete-cleaning', priority: 1 }],
  ['holiday lights', { text: 'holiday lights', url: '/holiday-lights', priority: 1 }],
  ['holiday light', { text: 'holiday light', url: '/holiday-lights', priority: 1 }],
  ['commercial services', { text: 'commercial services', url: '/commercial', priority: 1 }],
  ['commercial cleaning', { text: 'commercial cleaning', url: '/commercial', priority: 1 }],
  ['hoa cleaning', { text: 'HOA cleaning', url: '/hoa-condo-cleaning', priority: 1 }],
  ['condo cleaning', { text: 'condo cleaning', url: '/hoa-condo-cleaning', priority: 1 }],
  ['soft washing', { text: 'soft washing', url: '/house-washing', priority: 1 }],
  ['soft wash', { text: 'soft wash', url: '/house-washing', priority: 1 }],
  ['pressure washing', { text: 'pressure washing', url: '/house-washing', priority: 1 }],
  ['online quote', { text: 'online quote', url: '/get-quote', priority: 1 }],
  ['quote online', { text: 'quote online', url: '/get-quote', priority: 1 }],
  ['get a quote', { text: 'get a quote', url: '/get-quote', priority: 1 }]
]);

const serviceKeywordsSorted = Array.from(serviceKeywords.keys()).sort((a, b) => {
  const priorityDiff = (serviceKeywords.get(b)?.priority || 0) - (serviceKeywords.get(a)?.priority || 0);
  if (priorityDiff !== 0) return priorityDiff;
  return b.length - a.length;
});

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function TownLinkedText({ children, className }: TownLinkedTextProps) {
  if (!children || typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  const allKeywords = [...serviceKeywordsSorted, ...townNames];
  const pattern = new RegExp(
    `\\b(${allKeywords.map(escapeRegex).join('|')})\\b`,
    'gi'
  );

  const parts: (string | JSX.Element)[] = [];
  const matches: Array<{ start: number; end: number; text: string; type: 'service' | 'town' }> = [];
  let match;

  const textToParse = children;
  const regex = new RegExp(pattern.source, pattern.flags);

  while ((match = regex.exec(textToParse)) !== null) {
    const matchedText = match[0];
    const matchIndex = match.index;
    const matchEnd = matchIndex + matchedText.length;

    const hasOverlap = matches.some(
      m => (matchIndex >= m.start && matchIndex < m.end) || (matchEnd > m.start && matchEnd <= m.end)
    );

    if (!hasOverlap) {
      const serviceData = serviceKeywords.get(matchedText.toLowerCase());
      const townData = townMap.get(matchedText.toLowerCase());

      if (serviceData || townData) {
        matches.push({
          start: matchIndex,
          end: matchEnd,
          text: matchedText,
          type: serviceData ? 'service' : 'town'
        });
      }
    }
  }

  matches.sort((a, b) => a.start - b.start);

  let lastIndex = 0;
  let keyCounter = 0;

  matches.forEach(({ start, end, text, type }) => {
    if (start > lastIndex) {
      parts.push(textToParse.substring(lastIndex, start));
    }

    if (type === 'service') {
      const serviceData = serviceKeywords.get(text.toLowerCase());
      if (serviceData) {
        parts.push(
          <Link
            key={`service-${keyCounter++}`}
            to={serviceData.url}
            className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          >
            {text}
          </Link>
        );
      }
    } else {
      const townData = townMap.get(text.toLowerCase());
      if (townData) {
        parts.push(
          <Link
            key={`town-${keyCounter++}`}
            to={`/towns/${townData.slug}/`}
            className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          >
            {text}
          </Link>
        );
      }
    }

    lastIndex = end;
  });

  if (lastIndex < textToParse.length) {
    parts.push(textToParse.substring(lastIndex));
  }

  if (parts.length === 0) {
    parts.push(textToParse);
  }

  return <span className={className}>{parts}</span>;
}
