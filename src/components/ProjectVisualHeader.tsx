import React from 'react';

interface ProjectVisualHeaderProps {
  slug: string;
  compact?: boolean;
}

function OttoBudgetSchematic({ compact }: { compact: boolean }) {
  const bars = [
    { day: 'S', pct: 34 },
    { day: 'S', pct: 58 },
    { day: 'M', pct: 42 },
    { day: 'T', pct: 76 },
    { day: 'W', pct: 29 },
    { day: 'T', pct: 64 },
    { day: 'F', pct: 88, active: true },
  ];

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ink-secondary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span>LEDGER · 7D SPEND</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-track)] border border-[var(--border-neutral)] font-mono text-[10px] text-[var(--ink-primary)] tracking-[0.02em]">
          AES-256-GCM · vault.enc
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[10px] text-[var(--ink-secondary)]">
            BASELINE ৳0
          </div>
          <div
            className={`font-mono font-medium text-[var(--ink-primary)] tabular-nums ${
              compact ? 'text-base' : 'text-xl'
            }`}
          >
            ৳ 14,820
          </div>
          {!compact ? (
            <div className="font-mono text-[11px] text-[var(--ink-secondary)]">
              bKash · Nagad · Bank · Room SQLite
            </div>
          ) : null}
        </div>

        <div
          className={`flex items-end gap-1.5 border-b border-[var(--border-neutral)] pb-1 ${
            compact ? 'h-12 w-32' : 'h-20 w-44'
          }`}
        >
          {bars.map((bar, idx) => (
            <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
              <div
                style={{ height: `${bar.pct}%` }}
                className={`w-full rounded-t-[3px] ${
                  bar.active ? 'bg-[var(--accent)]' : 'bg-[var(--bg-track)] border border-[var(--border-neutral)]'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UjaanSchematic({ compact }: { compact: boolean }) {
  const stages = [
    { step: '01', label: 'SAR · FFWC · Open-Meteo', meta: 'Urgency Scorer' },
    { step: '02', label: 'Pydantic Gate', meta: 'Bangla / Banglish' },
    { step: '03', label: 'OR-Tools CP-SAT', meta: 'Harvester Dispatch', accent: true },
  ];

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[var(--ink-secondary)]">
          HAOR BASIN · URGENCY PIPELINE
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent)] font-mono text-[10px] tabular-nums">
          6h TTL Override
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stages.map((stage) => (
          <div
            key={stage.step}
            className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-2 flex flex-col justify-between gap-1"
          >
            <div className="flex items-center justify-between font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
              <span>{stage.step}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  stage.accent ? 'bg-[var(--accent)]' : 'bg-[var(--border-hover)]'
                }`}
              />
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] font-medium text-[var(--ink-primary)] truncate">
              {stage.label}
            </div>
            {!compact ? (
              <div className="font-mono text-[10px] text-[var(--ink-secondary)] truncate">
                {stage.meta}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessManagerSchematic({ compact }: { compact: boolean }) {
  const rows = [
    { id: 'M-01', meals: '42', delta: '৳ 3,150.00' },
    { id: 'M-02', meals: '39', delta: '৳ 2,925.01', bonus: true },
    { id: 'M-03', meals: '35', delta: '৳ 2,624.99' },
  ];

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[var(--ink-secondary)]">
          INTEGER PAISA · HAMILTON METHOD
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent)] font-mono text-[10px] tabular-nums">
          Variance ৳0.00
        </span>
      </div>

      <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-neutral)] divide-y divide-[var(--border-neutral)] font-mono text-[11px] tabular-nums">
        {rows.slice(0, compact ? 2 : 3).map((row) => (
          <div key={row.id} className="px-2.5 py-1.5 flex items-center justify-between gap-2">
            <span className="text-[var(--ink-secondary)]">{row.id}</span>
            <span className="text-[var(--ink-secondary)]">{row.meals} meals</span>
            <span className="flex items-center gap-1.5 text-[var(--ink-primary)]">
              {row.bonus ? (
                <span className="text-[10px] text-[var(--accent)]">+৳0.01</span>
              ) : null}
              <span>{row.delta}</span>
            </span>
          </div>
        ))}
      </div>

      {!compact ? (
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-neutral)]">
            <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent-tint)] border border-[var(--accent)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[var(--bg-track)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[var(--bg-track)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[var(--bg-track)]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VellumSchematic({ compact }: { compact: boolean }) {
  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[var(--ink-secondary)] truncate">
          VLM-2026-001 · Qurrat al-Ayn
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-track)] text-[var(--ink-primary)]">
            16:9 × 9
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-track)] text-[var(--ink-secondary)]">
            CRF 18
          </span>
        </div>
      </div>

      <div className="relative rounded-lg bg-[var(--bg-surface)] border border-[var(--border-neutral)] overflow-hidden flex items-center justify-center px-3 py-2">
        <svg
          viewBox="0 0 320 64"
          className={compact ? 'w-full h-11' : 'w-full h-20'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 36 C 55 12, 110 56, 165 32 C 215 10, 265 48, 320 26"
            stroke="var(--border-hover)"
            strokeWidth="1.5"
          />
          <path
            d="M0 42 C 65 20, 115 58, 175 34 C 225 14, 275 50, 320 30"
            stroke="var(--ink-secondary)"
            strokeOpacity="0.55"
            strokeWidth="1.5"
          />
          <path
            d="M0 32 C 50 52, 115 8, 170 30 C 220 52, 270 14, 320 34"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

function LivingSylhetSchematic({ compact }: { compact: boolean }) {
  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ink-secondary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span>THREE.JS · GLSL RAIN · 64 DISTRICTS</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent)] font-mono text-[10px]">
          /studio
        </span>
      </div>

      <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-2.5 flex items-center justify-between gap-3">
        <svg
          viewBox="0 0 180 60"
          className={compact ? 'w-32 h-11 shrink-0' : 'w-44 h-16 shrink-0'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rain lines */}
          <line x1="18" y1="6" x2="12" y2="20" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="1" />
          <line x1="42" y1="4" x2="36" y2="18" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="1" />
          <line x1="150" y1="6" x2="144" y2="20" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="1" />
          {/* Isometric monitor & desk wireframe */}
          <rect x="46" y="10" width="88" height="28" rx="3" stroke="var(--border-hover)" strokeWidth="1.25" />
          <line x1="90" y1="38" x2="90" y2="46" stroke="var(--border-hover)" strokeWidth="1.25" />
          <path d="M16 48 L164 48 L174 56 L6 56 Z" stroke="var(--ink-secondary)" strokeOpacity="0.55" strokeWidth="1.2" />
          {/* 78-keycap keyboard outline */}
          <rect x="58" y="50" width="64" height="4" rx="1" fill="var(--accent)" fillOpacity="0.7" />
        </svg>

        <div className="min-w-0 flex-1 space-y-1 text-right font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
          <div className="text-[var(--ink-primary)] truncate">78-Key InstancedMesh</div>
          <div className="truncate">0 KB Three.js on /</div>
        </div>
      </div>
    </div>
  );
}

