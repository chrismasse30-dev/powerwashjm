import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, ChevronRight, Loader2, Pencil, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^christmas light installation in .+ - project \d+$/i,
  /^holiday lighting design concept \d+$/i,
  /^img[\s_-]?\d+/i,
  /^dsc[\s_-]?\d+/i,
  /^\d{9,}[-_]/,
  /\.(jpe?g|png|heic|webp)$/i,
];

export function isPlaceholderAlt(text?: string | null): boolean {
  const t = (text || '').trim();
  if (!t) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(t));
}

const CHIP_GROUPS: { label: string; chips: string[] }[] = [
  {
    label: 'Where on the house',
    chips: ['roofline', 'peaks and gables', 'porch columns', 'front entry', 'garage trim', 'walkway', 'shrubs', 'trees', 'fence line', 'second story', 'dormers'],
  },
  {
    label: 'Lighting',
    chips: ['warm white C9 bulbs', 'cool white C9 bulbs', 'multicolor C9 bulbs', 'mini lights', 'wrapped trunks', 'pathway stakes', 'lighted wreath', 'garland with red bows', 'net lighting', 'illuminated address numbers'],
  },
  {
    label: 'Property',
    chips: ['colonial', 'cape', 'ranch', 'Victorian', 'split level', 'brick front', 'stone accents', 'commercial storefront', 'snow on the ground', 'dusk'],
  },
];

const MAX_LEN = 125;

interface AltTextEditorProps {
  photoId: string;
  value: string;
  onSaved: (id: string, next: string) => void;
}

export default function AltTextEditor({ photoId, value, onSaved }: AltTextEditorProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(false);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const generic = isPlaceholderAlt(value);

  useEffect(() => {
    setText(value || '');
  }, [value, photoId]);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 336;
    const H = 360;
    let left = r.left + r.width / 2 - W / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
    let top = r.bottom + 6;
    if (top + H > window.innerHeight - 8) top = Math.max(8, r.top - H - 6);
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const handler = () => place();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const a = areaRef.current;
      if (!a) return;
      a.focus();
      a.setSelectionRange(a.value.length, a.value.length);
    }, 20);
    return () => window.clearTimeout(t);
  }, [open]);

  function openNext() {
    const all = Array.from(document.querySelectorAll('[data-alt-trigger]')) as HTMLButtonElement[];
    const i = all.indexOf(triggerRef.current as HTMLButtonElement);
    const next = all[i + 1];
    if (!next) return;
    next.scrollIntoView({ block: 'center', behavior: 'smooth' });
    window.setTimeout(() => next.click(), 320);
  }

  async function save(thenNext: boolean) {
    const next = text.replace(/\s+/g, ' ').trim();
    if (!next) {
      setError('Alt text cannot be empty.');
      return;
    }
    if (next === (value || '')) {
      setOpen(false);
      if (thenNext) openNext();
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { error: dbError } = await supabase
        .from('holiday_gallery_photos')
        .update({ title: next })
        .eq('id', photoId);
      if (dbError) throw dbError;
      onSaved(photoId, next);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1600);
      setOpen(false);
      if (thenNext) openNext();
    } catch (err: any) {
      setError((err && err.message) || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function addChip(chip: string) {
    setText((prev) => {
      const base = prev.trim();
      if (!base) return chip.charAt(0).toUpperCase() + chip.slice(1);
      if (base.toLowerCase().indexOf(chip.toLowerCase()) > -1) return base;
      return base.replace(/[,;.\s]+$/, '') + ', ' + chip;
    });
    const a = areaRef.current;
    if (a) window.setTimeout(() => a.focus(), 0);
  }

  const len = text.trim().length;

  const panel = (
    <>
      <div
        className="fixed inset-0 z-[70]"
        onMouseDown={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
      />
      <div
        className="fixed z-[71] bg-white rounded-lg shadow-2xl border border-gray-200 p-3"
        style={{ top: pos.top, left: pos.left, width: 336 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-800">Alt text and caption</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          ref={areaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape') {
              e.preventDefault();
              setOpen(false);
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              save(e.shiftKey);
            }
          }}
          rows={3}
          placeholder="Describe what is actually in the photo, for example: Warm white C9 bulbs along the roofline and wrapped porch columns of a white colonial at dusk"
          className="w-full text-sm text-gray-900 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="flex items-center justify-between mt-1">
          <span className={'text-[11px] ' + (len > MAX_LEN ? 'text-amber-600 font-medium' : 'text-gray-400')}>
            {len} / {MAX_LEN} characters
          </span>
          {isPlaceholderAlt(text) ? (
            <span className="text-[11px] text-amber-600 font-medium">Currently generic</span>
          ) : (
            <span className="text-[11px] text-green-600 font-medium">Descriptive</span>
          )}
        </div>

        <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {CHIP_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">{group.label}</div>
              <div className="flex flex-wrap gap-1">
                {group.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => addChip(chip)}
                    className="text-[11px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error ? <div className="mt-2 text-[11px] text-red-600">{error}</div> : null}

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded px-2 py-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Save
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            title="Save and jump to the next photo"
            className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1.5 disabled:opacity-50"
          >
            Save and next
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="text-[10px] text-gray-400 mt-1.5 leading-snug">
          Ctrl+Enter saves. Shift+Ctrl+Enter saves and opens the next photo. This updates the caption and the image alt attribute only, never the stored file name.
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-alt-trigger=""
        title={value || 'No alt text yet'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          'w-full text-left text-xs leading-snug rounded px-1.5 py-1 border flex items-start gap-1 transition-colors ' +
          (generic
            ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
            : 'border-transparent hover:border-gray-300 hover:bg-gray-50 text-gray-700')
        }
      >
        {flash ? (
          <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
        ) : generic ? (
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
        ) : (
          <Pencil className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-40" />
        )}
        <span className="truncate font-medium">{value || 'Add alt text'}</span>
      </button>
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
