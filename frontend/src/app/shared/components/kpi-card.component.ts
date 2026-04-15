import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        [class]="iconBgClass()"
      >
        <i [class]="icon()" class="text-lg" [class]="iconColorClass()"></i>
      </div>
      <div class="min-w-0">
        <p class="text-2xl font-bold text-zinc-800">{{ value() }}</p>
        <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{{ label() }}</p>
      </div>
      @if (delta()) {
        <span
          class="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold"
          [class]="delta()! > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
        >
          {{ delta()! > 0 ? '+' : '' }}{{ delta() }}%
        </span>
      }
    </div>
  `,
})
export class KpiCardComponent {
  icon = input.required<string>();
  value = input.required<string | number>();
  label = input.required<string>();
  delta = input<number | null>(null);
  color = input<'emerald' | 'sky' | 'amber' | 'rose' | 'violet'>('emerald');

  iconBgClass(): string {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-50',
      sky: 'bg-sky-50',
      amber: 'bg-amber-50',
      rose: 'bg-rose-50',
      violet: 'bg-violet-50',
    };
    return map[this.color()] || 'bg-emerald-50';
  }

  iconColorClass(): string {
    const map: Record<string, string> = {
      emerald: 'text-emerald-600',
      sky: 'text-sky-600',
      amber: 'text-amber-600',
      rose: 'text-rose-600',
      violet: 'text-violet-600',
    };
    return map[this.color()] || 'text-emerald-600';
  }
}
