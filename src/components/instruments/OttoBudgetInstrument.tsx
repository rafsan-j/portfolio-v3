'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface DayCashflow {
  day: string;
  amount: number;
  rail: string;
  merchant: string;
}

const WEEKLY_CASHFLOW: readonly DayCashflow[] = [
  { day: 'Mon', amount: 840, rail: 'bKash', merchant: 'Campus Canteen & Coffee' },
  { day: 'Tue', amount: 1420, rail: 'Nagad', merchant: 'Shwapno Groceries' },
  { day: 'Wed', amount: 560, rail: 'Cash', merchant: 'CNG Fare & Tea Stall' },
  { day: 'Thu', amount: 2180, rail: 'bKash', merchant: 'Fiber & Utility Bill' },
  { day: 'Fri', amount: 1290, rail: 'Card', merchant: 'Zindabazar Bookshop' },
  { day: 'Sat', amount: 680, rail: 'Cash', merchant: 'Pharmacy & Essentials' },
  { day: 'Sun', amount: 1630, rail: 'Nagad', merchant: 'Weekly Mess Bazar' },
] as const;

const CHART_MAX_BDT = 2400;
const WEEKLY_POOL_BDT = 18500;
const TOTAL_OUTFLOW_BDT = WEEKLY_CASHFLOW.reduce(
  (sum, item) => sum + item.amount,
  0
);
const NET_REMAINING_BDT = WEEKLY_POOL_BDT - TOTAL_OUTFLOW_BDT;

function formatBdt(value: number): string {
  return `৳${value.toLocaleString('en-US')}`;
}

