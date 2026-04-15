import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-macro-bar',
  standalone: true,
  template: `
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="font-medium text-zinc-600">{{ label() }}</span>
        <span class="font-semibold text-zinc-700">{{ value() }}{{ unit() }}</span>
      </div>
      <div class="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          [class]="barColorClass()"
          [style.width.%]="percentage()"
        ></div>
      </div>
    </div>
  `,
})
export class MacroBarComponent {
  label = input.required<string>();
  value = input.required<number>();
  max = input(100);
  unit = input('g');
  color = input<'rose' | 'amber' | 'yellow' | 'emerald' | 'sky' | 'violet'>('emerald');

  percentage = computed(() => {
    const max = this.max() || 1;
    return Math.min((this.value() / max) * 100, 100);
  });

  barColorClass = computed(() => {
    const map: Record<string, string> = {
      rose: 'bg-rose-400',
      amber: 'bg-amber-400',
      yellow: 'bg-yellow-400',
      emerald: 'bg-emerald-400',
      sky: 'bg-sky-400',
      violet: 'bg-violet-400',
    };
    return map[this.color()] || 'bg-emerald-400';
  });
}
