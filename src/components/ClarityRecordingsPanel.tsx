import { useState, useEffect } from 'react';
import {
  Play,
  Circle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  ExternalLink,
  Filter,
  Star,
  AlertCircle,
  ChevronRight,
  Zap,
  MousePointer
} from 'lucide-react';

interface ClarityRecording {
  id: string;
  timestamp: string;
  duration: number;
  entryPage: string;
  userLocation: string;
  device: 'PC' | 'Mobile' | 'Tablet';
  browser: string;
  isLive: boolean;
  userId: string;
  hasDeadClicks: boolean;
  hasRageClicks: boolean;
  hasErrors: boolean;
  pageViews: number;
}

interface ClarityRecordingsPanelProps {
  projectId: string;
}

export default function ClarityRecordingsPanel({ projectId }: ClarityRecordingsPanelProps) {
  const [recordings, setRecordings] = useState<ClarityRecording[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'favorite'>('all');
  const [selectedRecording, setSelectedRecording] = useState<ClarityRecording | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRecordings();
    const interval = setInterval(loadRecordings, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadRecordings = async () => {
    const mockRecordings: ClarityRecording[] = [
      {
        id: 'rec_001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        duration: 318,
        entryPage: '/website-analytics',
        userLocation: 'United States',
        device: 'PC',
        browser: 'Chrome',
        isLive: true,
        userId: 'fqsdwr',
        hasDeadClicks: false,
        hasRageClicks: false,
        hasErrors: false,
        pageViews: 5
      },
      {
        id: 'rec_002',
        timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        duration: 245,
        entryPage: '/employee-dashboard',
        userLocation: 'United States',
        device: 'PC',
        browser: 'Chrome',
        isLive: true,
        userId: 'qi82ti',
        hasDeadClicks: false,
        hasRageClicks: false,
        hasErrors: false,
        pageViews: 3
      },
      {
        id: 'rec_003',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        duration: 156,
        entryPage: '/employee-login',
        userLocation: 'United States',
        device: 'PC',
        browser: 'Chrome',
        isLive: true,
        userId: 'ckb1p4',
        hasDeadClicks: false,
        hasRageClicks: false,
        hasErrors: false,
        pageViews: 2
      },
      {
        id: 'rec_004',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        duration: 423,
        entryPage: '/',
        userLocation: 'United States',
        device: 'PC',
        browser: 'Chrome',
        isLive: true,
        userId: 'xyz789',
        hasDeadClicks: false,
        hasRageClicks: false,
        hasErrors: false,
        pageViews: 8
      },
      {
        id: 'rec_005',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        duration: 892,
        entryPage: '/house-washing',
        userLocation: 'United States',
        device: 'Mobile',
        browser: 'Safari',
        isLive: false,
        userId: 'mob123',
        hasDeadClicks: true,
        hasRageClicks: false,
        hasErrors: false,
        pageViews: 12
      },
      {
        id: 'rec_006',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        duration: 634,
        entryPage: '/holiday-lights',
        userLocation: 'United States',
        device: 'PC',
        browser: 'Edge',
        isLive: false,
        userId: 'user456',
        hasDeadClicks: true,
        hasRageClicks: true,
        hasErrors: false,
        pageViews: 9
      },
      {
        id: 'rec_007',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        duration: 234,
        entryPage: '/financing',
        userLocation: 'United States',
        device: 'Tablet',
        browser: 'Chrome',
        isLive: false,
        userId: 'tab789',
        hasDeadClicks: false,
        hasRageClicks: false,
        hasErrors: true,
        pageViews: 4
      }
    ];

    const filtered = mockRecordings.filter(rec => {
      if (filter === 'live') return rec.isLive;
      if (filter === 'favorite') return false;
      return true;
    });

    setRecordings(filtered);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const openRecordingInClarity = (recordingId: string) => {
    window.open(
      `https://clarity.microsoft.com/projects/view/${projectId}/recordings/${recordingId}`,
      '_blank',
      'width=1400,height=900'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Session Recordings</h3>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            All recordings
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'live'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <Circle className="w-3 h-3 fill-current" />
            Live recordings
          </button>
          <button
            onClick={() => setFilter('favorite')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'favorite'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <Star className="w-3 h-3" />
            Favorite recordings
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            onClick={() => setSelectedRecording(recording)}
            className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
              selectedRecording?.id === recording.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {recording.isLive && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                    <Circle className="w-2 h-2 fill-current animate-pulse" />
                    LIVE
                  </div>
                )}
                <span className="text-xs text-gray-500">{formatTime(recording.timestamp)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openRecordingInClarity(recording.id);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                Watch
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="mb-2">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Entry: {recording.entryPage}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">User ID:</span>
                  <span className="font-mono">{recording.userId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {recording.userLocation}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  {recording.device === 'PC' && <Monitor className="w-3 h-3" />}
                  {recording.device === 'Mobile' && <Smartphone className="w-3 h-3" />}
                  {recording.device === 'Tablet' && <Smartphone className="w-3 h-3" />}
                  {recording.device}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(recording.duration)}
                </div>
                <div>{recording.browser}</div>
                <div>{recording.pageViews} pages</div>
              </div>

              <div className="flex items-center gap-2">
                {recording.hasDeadClicks && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                    <MousePointer className="w-3 h-3" />
                    Dead clicks
                  </div>
                )}
                {recording.hasRageClicks && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                    <Zap className="w-3 h-3" />
                    Rage clicks
                  </div>
                )}
                {recording.hasErrors && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    <AlertCircle className="w-3 h-3" />
                    Errors
                  </div>
                )}
              </div>
            </div>

            {!recording.isLive && (
              <div className="mt-2 text-xs text-gray-500">
                {getTimeAgo(recording.timestamp)}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedRecording && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Selected Recording</h4>
            <button
              onClick={() => openRecordingInClarity(selectedRecording.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Watch Full Recording
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Session ID:</span>
                <span className="ml-2 font-mono text-gray-900">{selectedRecording.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 text-gray-900">{formatDuration(selectedRecording.duration)}</span>
              </div>
              <div>
                <span className="text-gray-600">Entry Page:</span>
                <span className="ml-2 text-gray-900">{selectedRecording.entryPage}</span>
              </div>
              <div>
                <span className="text-gray-600">Pages Viewed:</span>
                <span className="ml-2 text-gray-900">{selectedRecording.pageViews}</span>
              </div>
              <div>
                <span className="text-gray-600">Device:</span>
                <span className="ml-2 text-gray-900">{selectedRecording.device}</span>
              </div>
              <div>
                <span className="text-gray-600">Browser:</span>
                <span className="ml-2 text-gray-900">{selectedRecording.browser}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Click "Watch Full Recording" to open this session in a new window. The recording player shows
              mouse movements, clicks, scrolls, and navigation in real-time.
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 bg-gray-50 p-3 text-center">
        <button
          onClick={() => window.open(`https://clarity.microsoft.com/projects/view/${projectId}/recordings`, '_blank')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 mx-auto"
        >
          View All Recordings in Clarity Dashboard
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
