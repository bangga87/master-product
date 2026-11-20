import { useState } from "react";
import { Check, Copy, FileJson } from "lucide-react";
import {
  buildPlaceholderMap,
  MASTER_PROMPT_TEMPLATE,
  VARIABLE_DEFINITIONS,
} from "../data/masterPrompt";
import type { EditorTabId, PosterVariables } from "../types/poster";

interface MasterPromptPanelProps {
  variables: PosterVariables;
  onJumpToVariable: (tab: EditorTabId, key: string, inputId?: string) => void;
}

export function MasterPromptPanel({
  variables,
  onJumpToVariable,
}: MasterPromptPanelProps) {
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const valueMap = buildPlaceholderMap(variables);

  const handleCopyTemplate = async () => {
    await navigator.clipboard.writeText(MASTER_PROMPT_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 1800);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(variables, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  // Split MASTER_PROMPT_TEMPLATE into plain text and {{variable}} tokens
  const segments = MASTER_PROMPT_TEMPLATE.split(/(\{\{\w+\}\})/g);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#0B2447]">
              Master Prompt Template (Placeholder Dinamis)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik variabel berwarna oranye untuk langsung menyunting nilainya di panel editor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedJson ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copiedJson ? "JSON Tersalin" : "Salin JSON Variabel"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2447] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153668] transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedTemplate ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copiedTemplate ? "Template Tersalin" : "Salin Master Prompt"}</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 font-mono text-[12.5px] leading-relaxed text-slate-800 whitespace-pre-wrap">
          {segments.map((seg, idx) => {
            const match = seg.match(/^\{\{(\w+)\}\}$/);
            if (!match) {
              return <span key={idx}>{seg}</span>;
            }
            const varKey = match[1];
            const def = VARIABLE_DEFINITIONS.find((d) => d.key === varKey);
            return (
              <button
                key={idx}
                type="button"
                title={def ? `Edit ${def.label}` : varKey}
                onClick={() => {
                  if (def) {
                    onJumpToVariable(def.tab, varKey, def.inputId);
                  }
                }}
                className="inline-block rounded bg-[#EA580C]/10 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-[#C2410C] hover:bg-[#EA580C]/20 transition-colors cursor-pointer mx-0.5"
              >
                {seg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Variable Mapping Reference Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold text-[#0B2447]">
            Daftar Variabel Placeholder Aktif
          </h3>
          <span className="text-xs text-slate-500 tabular-nums">
            {VARIABLE_DEFINITIONS.length} variabel
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2 pr-3">Variabel</th>
                <th className="py-2 px-3">Keterangan</th>
                <th className="py-2 pl-3">Nilai Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {VARIABLE_DEFINITIONS.map((def) => {
                const val = valueMap[def.key] ?? "";
                const preview =
                  val.length > 80 ? `${val.slice(0, 80).replace(/\n/g, " ")}…` : val.replace(/\n/g, " ");
                return (
                  <tr
                    key={def.key}
                    onClick={() => onJumpToVariable(def.tab, def.key, def.inputId)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-2 pr-3 font-mono text-[11.5px] font-medium text-[#C2410C] whitespace-nowrap">
                      {`{{${def.key}}}`}
                    </td>
                    <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                      {def.label}
                    </td>
                    <td className="py-2 pl-3 text-slate-500 truncate max-w-[320px]">
                      {preview}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
