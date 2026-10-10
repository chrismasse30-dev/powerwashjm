/**
 * Automatic Blog Post Formatter
 *
 * Applies consistent formatting rules to blog content:
 * - Converts plain text sections to proper HTML structure
 * - Creates H2/H3 headings from title patterns
 * - Wraps paragraphs in <p> tags
 * - Converts list items to <ul>/<li> structure
 * - Adds bold emphasis to key phrases
 * - Ensures short, scannable paragraphs
 */

interface FormattingRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
}

export function autoFormatBlogContent(rawContent: string): string {
  // Safety check: ensure content is a string
  if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length === 0) {
    return rawContent || '';
  }

  let content = rawContent.trim();

  if (isAlreadyFormatted(content)) {
    return content;
  }

  try {
    content = normalizeLineBreaks(content);
    content = formatHeadings(content);
    content = formatLists(content);
    content = formatParagraphs(content);
    content = addBoldEmphasis(content);

    return content;
  } catch (error) {
    console.error('Error in autoFormatBlogContent:', error);
    return rawContent;
  }
}

function isAlreadyFormatted(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const hasH2 = /<h2>/i.test(content);
  const hasUL = /<ul>/i.test(content);
  const hasParagraphs = /<p>/i.test(content);

  return hasH2 && hasUL && hasParagraphs;
}

function normalizeLineBreaks(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function formatHeadings(content: string): string {
  const lines = content.split('\n');
  const formatted: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      formatted.push('');
      continue;
    }

    if (isH2Heading(line)) {
      formatted.push(`<h2>${cleanHeadingText(line)}</h2>`);
    } else if (isH3Heading(line, lines[i - 1])) {
      formatted.push(`<h3>${cleanHeadingText(line)}</h3>`);
    } else {
      formatted.push(line);
    }
  }

  return formatted.join('\n');
}

function isH2Heading(line: string): boolean {
  if (line.endsWith(':') && line.length < 80 && !line.includes('.')) {
    return true;
  }

  const h2Patterns = [
    /^(Spring|Summer|Fall|Winter|How Often|Ready to|What About|Why Choose|Our Process|Benefits of)/i,
    /\((January|February|March|April|May|June|July|August|September|October|November|December)/i
  ];

  return h2Patterns.some(pattern => pattern.test(line)) && line.length < 100;
}

function isH3Heading(line: string, previousLine?: string): boolean {
  if (!line || line.length > 100) return false;

  const h3Indicators = [
    /^(Why|Benefits|Tips|Steps|How to|What to)/i,
    line.endsWith(':') && previousLine && previousLine.includes('<h2>')
  ];

  return h3Indicators.some(indicator =>
    typeof indicator === 'boolean' ? indicator : indicator.test(line)
  );
}

function cleanHeadingText(text: string): string {
  return text.replace(/^#+\s*/, '').replace(/:$/, '').trim();
}

function formatLists(content: string): string {
  const lines = content.split('\n');
  const formatted: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isListItem = /^[-•*]\s+/.test(line) || /^\d+\.\s+/.test(line);

    if (isListItem) {
      if (!inList) {
        formatted.push('<ul>');
        inList = true;
      }

      const itemText = line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '');
      const formattedItem = formatListItem(itemText);
      formatted.push(`  <li>${formattedItem}</li>`);
    } else {
      if (inList) {
        formatted.push('</ul>');
        inList = false;
      }
      formatted.push(line);
    }
  }

  if (inList) {
    formatted.push('</ul>');
  }

  return formatted.join('\n');
}

function formatListItem(text: string): string {
  const colonIndex = text.indexOf(':');

  if (colonIndex > 0 && colonIndex < 50) {
    const label = text.substring(0, colonIndex);
    const description = text.substring(colonIndex + 1).trim();
    return `<strong>${label}:</strong> ${description}`;
  }

  return text;
}

function formatParagraphs(content: string): string {
  const lines = content.split('\n');
  const formatted: string[] = [];
  let paragraphBuffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (paragraphBuffer.length > 0) {
        formatted.push(wrapParagraph(paragraphBuffer.join(' ')));
        paragraphBuffer = [];
      }
      formatted.push('');
    } else if (trimmed.startsWith('<')) {
      if (paragraphBuffer.length > 0) {
        formatted.push(wrapParagraph(paragraphBuffer.join(' ')));
        paragraphBuffer = [];
      }
      formatted.push(trimmed);
    } else {
      paragraphBuffer.push(trimmed);
    }
  }

  if (paragraphBuffer.length > 0) {
    formatted.push(wrapParagraph(paragraphBuffer.join(' ')));
  }

  return formatted.join('\n\n');
}

function wrapParagraph(text: string): string {
  if (!text || text.trim().length === 0) return '';

  if (text.startsWith('<h') || text.startsWith('<ul') || text.startsWith('</ul')) {
    return text;
  }

  if (text.includes('<p>')) {
    return text;
  }

  return `<p>${text}</p>`;
}

function addBoldEmphasis(content: string): string {
  const emphasisPatterns: FormattingRule[] = [
    {
      pattern: /\*\*([^*]+)\*\*/g,
      replacement: '<strong>$1</strong>'
    },
    {
      pattern: /__([^_]+)__/g,
      replacement: '<strong>$1</strong>'
    }
  ];

  let result = content;

  for (const rule of emphasisPatterns) {
    result = result.replace(rule.pattern, rule.replacement as string);
  }

  return result;
}

export function generateExcerpt(content: string, maxLength: number = 200): string {
  // Safety check: ensure content is a string
  if (!content || typeof content !== 'string') {
    return '';
  }

  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

export function formatContentPreview(content: string): string {
  if (isAlreadyFormatted(content)) {
    return content;
  }

  return autoFormatBlogContent(content);
}
