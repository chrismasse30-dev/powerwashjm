import { useState, useEffect } from 'react';
import { Code, Check, AlertCircle, Eye } from 'lucide-react';
import { generateAllSchemas, validateSchema } from '../utils/schemaGenerator';

interface SchemaGeneratorProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author_name: string;
    featured_image_url: string;
    published_at: string;
    updated_at: string;
  };
  onSchemaGenerated: (schema: any) => void;
}

export default function SchemaGenerator({ post, onSchemaGenerated }: SchemaGeneratorProps) {
  const [schema, setSchema] = useState<any>(null);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    generateSchema();
  }, [post]);

  const generateSchema = () => {
    const generated = generateAllSchemas(post);
    setSchema(generated);

    const val = Array.isArray(generated)
      ? validateSchema(generated[0])
      : validateSchema(generated);

    setValidation(val);
    onSchemaGenerated(generated);
  };

  const getSchemaTypes = (): string[] => {
    if (!schema) return [];

    if (Array.isArray(schema)) {
      return schema.map(s => s['@type']);
    }

    return [schema['@type']];
  };

  const schemaTypes = getSchemaTypes();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Schema Markup</h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} JSON
        </button>
      </div>

      {validation && (
        <div className={`mb-4 p-3 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {validation.valid ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Schema Valid</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Schema Issues</span>
              </>
            )}
          </div>

          {validation.errors.length > 0 && (
            <ul className="text-sm text-red-700 space-y-1 ml-7">
              {validation.errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Detected Schema Types:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {schemaTypes.map((type, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {showPreview && schema && (
        <div className="mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-xs font-mono text-gray-800">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            This JSON-LD will be automatically injected into the page head when published
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">Schema Benefits:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Rich snippets in search results</li>
          <li>✓ Better click-through rates</li>
          <li>✓ Enhanced search visibility</li>
          <li>✓ Voice search optimization</li>
        </ul>
      </div>

      <button
        onClick={generateSchema}
        className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
      >
        Regenerate Schema
      </button>
    </div>
  );
}
