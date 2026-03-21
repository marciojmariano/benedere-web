import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-gauge-markup',
  standalone: true,
  template: `
    <div class="flex flex-col items-center">
      <svg [attr.width]="svgSize()" [attr.height]="svgSize()" class="-rotate-90">
        <!-- Background circle -->
        <circle
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="radius()"
          fill="none"
          stroke="#e4e4e7"
          [attr.stroke-width]="strokeWidth()"
        />
        <!-- Value arc -->
        <circle
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke]="strokeColor()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
          stroke-linecap="round"
          class="transition-all duration-500"
        />
      </svg>
      <div class="absolute flex flex-col items-center justify-center" [style.width.px]="svgSize()" [style.height.px]="svgSize()">
        <span class="text-lg font-bold text-zinc-800">{{ displayValue() }}%</span>
        @if (label()) {
          <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{{ label() }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: inline-flex; position: relative; }
  `],
})
export class GaugeMarkupComponent {
  percentage = input.required<number>();
  label = input('Markup');
  size = input<'sm' | 'md' | 'lg'>('md');

  svgSize = computed(() => {
    const map = { sm: 80, md: 120, lg: 160 };
    return map[this.size()];
  });

  strokeWidth = computed(() => {
    const map = { sm: 6, md: 8, lg: 10 };
    return map[this.size()];
  });

  center = computed(() => this.svgSize() / 2);
  radius = computed(() => (this.svgSize() - this.strokeWidth()) / 2);
  circumference = computed(() => 2 * Math.PI * this.radius());

  dashOffset = computed(() => {
    const pct = Math.min(Math.max(this.percentage(), 0), 100);
    return this.circumference() * (1 - pct / 100);
  });

  displayValue = computed(() => Math.round(this.percentage() * 10) / 10);

  strokeColor = computed(() => {
    const pct = this.percentage();
    if (pct < 30) return '#10b981';
    if (pct < 60) return '#f59e0b';
    if (pct < 80) return '#f97316';
    return '#ef4444';
  });
}
