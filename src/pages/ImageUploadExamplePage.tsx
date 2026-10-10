import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import { imageUploadService } from '../services/imageUploadService';

export default function ImageUploadExamplePage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleHolidayGalleryUpload = async (urls: string[]) => {
    try {
      setMessage({ type: 'success', text: `Uploaded ${urls.length} image(s) to Holiday Gallery!` });
      console.log('Holiday gallery URLs:', urls);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleFleetPhotoUpload = async (urls: string[]) => {
    try {
      setMessage({ type: 'success', text: `Uploaded ${urls.length} fleet photo(s)!` });
      console.log('Fleet photo URLs:', urls);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleQuoteImageUpload = async (urls: string[]) => {
    try {
      setMessage({ type: 'success', text: `Uploaded ${urls.length} estimate image(s)!` });
      console.log('Estimate image URLs:', urls);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUploadWithMetadata = async (file: File) => {
    const result = await imageUploadService.uploadToHolidayGallery(file, {
      title: 'Beautiful Holiday Display',
      description: 'Custom holiday lighting installation',
      is_featured: true,
      display_order: 0
    });

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Uploaded to gallery with ID: ${result.photo?.id}`
      });
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Upload failed'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Image Upload Examples
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-12">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Holiday Gallery Upload
            </h2>
            <p className="text-gray-600 mb-4">
              Upload images to the holiday gallery. URLs are automatically stored in the
              holiday_gallery_photos table.
            </p>
            <ImageUploader
              bucket="holiday-gallery"
              multiple={true}
              maxFiles={10}
              onUploadComplete={handleHolidayGalleryUpload}
              onError={(error) => setMessage({ type: 'error', text: error })}
              label="Upload Holiday Gallery Images"
            />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Fleet Photos Upload
            </h2>
            <p className="text-gray-600 mb-4">
              Upload vehicle photos. URLs are automatically stored in the fleet_photos table.
            </p>
            <ImageUploader
              bucket="fleet-photos"
              multiple={true}
              maxFiles={5}
              onUploadComplete={handleFleetPhotoUpload}
              onError={(error) => setMessage({ type: 'error', text: error })}
              label="Upload Fleet Photos"
            />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Estimate Images Upload
            </h2>
            <p className="text-gray-600 mb-4">
              Upload property or estimate images. These will be linked to quote submissions.
            </p>
            <ImageUploader
              bucket="estimate-images"
              multiple={false}
              maxFiles={1}
              onUploadComplete={handleQuoteImageUpload}
              onError={(error) => setMessage({ type: 'error', text: error })}
              label="Upload Estimate Image"
            />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Code Examples
            </h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">
                Upload to Holiday Gallery with Metadata:
              </h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`const result = await imageUploadService.uploadToHolidayGallery(file, {
  title: 'Beautiful Display',
  description: 'Custom installation',
  is_featured: true,
  display_order: 0
});

// Result includes: { success, photo, error }
// photo.id, photo.image_url automatically saved`}
              </pre>

              <h3 className="font-medium text-gray-900 mb-2 mt-4">
                Upload Fleet Photo:
              </h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`const result = await imageUploadService.uploadFleetPhoto(file, {
  vehicle_name: 'Truck #3',
  description: 'Work vehicle',
  display_order: 2
});`}
              </pre>

              <h3 className="font-medium text-gray-900 mb-2 mt-4">
                Link Image to Quote Submission:
              </h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`const result = await imageUploadService.uploadEstimateImage(
  file,
  quoteSubmissionId
);

// Automatically updates quote_submissions.estimate_image_url`}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
