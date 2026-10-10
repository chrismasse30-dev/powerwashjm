/**
 * Readability Analyzer for Blog Content
 * Calculates Flesch Reading Ease, Grade Level, and provides actionable suggestions
 */

export interface ReadabilityAnalysis {
  fleschScore: number;
  gradeLevel: number;
  readingDifficulty: string;
  readingTime: number;
  statistics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    avgWordsPerSentence: number;
    avgSyllablesPerWord: number;
    complexWordCount: number;
  };
  issues: {
    longSentences: number;
    complexWords: number;
    passiveVoice: number;
    adverbs: number;
  };
  suggestions: string[];
  score: number;
}

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);

    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }

    previousWasVowel = isVowel;
  }

  if (word.endsWith('e')) {
    syllableCount--;
  }

  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    syllableCount++;
  }

  return Math.max(1, syllableCount);
}

function getSentences(text: string): string[] {
  return text
    .match(/[^.!?]+[.!?]+/g)
    ?.map(s => s.trim())
    .filter(s => s.length > 0) || [];
}

function getParagraphs(html: string): string[] {
  const paragraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || [];
  return paragraphs.map(p => stripHTML(p)).filter(p => p.length > 0);
}

function getReadingDifficulty(fleschScore: number): string {
  if (fleschScore >= 90) return 'Very Easy';
  if (fleschScore >= 80) return 'Easy';
  if (fleschScore >= 70) return 'Fairly Easy';
  if (fleschScore >= 60) return 'Standard';
  if (fleschScore >= 50) return 'Fairly Difficult';
  if (fleschScore >= 30) return 'Difficult';
  return 'Very Difficult';
}

function detectPassiveVoice(text: string): number {
  const passivePatterns = [
    /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi,
    /\b(am|is|are|was|were|be|been|being)\s+\w+en\b/gi
  ];

  let count = 0;
  for (const pattern of passivePatterns) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }

  return count;
}

function detectAdverbs(text: string): number {
  const adverbPattern = /\b\w+ly\b/gi;
  const matches = text.match(adverbPattern);
  return matches ? matches.length : 0;
}

function analyzeLongSentences(sentences: string[]): string[] {
  return sentences.filter(s => {
    const wordCount = s.split(/\s+/).length;
    return wordCount > 20;
  });
}

function analyzeComplexWords(words: string[]): string[] {
  return words.filter(word => {
    const syllables = countSyllables(word);
    return syllables > 3;
  });
}

export function analyzeReadability(content: string): ReadabilityAnalysis {
  const plainText = stripHTML(content);
  const sentences = getSentences(plainText);
  const words = plainText.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = getParagraphs(content);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  const fleschScore = Math.min(
    100,
    Math.max(
      0,
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
    )
  );

  const gradeLevel = Math.max(
    0,
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  );

  const longSentences = analyzeLongSentences(sentences);
  const complexWords = analyzeComplexWords(words);
  const passiveVoiceCount = detectPassiveVoice(plainText);
  const adverbCount = detectAdverbs(plainText);

  const readingTime = Math.ceil(wordCount / 200);

  const suggestions = generateSuggestions({
    fleschScore,
    gradeLevel,
    longSentences: longSentences.length,
    complexWords: complexWords.length,
    passiveVoice: passiveVoiceCount,
    adverbs: adverbCount,
    wordCount,
    sentenceCount,
    avgWordsPerSentence
  });

  let readabilityScorePoints = 0;
  if (fleschScore >= 60) readabilityScorePoints = 100;
  else if (fleschScore >= 50) readabilityScorePoints = 80;
  else if (fleschScore >= 40) readabilityScorePoints = 60;
  else if (fleschScore >= 30) readabilityScorePoints = 40;
  else readabilityScorePoints = 20;

  if (longSentences.length > sentenceCount * 0.2) readabilityScorePoints -= 10;
  if (passiveVoiceCount > sentenceCount * 0.1) readabilityScorePoints -= 10;

  return {
    fleschScore: Math.round(fleschScore),
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    readingDifficulty: getReadingDifficulty(fleschScore),
    readingTime,
    statistics: {
      wordCount,
      sentenceCount,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
      complexWordCount: complexWords.length
    },
    issues: {
      longSentences: longSentences.length,
      complexWords: complexWords.length,
      passiveVoice: passiveVoiceCount,
      adverbs: adverbCount
    },
    suggestions,
    score: Math.max(0, Math.min(100, readabilityScorePoints))
  };
}

function generateSuggestions(data: any): string[] {
  const suggestions: string[] = [];

  if (data.fleschScore < 60) {
    suggestions.push('Content is harder to read than recommended. Aim for a Flesch score of 60-70 for better engagement.');
  }

  if (data.gradeLevel > 10) {
    suggestions.push(`Reading level is Grade ${data.gradeLevel.toFixed(1)}. Consider simplifying language for broader audience (target: Grade 8-10).`);
  }

  if (data.longSentences > data.sentenceCount * 0.15) {
    suggestions.push(`${data.longSentences} sentences are too long (>20 words). Break them into shorter sentences for clarity.`);
  }

  if (data.complexWords > data.wordCount * 0.1) {
    suggestions.push(`${data.complexWords} complex words detected. Consider using simpler alternatives where possible.`);
  }

  if (data.passiveVoice > data.sentenceCount * 0.1) {
    suggestions.push(`${data.passiveVoice} instances of passive voice found. Use active voice for more engaging content.`);
  }

  if (data.adverbs > data.sentenceCount * 0.2) {
    suggestions.push(`${data.adverbs} adverbs detected. Many can be replaced with stronger verbs for more impactful writing.`);
  }

  if (data.avgWordsPerSentence > 25) {
    suggestions.push(`Average sentence length is ${data.avgWordsPerSentence.toFixed(1)} words. Aim for 15-20 words per sentence.`);
  }

  if (data.wordCount < 300) {
    suggestions.push('Content is quite short. Consider expanding to at least 500 words for better SEO performance.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Great job! Your content has excellent readability.');
  }

  return suggestions;
}

export function getReadabilityGrade(score: number): { color: string; label: string } {
  if (score >= 90) return { color: 'text-green-600', label: 'A+' };
  if (score >= 80) return { color: 'text-green-600', label: 'A' };
  if (score >= 70) return { color: 'text-blue-600', label: 'B' };
  if (score >= 60) return { color: 'text-yellow-600', label: 'C' };
  if (score >= 50) return { color: 'text-orange-600', label: 'D' };
  return { color: 'text-red-600', label: 'F' };
}
