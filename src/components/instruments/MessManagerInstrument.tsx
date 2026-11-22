'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Minus, Plus } from 'lucide-react';

interface Roommate {
  id: string;
  name: string;
  meals: number;
}

interface HamiltonAllocation {
  id: string;
  name: string;
  meals: number;
  sharePaisa: number;
  receivedRemainder: boolean;
  proportion: number;
}

const INITIAL_ROOMMATES: readonly Roommate[] = [
  { id: 'rafsan', name: 'Rafsan', meals: 14 },
  { id: 'araf', name: 'Araf', meals: 11 },
  { id: 'ahnaf', name: 'Ahnaf', meals: 13 },
  { id: 'shafkat', name: 'Shafkat', meals: 9 },
] as const;

function computeHamiltonPaisaSplit(
  totalBdt: number,
  members: readonly Roommate[]
): {
  totalPaisa: number;
  totalMeals: number;
  allocations: HamiltonAllocation[];
  sumPaisa: number;
  remainderCount: number;
} {
  const totalPaisa = Math.round(totalBdt * 100);
  const totalMeals = members.reduce((acc, m) => acc + m.meals, 0);

  if (totalMeals <= 0) {
    return {
      totalPaisa,
      totalMeals: 0,
      allocations: members.map((m) => ({
        id: m.id,
        name: m.name,
        meals: m.meals,
        sharePaisa: 0,
        receivedRemainder: false,
        proportion: 0,
      })),
      sumPaisa: 0,
      remainderCount: 0,
    };
  }

  // Exact integer Hamilton / Largest-Remainder method in paisa (1 BDT = 100 paisa)
  const baseRows = members.map((member, index) => {
    const numerator = totalPaisa * member.meals;
    const floorPaisa = Math.floor(numerator / totalMeals);
    const exactRemainderNum = numerator % totalMeals;
    return {
      index,
      member,
      floorPaisa,
      exactRemainderNum,
    };
  });

  const floorSum = baseRows.reduce((acc, row) => acc + row.floorPaisa, 0);
  const remainderPaisa = totalPaisa - floorSum;

  const rankedIndices = [...baseRows]
    .sort((a, b) => {
      if (b.exactRemainderNum !== a.exactRemainderNum) {
        return b.exactRemainderNum - a.exactRemainderNum;
      }
      if (b.member.meals !== a.member.meals) {
        return b.member.meals - a.member.meals;
      }
      return a.index - b.index;
    })
    .slice(0, remainderPaisa)
    .map((row) => row.index);

  const remainderSet = new Set<number>(rankedIndices);

  const allocations: HamiltonAllocation[] = baseRows.map((row) => {
    const gotExtra = remainderSet.has(row.index);
    const sharePaisa = row.floorPaisa + (gotExtra ? 1 : 0);
    return {
      id: row.member.id,
      name: row.member.name,
      meals: row.member.meals,
      sharePaisa,
      receivedRemainder: gotExtra,
      proportion: row.member.meals / totalMeals,
    };
  });

  const sumPaisa = allocations.reduce((acc, item) => acc + item.sharePaisa, 0);

  return {
    totalPaisa,
    totalMeals,
    allocations,
    sumPaisa,
    remainderCount: remainderPaisa,
  };
}

