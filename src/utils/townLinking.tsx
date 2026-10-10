import React from 'react';
import { townsData } from '../data/townsData';

const townNameToSlugMap = new Map<string, string>();
const townVariationsMap = new Map<string, string[]>();

townsData.forEach(town => {
  const baseSlug = town.slug;
  const baseName = town.name;

  townNameToSlugMap.set(baseName.toLowerCase(), baseSlug);

  const variations = [
    baseName,
    `${baseName}, ${town.stateAbbr}`,
    `${baseName}, ${town.state}`,
  ];

  townVariationsMap.set(baseName.toLowerCase(), variations);
});

export function linkifyTownNames(text: string): React.ReactNode[] {
  if (!text) return [text];

  const townNames = Array.from(townNameToSlugMap.keys())
    .sort((a, b) => b.length - a.length);

  const pattern = new RegExp(
    `\\b(${townNames.map(escapeRegex).join('|')})\\b`,
    'gi'
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const regex = new RegExp(pattern);

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    const townKey = matchedText.toLowerCase();
    const slug = townNameToSlugMap.get(townKey);

    if (slug) {
      parts.push(
        <a
          key={`town-${matchIndex}-${slug}`}
          href={`/towns/${slug}/`}
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {matchedText}
        </a>
      );
    } else {
      parts.push(matchedText);
    }

    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getTownSlug(townName: string): string | undefined {
  return townNameToSlugMap.get(townName.toLowerCase());
}

export const TOWN_NAMES = Array.from(townNameToSlugMap.keys()).map(key => {
  const slug = townNameToSlugMap.get(key)!;
  const town = townsData.find(t => t.slug === slug)!;
  return {
    name: town.name,
    slug: slug,
    state: town.state,
    stateAbbr: town.stateAbbr
  };
});
