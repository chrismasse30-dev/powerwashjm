import { useEffect, useState } from 'react';
import { BookOpen, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { analyzeReadability, getReadabilityGrade, type ReadabilityAnalysis } from '../utils/readabilityAnalyzer';

interface ReadabilityOptimizerProps {
  content: string;
}

export default function ReadabilityOptimizer({ content }: ReadabilityOptimizerProps) {
  const [analysis, setAnalysis] = useState<ReadabilityAnalysis | null>(null);

  useEffect(() => {
    if (content && content.length > 50) {
      const result = analyzeReadability(content);
      setAnalysis(result);
    }
  }, [content]);

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-lg text-gray-500">Readability Analysis</h3>
        </div>
        <p className="text-sm text-gray-500">Write some content to see readability analysis...</p>
      </div>
    );
  }

  const grade = getReadabilityGrade(analysis.score);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">Readability</h3>
        </div>
        <div className={`text-3xl font-bold ${grade.color}`}>
          {grade.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Flesch Score</p>
          <p className="text-2xl font-bold text-gray-900">{analysis.fleschScore}</p>
          <p className="text-xs text-gray-500">{analysis.readingDifficulty}</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Grade Level</p>
          <p className="text-2xl font-bold text-gray-900">{analysis.gradeLevel}</p>
          <p className="text-xs text-gray-500">Reading level</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Word Count</p>
          <p className="text-2xl font-bold text-gray-900">{analysis.statistics.wordCount}</p>
          <p className="text-xs text-gray-500">{analysis.statistics.sentenceCount} sentences</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-gray-600" />
            <p className="text-xs text-gray-600">Read Time</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analysis.readingTime}</p>
          <p className="text-xs text-gray-500">minutes</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Issues Found:</h4>
        <div className="space-y-2">
          {analysis.issues.longSentences > 0 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {analysis.issues.longSentences} long sentences
                </p>
                <p className="text-xs text-yellow-700">Break sentences over 20 words into shorter ones</p>
              </div>
            </div>
          )}

          {analysis.issues.complexWords > 0 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {analysis.issues.complexWords} complex words
                </p>
                <p className="text-xs text-yellow-700">Consider simpler alternatives where possible</p>
              </div>
            </div>
          )}

          {analysis.issues.passiveVoice > 0 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {analysis.issues.passiveVoice} passive voice instances
                </p>
                <p className="text-xs text-yellow-700">Use active voice for more engaging content</p>
              </div>
            </div>
          )}

          {analysis.issues.adverbs > 0 && analysis.issues.adverbs > analysis.statistics.sentenceCount * 0.3 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {analysis.issues.adverbs} adverbs detected
                </p>
                <p className="text-xs text-yellow-700">Replace with stronger verbs when possible</p>
              </div>
            </div>
          )}

          {analysis.issues.longSentences === 0 &&
           analysis.issues.complexWords === 0 &&
           analysis.issues.passiveVoice === 0 && (
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">
                Great! No major readability issues found.
              </p>
            </div>
          )}
        </div>
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">Suggestions:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            {analysis.suggestions.slice(0, 3).map((suggestion, i) => (
              <li key={i}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-xs text-gray-600 mb-2">Reading Level Guide:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">90-100:</span> <span className="text-gray-600">5th grade</span>
          </div>
          <div>
            <span className="font-medium">60-70:</span> <span className="text-gray-600">8th-9th grade</span>
          </div>
          <div>
            <span className="font-medium">80-90:</span> <span className="text-gray-600">6th grade</span>
          </div>
          <div>
            <span className="font-medium">50-60:</span> <span className="text-gray-600">10th-12th grade</span>
          </div>
        </div>
      </div>
    </div>
  );
}