export function OttoBudgetInstrument() {
  const [selectedIndex, setSelectedIndex] = useState<number>(3);
  const [stealthMode, setStealthMode] = useState<boolean>(false);
  const [vaultPercent, setVaultPercent] = useState<number>(30);

  const activeDay = WEEKLY_CASHFLOW[selectedIndex];
  const vaultAssigned = Math.round((NET_REMAINING_BDT * vaultPercent) / 100);
  const availableBalance = NET_REMAINING_BDT - vaultAssigned;

  const blurStyle: React.CSSProperties = {
    filter: stealthMode ? 'blur(6px)' : 'blur(0px)',
  };

  return (
    <section
      aria-label="OttoBudget 7-Day Cashflow and Stealth Vault Sandbox"
      className="flex flex-col gap-5 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 sm:p-6"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-neutral)] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--accent)]"
            />
            <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
              7-Day Cashflow &amp; Stealth Vault
            </h3>
          </div>
          <p className="font-mono text-xs text-[var(--ink-secondary)]">
            com.OttoBudget — Offline BDT Ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-secondary)]"
            aria-live="polite"
          >
            {stealthMode ? (
              <Lock
                className="h-3 w-3 text-[var(--accent)]"
                aria-hidden="true"
              />
            ) : (
              <ShieldCheck
                className="h-3 w-3 text-[var(--accent)]"
                aria-hidden="true"
              />
            )}
            <span>{stealthMode ? 'Vault Locked' : 'Vault Active'}</span>
          </span>

          <button
            type="button"
            aria-pressed={stealthMode}
            onClick={() => setStealthMode((prev) => !prev)}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] transition-[transform,border-color,background-color] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:hover:border-[var(--border-hover)] active:scale-[0.97]"
          >
            {stealthMode ? (
              <EyeOff
                className="h-3.5 w-3.5 text-[var(--accent)]"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="h-3.5 w-3.5 text-[var(--ink-secondary)]"
                aria-hidden="true"
              />
            )}
            <span>{stealthMode ? 'Stealth On' : 'Stealth Mode'}</span>
          </button>
        </div>
      </div>

      {/* Live Balance Readout Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] p-3.5">
          <p className="text-xs text-[var(--ink-secondary)]">Available Spend</p>
          <p
            style={blurStyle}
            className="mt-1 font-mono text-xl font-semibold text-[var(--ink-primary)] tabular-nums transition-[filter] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] select-none"
          >
            {formatBdt(availableBalance)}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] p-3.5">
          <p className="text-xs text-[var(--ink-secondary)]">
            Vault Assigned ({vaultPercent}%)
          </p>
          <p
            style={blurStyle}
            className="mt-1 font-mono text-xl font-semibold text-[var(--ink-primary)] tabular-nums transition-[filter] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] select-none"
          >
            {formatBdt(vaultAssigned)}
          </p>
        </div>
      </div>

      {/* Proportional 7-Day Bar Chart (True Linear ৳0 Baseline) */}
      <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-medium text-[var(--ink-primary)]">
              {activeDay.day}
            </span>
            <span className="text-xs text-[var(--ink-secondary)]">
              {activeDay.merchant}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ink-secondary)]">
              {activeDay.rail}
            </span>
            <span
              style={blurStyle}
              className="font-mono text-sm font-semibold text-[var(--ink-primary)] tabular-nums transition-[filter] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              {formatBdt(activeDay.amount)}
            </span>
          </div>
        </div>

        <div className="relative h-40 pt-2">
          {/* 100% Reference Line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-2 flex items-center"
          >
            <span className="w-12 pr-2 text-right font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
              {formatBdt(CHART_MAX_BDT)}
            </span>
            <div className="flex-1 border-t border-dashed border-[var(--border-neutral)]" />
          </div>

          {/* 50% Reference Line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 flex items-center"
          >
            <span className="w-12 pr-2 text-right font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
              {formatBdt(CHART_MAX_BDT / 2)}
            </span>
            <div className="flex-1 border-t border-dashed border-[var(--border-neutral)]" />
          </div>

          {/* 0 Baseline + Bars */}
          <div className="relative flex h-full items-end pl-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 w-12 pr-2 text-right font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums"
            >
              ৳0
            </span>

            <div className="grid h-full w-full grid-cols-7 items-end gap-2 border-b border-[var(--border-neutral)] px-1">
              {WEEKLY_CASHFLOW.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const heightPct = (item.amount / CHART_MAX_BDT) * 100;

                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onFocus={() => setSelectedIndex(idx)}
                    aria-label={`${item.day}: ${formatBdt(item.amount)} at ${item.merchant}`}
                    aria-pressed={isSelected}
                    className="group flex h-full flex-col items-center justify-end focus:outline-none"
                  >
                    <span
                      className={`w-full max-w-[30px] rounded-t-md transition-[height,background-color,transform] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-y-[0.97] origin-bottom ${
                        isSelected
                          ? 'bg-[var(--accent)]'
                          : 'bg-[var(--bg-track)] [@media(hover:hover)]:group-hover:bg-[var(--border-interactive)]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Labels Row */}
        <div className="mt-2 grid grid-cols-7 gap-2 pl-12 px-1">
          {WEEKLY_CASHFLOW.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <span
                key={item.day}
                className={`text-center font-mono text-[11px] transition-colors duration-[160ms] ${
                  isSelected
                    ? 'font-semibold text-[var(--ink-primary)]'
                    : 'text-[var(--ink-secondary)]'
                }`}
              >
                {item.day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Savings Vault Allocation Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="ottobudget-vault-slider"
            className="font-medium text-[var(--ink-primary)]"
          >
            Savings Vault Allocation
          </label>
          <span className="font-mono text-[var(--ink-secondary)] tabular-nums">
            {vaultPercent}% of net {stealthMode ? '••••' : formatBdt(NET_REMAINING_BDT)}
          </span>
        </div>

        <input
          id="ottobudget-vault-slider"
          type="range"
          min={0}
          max={60}
          step={1}
          value={vaultPercent}
          onChange={(e) => setVaultPercent(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-track)] accent-[var(--accent)]"
        />

        <div className="flex justify-between font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
          <span>0%</span>
          <span>30%</span>
          <span>60%</span>
        </div>
      </div>
    </section>
  );
}

export default OttoBudgetInstrument;
