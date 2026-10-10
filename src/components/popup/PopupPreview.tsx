import type { PopupConfig } from '../../types/popup';

interface PopupPreviewProps {
  config: PopupConfig | null;
}

export default function PopupPreview({ config }: PopupPreviewProps) {
  if (!config) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-xl font-bold text-white text-center mb-4">Website Preview</h2>
        <p className="text-gray-300 text-center text-sm mb-8">
          Configure a popup to see the preview
        </p>
        <div className="bg-white rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900">J&M Power Washing</h1>
          <p className="mt-4 text-lg text-gray-600">
            Family-owned and operated, serving Rhode Island and Massachusetts. Professional power washing
            not only boosts curb appeal but also reduces maintenance costs by removing harmful mold, mildew,
            and algae.
          </p>
          <button className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all">
            Get a Free Estimate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-8">
      <h2 className="text-xl font-bold text-white text-center mb-2">Website Preview</h2>
      <p className="text-gray-300 text-center text-sm mb-8">
        {config.enabled ? 'Popup will appear like this:' : 'Popup is currently disabled'}
      </p>

      {config.enabled ? (
        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
          <div className="absolute top-3 right-3 z-10">
            <button className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all">
              <span className="text-gray-800 text-xl font-bold">&times;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-8 bg-gray-50 flex flex-col justify-center">
              {config.subheading && (
                <span className="text-sm font-semibold text-red-600 mb-1">
                  {config.subheading}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {config.title}
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {config.body}
              </p>
              <div className="space-y-3">
                <a
                  href={config.button_link}
                  onClick={(e) => e.preventDefault()}
                  className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  {config.button_text}
                </a>
                {config.dismissal_text && (
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="block w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
                  >
                    {config.dismissal_text}
                  </button>
                )}
              </div>
            </div>

            {config.image_url && (
              <div className="relative h-48 md:h-auto">
                <img
                  src={config.image_url}
                  alt={config.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/e5e7eb/9ca3af?text=Image+Not+Found';
                  }}
                />
                <div className="hidden md:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-gray-50 to-transparent" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <p className="text-yellow-800 font-semibold">
            Popup is currently disabled. Enable it to see the preview.
          </p>
        </div>
      )}
    </div>
  );
}
