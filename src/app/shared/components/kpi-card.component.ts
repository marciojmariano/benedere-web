import { Component, input } from '@angular/core';
import { CurrencyBrlPipe } from '../pipes/currency-brl.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CurrencyBrlPipe],
  template: `
    <div class="bg-white rounded-3xl border border-zinc-100 shadow-sm p-4 flex items-center gap-3 min-h-[110px] w-full">
      <div
        class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
        [class]="iconBgClass()"
      >
        <ng-content></ng-content>
      </div>
      <div class="flex flex-col">
        <span class="text-xl font-bold text-zinc-800 leading-tight">{{ value() }}</span>
        <span class="text-xs font-medium text-zinc-400">{{ label() }}</span>

        @if (amount()) {
          <span class="text-sm font-bold text-emerald-600 mt-1">
        {{ amount() | currencyBrl }}
      </span>
    }

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
  amount = input<number | null>(null);
  color = input<'emerald' | 'sky' | 'amber' | 'rose' | 'violet' | 'zinc'>('emerald');

  iconBgClass(): string {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-50',
      sky: 'bg-sky-50',
      amber: 'bg-amber-50',
      rose: 'bg-rose-50',
      violet: 'bg-violet-50',
      zinc: 'bg-zinc-100',
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
      zinc: 'text-zinc-500',
    };
    return map[this.color()] || 'text-emerald-600';
  }
}
