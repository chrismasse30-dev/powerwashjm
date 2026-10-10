import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { popupConfigSchema } from '../../utils/popupValidation';
import { usePopupConfig } from '../../hooks/usePopupConfig';
import type { PopupFormData } from '../../types/popup';

interface PopupConfigFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function PopupConfigForm({ formData, setFormData }: PopupConfigFormProps) {
  const { activeConfig, createConfig, updateConfig, activateConfig, isCreating, isUpdating, error } = usePopupConfig();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PopupFormData>({
    resolver: zodResolver(popupConfigSchema),
    defaultValues: {
      enabled: false,
      subheading: '',
      title: '',
      body: '',
      image_url: '',
      button_text: '',
      button_link: '',
      dismissal_text: 'Maybe later',
      start_date: '',
      end_date: '',
      reappear_hours: 24,
    },
  });

  useEffect(() => {
    if (formData) {
      reset(formData);
    } else if (activeConfig) {
      reset({
        enabled: activeConfig.enabled,
        subheading: activeConfig.subheading || '',
        title: activeConfig.title,
        body: activeConfig.body,
        image_url: activeConfig.image_url || '',
        button_text: activeConfig.button_text,
        button_link: activeConfig.button_link,
        dismissal_text: activeConfig.dismissal_text || 'Maybe later',
        start_date: activeConfig.start_date || '',
        end_date: activeConfig.end_date || '',
        reappear_hours: activeConfig.reappear_hours || 24,
      });
    }
  }, [activeConfig, formData, reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      setFormData(value as PopupFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  const onSubmit = async (data: PopupFormData) => {
    console.log('Form submitted with data:', data);

    try {
      if (activeConfig) {
        console.log('Updating existing config:', activeConfig.id);
        const updated = await updateConfig(activeConfig.id, data);
        console.log('Config updated, enabled status:', data.enabled);

        if (data.enabled) {
          console.log('Attempting to activate config:', updated.id);
          await activateConfig(updated.id);
        }
      } else {
        console.log('Creating new config');
        const created = await createConfig(data);

        if (data.enabled) {
          await activateConfig(created.id);
        }
      }
      console.log('Save successful!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const enabled = watch('enabled');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Live Configuration</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Configuration saved and activated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-lg font-bold text-blue-800">Popup Enabled</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('enabled')}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              {...register('start_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              {...register('end_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="reappear_hours" className="block text-sm font-medium text-gray-700 mb-1">
              Reappear Timer <span className="text-red-500">*</span>
            </label>
            <select
              id="reappear_hours"
              {...register('reappear_hours', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                <option key={hour} value={hour}>
                  {hour} {hour === 1 ? 'Hour' : 'Hours'}
                </option>
              ))}
            </select>
            {errors.reappear_hours && (
              <p className="mt-1 text-sm text-red-600">{errors.reappear_hours.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Popup won't show again for this many hours after being closed
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="subheading" className="block text-sm font-medium text-gray-700 mb-1">
            Subheading (Optional)
          </label>
          <input
            type="text"
            id="subheading"
            {...register('subheading')}
            placeholder="e.g., Limited Time Offer!"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.subheading && (
            <p className="mt-1 text-sm text-red-600">{errors.subheading.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            placeholder="Holiday Lights Installation!"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
            Body Text <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            {...register('body')}
            rows={4}
            placeholder="Let us make your home sparkle this season..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.body && (
            <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            id="image_url"
            {...register('image_url')}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.image_url && (
            <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-1">
              Button Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="button_text"
              {...register('button_text')}
              placeholder="Get Free Quote"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.button_text && (
              <p className="mt-1 text-sm text-red-600">{errors.button_text.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="button_link" className="block text-sm font-medium text-gray-700 mb-1">
              Button Link <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="button_link"
              {...register('button_link')}
              placeholder="/get-quote"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.button_link && (
              <p className="mt-1 text-sm text-red-600">{errors.button_link.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="dismissal_text" className="block text-sm font-medium text-gray-700 mb-1">
            Dismissal Link Text
          </label>
          <input
            type="text"
            id="dismissal_text"
            {...register('dismissal_text')}
            placeholder="Maybe later"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.dismissal_text && (
            <p className="mt-1 text-sm text-red-600">{errors.dismissal_text.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Small "no-thanks" link shown under the main button. Makes users feel in control and paradoxically increases engagement.
          </p>
        </div>

        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isCreating || isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {enabled ? 'Save & Activate' : 'Save Configuration'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
