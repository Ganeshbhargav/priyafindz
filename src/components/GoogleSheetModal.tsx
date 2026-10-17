import React, { useState } from 'react';
import type { CatalogMetadata, Product } from '../types/catalog.ts';
import { REQUIRED_COLUMNS } from '../utils/catalogLogic.ts';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  HelpCircle,
  Database
} from 'lucide-react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: CatalogMetadata;
  onConnect: (sheetUrl: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    details?: string[];
    metadata?: CatalogMetadata;
    previewProducts?: Product[];
  }>;
  onResetDemo: () => Promise<void>;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onConnect,
  onResetDemo
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });
  const [copiedHeaders, setCopiedHeaders] = useState(false);

  if (!isOpen) return null;

  const handleCopyHeaders = () => {
    navigator.clipboard.writeText(REQUIRED_COLUMNS.join(', '));
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;

    setIsSubmitting(true);
    setFeedback({ type: null, message: '' });

    const result = await onConnect(sheetUrl.trim());
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.message || 'Connected successfully to your Google Sheet catalog!'
      });
      setSheetUrl('');
    } else {
      setFeedback({
        type: 'error',
        message: result.error || 'Failed to connect Google Sheet',
        details: result.details
      });
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    await onResetDemo();
    setIsSubmitting(false);
    setFeedback({
      type: 'success',
      message: 'Switched back to curated PriyaFindz demo catalog.'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFF9F4] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E9B8BD]/60 flex flex-col relative text-[#2D1E1F]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#F0E4DC] sticky top-0 bg-[#FFF9F4]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9B8BD]/30 border border-[#E9B8BD] flex items-center justify-center text-[#743D4A]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="sheet-modal-title" className="font-serif text-xl font-bold text-[#743D4A]">
                Google Sheets Catalog Source
              </h2>
              <p className="text-xs text-stone-500">
                Single source of truth for your PriyaFindz storefront
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-[#2D1E1F] rounded-full hover:bg-[#F5EBE6] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Current Status Box */}
          <div className="bg-white rounded-2xl p-4 border border-[#F0E4DC] shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#743D4A]">
                Current Storefront Catalog Source
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                metadata.source === 'google_sheet'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {metadata.source === 'google_sheet' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Google Sheet Connected</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Curated Demo Catalog Active</span>
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <p>
                <span className="font-semibold text-[#2D1E1F]">Products Loaded:</span> {metadata.itemCount} items
              </p>
              <p>
                <span className="font-semibold text-[#2D1E1F]">Last Synced:</span> {new Date(metadata.lastSyncedAt).toLocaleString('en-IN')}
              </p>
              {metadata.sheetUrl && (
                <p className="truncate">
                  <span className="font-semibold text-[#2D1E1F]">Sheet URL:</span> {metadata.sheetUrl}
                </p>
              )}
            </div>

            {metadata.source === 'google_sheet' && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="mt-3 text-xs font-semibold text-[#743D4A] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Switch back to PriyaFindz Demo Catalog</span>
              </button>
            )}
          </div>

          {/* Connect Google Sheet Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E4DC] shadow-xs space-y-3">
            <label htmlFor="sheet-url-input" className="block text-sm font-bold text-[#743D4A]">
              Connect Your Google Sheet
            </label>
            <p className="text-xs text-stone-500">
              Paste the shareable link of your Google Sheet (set to "Anyone with the link can view") or published CSV link.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="sheet-url-input"
                type="url"
                required
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="flex-1 bg-[#FFF9F4] border border-[#E9B8BD] focus:border-[#743D4A] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-[#2D1E1F]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !sheetUrl.trim()}
                className="bg-[#743D4A] hover:bg-[#5E2F3B] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Test & Connect</span>
                  </>
                )}
              </button>
            </div>

            {/* Feedback alert */}
            {feedback.message && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{feedback.message}</p>
                  {feedback.details && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                      {feedback.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Required Schema Specification */}
          <div className="bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-[#F0E4DC]">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#743D4A]">
                Required 13 Column Headers
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyHeaders}
                  className="text-[11px] font-semibold text-[#743D4A] bg-white hover:bg-[#F5EBE6] px-2.5 py-1 rounded-lg border border-[#F0E4DC] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedHeaders ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHeaders ? 'Copied' : 'Copy Headers'}</span>
                </button>
                <a
                  href="/api/catalog/template.csv"
                  download="priyafindz_catalog_template.csv"
                  className="text-[11px] font-semibold text-[#743D4A] bg-white hover:bg-[#F5EBE6] px-2.5 py-1 rounded-lg border border-[#F0E4DC] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sample CSV</span>
                </a>
              </div>
            </div>

            <p className="text-xs text-stone-600 mb-3">
              Row 1 of your spreadsheet must match these column names exactly:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_COLUMNS.map((col) => (
                <span
                  key={col}
                  className="bg-white border border-[#E9B8BD] text-[#743D4A] font-mono text-[11px] px-2 py-0.5 rounded-md"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Setup Guide */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E4DC]">
            <h4 className="text-xs font-bold text-[#743D4A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>3-Step Quick Setup Instructions</span>
            </h4>
            <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                <span className="font-semibold text-[#2D1E1F]">Create or clone sheet:</span> Click <strong>Download Sample CSV</strong> above and import it into Google Sheets.
              </li>
              <li>
                <span className="font-semibold text-[#2D1E1F]">Set Permissions:</span> In Google Sheets, click the blue <strong>Share</strong> button at the top right, set General access to <strong>"Anyone with the link can view"</strong>.
              </li>
              <li>
                <span className="font-semibold text-[#2D1E1F]">Paste & Connect:</span> Copy the browser URL and paste it into the field above. Our server validates all 13 columns before switching the storefront.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
