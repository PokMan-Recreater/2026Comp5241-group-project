"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Gradient Descent Playground.
 *
 * The learner fits y = w x + b to noisy data by stepping a real optimiser: the
 * loss, gradients and update rule are all computed live, so the effect of the
 * learning rate is observed rather than described.
 */

const XS = [-3, -2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4, 3];
const NOISE = [0.4, -0.6, 0.2, -0.3, 0.7, -0.2, 0.35, -0.45, 0.15, -0.25, 0.3];
const TRUE_W = 2;
const TRUE_B = 1;
const YS = XS.map((x, index) => TRUE_W * x + TRUE_B + NOISE[index]);

const WIDTH = 320;
const HEIGHT = 190;
const X_MIN = -3.4;
const X_MAX = 3.4;
const Y_MIN = -7.5;
const Y_MAX = 7.5;

const sx = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
const sy = (y: number) => HEIGHT - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;

function meanSquaredError(w: number, b: number): number {
  const total = XS.reduce((sum, x, index) => {
    const error = w * x + b - YS[index];
    return sum + error * error;
  }, 0);
  return total / XS.length;
}

export function GradientDescentSimulator() {
  const [w, setW] = useState(0);
  const [b, setB] = useState(0);
  const [lr, setLr] = useState(0.05);
  const [history, setHistory] = useState<number[]>([meanSquaredError(0, 0)]);
  const [steps, setSteps] = useState(0);
  const [diverged, setDiverged] = useState(false);

  const loss = history[history.length - 1] ?? meanSquaredError(w, b);

  const step = (count: number) => {
    let nextW = w;
    let nextB = b;
    const nextHistory = [...history];
    const size = XS.length;

    for (let index = 0; index < count; index += 1) {
      const gradW = (2 / size) * XS.reduce((sum, x, i) => sum + (nextW * x + nextB - YS[i]) * x, 0);
      const gradB = (2 / size) * XS.reduce((sum, x, i) => sum + (nextW * x + nextB - YS[i]), 0);
      nextW -= lr * gradW;
      nextB -= lr * gradB;
      nextHistory.push(meanSquaredError(nextW, nextB));
      if (!Number.isFinite(nextW) || Math.abs(nextW) > 1e6) {
        setDiverged(true);
        break;
      }
    }

    setW(nextW);
    setB(nextB);
    setHistory(nextHistory.slice(-60));
    setSteps((value) => value + count);
  };

  const reset = () => {
    setW(0);
    setB(0);
    setHistory([meanSquaredError(0, 0)]);
    setSteps(0);
    setDiverged(false);
  };

  const lossPath = useMemo(() => {
    if (history.length < 2) return "";
    const max = Math.max(...history, 0.001);
    return history
      .map((value, index) => {
        const x = (index / (history.length - 1)) * 300;
        const y = 60 - (value / max) * 55;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [history]);

  return (
    <div className="card p-5">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <svg
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full rounded-xl border border-white/10 bg-ink-900/70"
            role="img"
            aria-label="Scatter plot with the current model line"
          >
            <line x1={0} y1={sy(0)} x2={WIDTH} y2={sy(0)} stroke="rgba(148,163,184,0.25)" />
            <line x1={sx(0)} y1={0} x2={sx(0)} y2={HEIGHT} stroke="rgba(148,163,184,0.25)" />
            <line
              x1={sx(X_MIN)}
              y1={sy(w * X_MIN + b)}
              x2={sx(X_MAX)}
              y2={sy(w * X_MAX + b)}
              stroke="rgba(99,102,241,0.95)"
              strokeWidth={2.5}
            />
            <line
              x1={sx(X_MIN)}
              y1={sy(TRUE_W * X_MIN + TRUE_B)}
              x2={sx(X_MAX)}
              y2={sy(TRUE_W * X_MAX + TRUE_B)}
              stroke="rgba(148,163,184,0.35)"
              strokeDasharray="4 4"
            />
            {XS.map((x, index) => (
              <circle key={x} cx={sx(x)} cy={sy(YS[index])} r={4} className="fill-emerald-400" />
            ))}
          </svg>
          <p className="mt-2 text-xs text-slate-500">
            Green dots: data. Dashed line: the true relationship. Solid line: your current model.
          </p>
        </div>

        <div>
          <svg
            width={300}
            height={70}
            viewBox="0 0 300 70"
            className="w-full rounded-xl border border-white/10 bg-ink-900/70"
            role="img"
            aria-label="Loss history"
          >
            <path d={lossPath} fill="none" stroke="rgba(244,114,182,0.9)" strokeWidth={2} />
          </svg>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs text-slate-400">Loss (MSE)</dt>
              <dd className="font-mono text-lg text-white">{loss.toFixed(3)}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs text-slate-400">Steps</dt>
              <dd className="font-mono text-lg text-white">{steps}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs text-slate-400">w (slope)</dt>
              <dd className="font-mono text-lg text-white">{w.toFixed(3)}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <dt className="text-xs text-slate-400">b (intercept)</dt>
              <dd className="font-mono text-lg text-white">{b.toFixed(3)}</dd>
            </div>
          </dl>

          <label className="label mt-4" htmlFor="gd-lr">
            Learning rate: <span className="font-mono text-slate-200">{lr}</span>
          </label>
          <input
            id="gd-lr"
            type="range"
            min={0.005}
            max={1.1}
            step={0.005}
            value={lr}
            onChange={(event) => setLr(Number(event.target.value))}
            className="w-full accent-indigo-400"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            <span>too slow</span>
            <span>converges</span>
            <span>diverges</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => step(1)}>
              Step
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => step(10)}>
              Step ×10
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
              ↺ Reset
            </button>
          </div>

          {diverged && (
            <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-[13px] text-rose-100">
              The loss exploded: with a learning rate this large each step overshoots the minimum
              and the parameters grow without bound. Reset and try 0.05.
            </p>
          )}
        </div>
      </div>

      <p className={cn("mt-4 text-[13px] text-slate-400")}>
        Try 0.005 (slow crawl), 0.05 (steady convergence) and 1.0 (divergence) in turn. This is the
        same loop a large model runs millions of times, just with far more parameters.
      </p>

    </div>
  );
}
