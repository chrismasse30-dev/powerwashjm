import { useState, useEffect } from 'react';
import { Save, ImageIcon, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SeasonalCard {
  id: string;
  card_position: 'left' | 'right';
  title: string;
  subtitle: string;
  description: string;
  link_url: string;
  image_url: string;
  bullet_point_1: string;
  bullet_point_2: string;
  bullet_point_3: string;
  is_active: boolean;
  border_color: string;
  gradient_from: string;
  gradient_to: string;
}

export default function SeasonalCardsConfig() {
  const [leftCard, setLeftCard] = useState<SeasonalCard | null>(null);
  const [rightCard, setRightCard] = useState<SeasonalCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seasonal_cards')
        .select('*')
        .order('card_position', { ascending: true });

      if (error) throw error;

      if (data) {
        setLeftCard(data.find(card => card.card_position === 'left') || null);
        setRightCard(data.find(card => card.card_position === 'right') || null);
      }
    } catch (error) {
      console.error('Error fetching seasonal cards:', error);
      alert('Failed to load seasonal cards');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (card: SeasonalCard) => {
    try {
      setSaving(card.card_position);

      const { error } = await supabase
        .from('seasonal_cards')
        .update({
          title: card.title,
          subtitle: card.subtitle,
          description: card.description,
          link_url: card.link_url,
          image_url: card.image_url,
          bullet_point_1: card.bullet_point_1,
          bullet_point_2: card.bullet_point_2,
          bullet_point_3: card.bullet_point_3,
          is_active: card.is_active,
          border_color: card.border_color,
          gradient_from: card.gradient_from,
          gradient_to: card.gradient_to,
          updated_at: new Date().toISOString()
        })
        .eq('id', card.id);

      if (error) throw error;

      alert(`${card.card_position === 'left' ? 'Left' : 'Right'} card saved successfully!`);
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card');
    } finally {
      setSaving(null);
    }
  };

  const updateCardField = (position: 'left' | 'right', field: keyof SeasonalCard, value: any) => {
    if (position === 'left' && leftCard) {
      setLeftCard({ ...leftCard, [field]: value });
    } else if (position === 'right' && rightCard) {
      setRightCard({ ...rightCard, [field]: value });
    }
  };

  const renderCardEditor = (card: SeasonalCard | null, position: 'left' | 'right') => {
    if (!card) return null;

    const isLeft = position === 'left';
    const title = isLeft ? 'Left Card (Power Washing)' : 'Right Card (Holiday Lights)';
    const bgColor = isLeft ? 'bg-blue-50' : 'bg-red-50';
    const borderColor = isLeft ? 'border-blue-200' : 'border-red-200';

    return (
      <div className={`${bgColor} border-2 ${borderColor} rounded-xl p-6 space-y-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={() => handleSaveCard(card)}
            disabled={saving === position}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {saving === position ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving === position ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Title
            </label>
            <input
              type="text"
              value={card.title}
              onChange={(e) => updateCardField(position, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Power Washing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <input
              type="text"
              value={card.link_url}
              onChange={(e) => updateCardField(position, 'link_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/house-washing"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Subtitle (shown at top)
          </label>
          <input
            type="text"
            value={card.subtitle}
            onChange={(e) => updateCardField(position, 'subtitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Power Washing & Holiday Lights"
          />
          <p className="text-xs text-gray-500 mt-1">Note: This subtitle is shared between both cards</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Description
          </label>
          <textarea
            value={card.description}
            onChange={(e) => updateCardField(position, 'description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Professional exterior cleaning services..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Card Image URL
          </label>
          <input
            type="text"
            value={card.image_url}
            onChange={(e) => updateCardField(position, 'image_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="/beforeandafter/housewashbeforeandafter.png"
          />
          {card.image_url && (
            <div className="mt-2">
              <img
                src={card.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Bullet Points (with checkmarks)
          </label>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Bullet Point 1</label>
            <input
              type="text"
              value={card.bullet_point_1}
              onChange={(e) => updateCardField(position, 'bullet_point_1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Vinyl & Cedar Siding Cleaning"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Bullet Point 2</label>
            <input
              type="text"
              value={card.bullet_point_2}
              onChange={(e) => updateCardField(position, 'bullet_point_2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Wood Restoration & Staining"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Bullet Point 3</label>
            <input
              type="text"
              value={card.bullet_point_3}
              onChange={(e) => updateCardField(position, 'bullet_point_3', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Can increase home value up to 10%"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Color
            </label>
            <select
              value={card.border_color}
              onChange={(e) => updateCardField(position, 'border_color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="border-blue-100">Blue</option>
              <option value="border-red-100">Red</option>
              <option value="border-green-100">Green</option>
              <option value="border-yellow-100">Yellow</option>
              <option value="border-purple-100">Purple</option>
              <option value="border-gray-100">Gray</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gradient From
            </label>
            <select
              value={card.gradient_from}
              onChange={(e) => updateCardField(position, 'gradient_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="from-blue-50">Blue</option>
              <option value="from-red-50">Red</option>
              <option value="from-green-50">Green</option>
              <option value="from-yellow-50">Yellow</option>
              <option value="from-purple-50">Purple</option>
              <option value="from-gray-50">Gray</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gradient To
            </label>
            <select
              value={card.gradient_to}
              onChange={(e) => updateCardField(position, 'gradient_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="to-white">White</option>
              <option value="to-blue-50">Blue</option>
              <option value="to-red-50">Red</option>
              <option value="to-green-50">Green</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`active-${position}`}
            checked={card.is_active}
            onChange={(e) => updateCardField(position, 'is_active', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`active-${position}`} className="text-sm font-medium text-gray-700">
            Card is active (visible on homepage)
          </label>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ready for Every Season Cards</h2>
          <p className="text-sm text-gray-600 mt-1">
            Edit the two seasonal cards displayed on the homepage
          </p>
        </div>
        <button
          onClick={fetchCards}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCardEditor(leftCard, 'left')}
        {renderCardEditor(rightCard, 'right')}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Tips for Seasonal Updates:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Update images and text based on the current season</li>
          <li>Change the left card for spring/summer services (power washing, deck cleaning, etc.)</li>
          <li>Change the right card for fall/winter services (holiday lights, gutter cleaning, etc.)</li>
          <li>Make sure image URLs are relative paths (e.g., /beforeandafter/image.png)</li>
          <li>Both cards share the same subtitle at the top of the section</li>
        </ul>
      </div>
    </div>
  );
}
