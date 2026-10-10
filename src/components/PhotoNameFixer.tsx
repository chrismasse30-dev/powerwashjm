import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wand2, RefreshCw, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PhotoRow {
  id: string;
  title: string | null;
  image_url: string;
  display_order: number | null;
  uploaded_at: string | null;
}

interface Proposal {
  id: string;
  image_url: string;
  oldTitle: string;
  newTitle: string;
}

// Titles that already follow the site convention are left alone.
const PROJECT_RE = /^Christmas light installation in .+ - project (\d+)$/i;
const CONCEPT_RE = /^Holiday lighting design concept (\d+)$/i;

// Town-neutral by design.
const REGION = 'Rhode Island';

function isStandardTitle(title: string | null): boolean {
  const t = (title ?? '').trim();
  return PROJECT_RE.test(t) || CONCEPT_RE.test(t);
}

export default function PhotoNameFixer({ onApplied }: { onApplied?: () => void }) {
  const [rows, setRows] = useState<PhotoRow[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from('holiday_gallery_photos')
        .select('id, title, image_url, display_order, uploaded_at')
        .order('display_order', { ascending: true });
      if (error) throw error;

      const all = (data ?? []) as PhotoRow[];
      setRows(all);

      let maxProject = 0;
      all.forEach((r) => {
        const m = (r.title ?? '').trim().match(PROJECT_RE);
        if (m) maxProject = Math.max(maxProject, parseInt(m[1], 10));
      });

      const needsFix = all
        .filter((r) => !isStandardTitle(r.title))
        .sort((a, b) => {
          const ta = a.uploaded_at ?? '';
          const tb = b.uploaded_at ?? '';
          if (ta !== tb) return ta < tb ? -1 : 1;
          return a.id < b.id ? -1 : 1;
        });

      let n = maxProject;
      setProposals(
        needsFix.map((r) => {
          n += 1;
          return {
            id: r.id,
            image_url: r.image_url,
            oldTitle: (r.title ?? '').trim() || '(no title)',
            newTitle: `Christmas light installation in ${REGION} - project ${n}`,
          };
        })
      );
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProposal = (id: string, value: string) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, newTitle: value } : p)));
  };

  const apply = async () => {
    const toApply = proposals.filter((p) => p.newTitle.trim().length > 0);
    if (!toApply.length) return;

    setApplying(true);
    setProgress(0);
    setMessage(null);

    let done = 0;
    let failed = 0;

    try {
      const CHUNK = 5;
      for (let i = 0; i < toApply.length; i += CHUNK) {
        const batch = toApply.slice(i, i + CHUNK);
        const results = await Promise.all(
          batch.map((p) =>
            supabase
              .from('holiday_gallery_photos')
              .update({ title: p.newTitle.trim() })
              .eq('id', p.id)
          )
        );
        results.forEach((r) => {
          if (r.error) failed += 1;
        });
        done += batch.length;
        setProgress(done);
      }

      setMessage(
        failed
          ? { type: 'error', text: `Updated ${done - failed} of ${toApply.length}. ${failed} failed.` }
          : { type: 'success', text: `Renamed ${done} photo${done === 1 ? '' : 's'}.` }
      );

      await load();
      onApplied?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? String(err) });
    } finally {
      setApplying(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: rows.length,
      standard: rows.filter((r) => isStandardTitle(r.title)).length,
      needsFix: proposals.length,
    }),
    [rows, proposals]
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-green-600" />
            Photo Name Cleanup
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Rewrites captions and alt text that still show raw camera names. Storage
            filenames are not changed.
          </p>
          <p className="text-sm mt-2">
            <span className="text-gray-700">{summary.total} photos</span>
            {' • '}
            <span className="text-green-600">{summary.standard} already named</span>
            {' • '}
            <span className={summary.needsFix ? 'text-orange-600 font-semibold' : 'text-gray-500'}>
              {summary.needsFix} need fixing
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading || applying}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={apply}
            disabled={applying || loading || summary.needsFix === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {applying
              ? `Applying ${progress}/${summary.needsFix}...`
              : `Apply ${summary.needsFix} Name${summary.needsFix === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {summary.needsFix > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide preview' : 'Preview changes'}
          </button>

          {expanded && (
            <div className="mt-3 border border-gray-200 rounded-lg divide-y max-h-96 overflow-y-auto">
              {proposals.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-14 h-14 object-cover rounded shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 truncate">was: {p.oldTitle}</div>
                    <input
                      type="text"
                      value={p.newTitle}
                      onChange={(e) => updateProposal(p.id, e.target.value)}
                      className="mt-1 w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Tip: you can edit any name above before applying. A real description is
            better for screen readers and image search than a project number.
          </p>
        </>
      )}
    </div>
  );
}