function formatPaisaAsBdt(paisa: number): string {
  const bdt = paisa / 100;
  return `৳${bdt.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function MessManagerInstrument() {
  const [totalBdt, setTotalBdt] = useState<number>(4370);
  const [members, setMembers] = useState<Roommate[]>([...INITIAL_ROOMMATES]);

  const result = useMemo(
    () => computeHamiltonPaisaSplit(totalBdt, members),
    [totalBdt, members]
  );

  const driftPaisa = result.totalPaisa - result.sumPaisa;
  const mealRatePaisa =
    result.totalMeals > 0 ? Math.round(result.totalPaisa / result.totalMeals) : 0;

  const adjustMeals = (id: string, delta: number) => {
    setMembers((prev) => {
      const currentTotal = prev.reduce((sum, m) => sum + m.meals, 0);
      return prev.map((member) => {
        if (member.id !== id) return member;
        const nextMeals = Math.max(0, Math.min(40, member.meals + delta));
        if (delta < 0 && currentTotal - member.meals + nextMeals < 1) {
          return member;
        }
        return { ...member, meals: nextMeals };
      });
    });
  };

  return (
    <section
      aria-label="Mess Manager Hamilton Largest-Remainder Paisa Splitter"
      className="flex flex-col gap-5 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-neutral)] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--accent)]"
            />
            <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
              Hamilton Largest-Remainder Splitter
            </h3>
          </div>
          <p className="font-mono text-xs text-[var(--ink-secondary)]">
            Integer paisa accounting — 1 BDT = 100 paisa
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-3 py-1.5 font-mono text-xs text-[var(--ink-secondary)] tabular-nums">
          Rate:{' '}
          <span className="font-semibold text-[var(--ink-primary)]">
            {formatPaisaAsBdt(mealRatePaisa)}
          </span>
          /meal
        </div>
      </div>

      {/* Total Bazar Cost Slider */}
      <div className="space-y-2.5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] p-4">
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor="mess-bazar-slider"
            className="text-xs font-medium text-[var(--ink-secondary)]"
          >
            Total Bazar Cost (BDT)
          </label>
          <span className="font-mono text-lg font-semibold text-[var(--ink-primary)] tabular-nums">
            {formatPaisaAsBdt(result.totalPaisa)}
          </span>
        </div>

        <input
          id="mess-bazar-slider"
          type="range"
          min={1200}
          max={8500}
          step={10}
          value={totalBdt}
          onChange={(e) => setTotalBdt(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-track)] accent-[var(--accent)]"
        />

        <div className="flex justify-between font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
          <span>৳1,200</span>
          <span>{result.totalMeals} total meals</span>
          <span>৳8,500</span>
        </div>
      </div>

      {/* Roommate Rows */}
      <div className="space-y-2.5">
        {result.allocations.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-3.5 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--ink-primary)]">
                  {row.name}
                </span>
                {row.receivedRemainder && (
                  <span className="rounded-full bg-[var(--accent-tint)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--accent)] tabular-nums">
                    +0.01 paisa
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Meal Stepper */}
                <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-0.5">
                  <button
                    type="button"
                    onClick={() => adjustMeals(row.id, -1)}
                    aria-label={`Decrease meals for ${row.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--ink-secondary)] transition-[transform,background-color,color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:bg-[var(--bg-track)] [@media(hover:hover)]:hover:text-[var(--ink-primary)] active:scale-[0.97]"
                  >
                    <Minus className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <span className="w-7 text-center font-mono text-xs font-medium text-[var(--ink-primary)] tabular-nums">
                    {row.meals}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustMeals(row.id, 1)}
                    aria-label={`Increase meals for ${row.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--ink-secondary)] transition-[transform,background-color,color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:bg-[var(--bg-track)] [@media(hover:hover)]:hover:text-[var(--ink-primary)] active:scale-[0.97]"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>

                <span className="w-24 text-right font-mono text-sm font-semibold text-[var(--ink-primary)] tabular-nums">
                  {formatPaisaAsBdt(row.sharePaisa)}
                </span>
              </div>
            </div>

            {/* Proportional Share Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-track)]">
              <div
                className="h-full rounded-full transition-[width,background-color] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                  width: `${Math.round(row.proportion * 100)}%`,
                  backgroundColor: row.receivedRemainder
                    ? 'var(--accent)'
                    : 'var(--border-interactive)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Zero-Drift Reconciliation Proof */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-4 py-3 font-mono text-xs tabular-nums">
        <div className="flex items-center gap-2 text-[var(--ink-primary)]">
          <CheckCircle2
            className="h-4 w-4 text-[var(--accent)]"
            aria-hidden="true"
          />
          <span>
            Sum {formatPaisaAsBdt(result.sumPaisa)} == Total{' '}
            {formatPaisaAsBdt(result.totalPaisa)}
          </span>
        </div>

        <span className="text-[var(--ink-secondary)]">
          Rounding drift:{' '}
          <strong className="font-semibold text-[var(--accent)]">
            {formatPaisaAsBdt(Math.abs(driftPaisa))}
          </strong>
        </span>
      </div>
    </section>
  );
}

export default MessManagerInstrument;