function KairynSchematic({ compact }: { compact: boolean }) {
  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[var(--ink-secondary)]">
          STUDY BLOCKS · GLANCE WIDGET
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-track)] text-[var(--ink-primary)] font-mono text-[10px]">
          Room · Offline
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-[10px] tabular-nums">
        <div className="col-span-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[var(--ink-primary)]">
            <span>CSE-133 · Algorithms</span>
            <span className="text-[var(--accent)]">45m</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-track)] overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
        <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-2 flex flex-col justify-between">
          <span className="text-[var(--ink-secondary)]">Today</span>
          <span className={compact ? 'text-xs text-[var(--ink-primary)]' : 'text-sm text-[var(--ink-primary)]'}>
            3 / 4
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProjectVisualHeader({ slug, compact = false }: ProjectVisualHeaderProps) {
  let content: React.ReactNode;

  switch (slug) {
    case 'ottobudget':
      content = <OttoBudgetSchematic compact={compact} />;
      break;
    case 'ujaan':
      content = <UjaanSchematic compact={compact} />;
      break;
    case 'mess-manager':
      content = <MessManagerSchematic compact={compact} />;
      break;
    case 'vellum':
      content = <VellumSchematic compact={compact} />;
      break;
    case 'living-sylhet-studio':
      content = <LivingSylhetSchematic compact={compact} />;
      break;
    case 'kairyn':
      content = <KairynSchematic compact={compact} />;
      break;
    default:
      content = (
        <div className="flex items-center justify-between h-full font-mono text-xs text-[var(--ink-secondary)]">
          <span>ARCHITECTURE · {slug.toUpperCase()}</span>
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
        </div>
      );
  }

  return (
    <div
      aria-hidden="true"
      className={`w-full rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] ${
        compact ? 'p-3.5 min-h-[126px]' : 'p-5 sm:p-6 min-h-[172px]'
      }`}
    >
      {content}
    </div>
  );
}

export default ProjectVisualHeader;
