import { Component, input, computed } from '@angular/core';

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
}

const ORDER_STEPS: TimelineStep[] = [
  { key: 'rascunho', label: 'Rascunho', icon: 'pi pi-pencil' },
  { key: 'aprovado', label: 'Aprovado', icon: 'pi pi-check' },
  { key: 'em_producao', label: 'Em Produção', icon: 'pi pi-cog' },
  { key: 'entregue', label: 'Entregue', icon: 'pi pi-truck' },
];

@Component({
  selector: 'app-status-timeline',
  standalone: true,
  template: `
    <div class="flex items-center gap-0 w-full">
      @for (step of steps; track step.key; let i = $index; let last = $last) {
        <!-- Step -->
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
            [class]="stepClass(step.key)"
          >
            <i [class]="step.icon"></i>
          </div>
          <span
            class="text-xs font-medium whitespace-nowrap hidden sm:block"
            [class]="isCompleted(step.key) || isCurrent(step.key) ? 'text-zinc-700' : 'text-zinc-400'"
          >
            {{ step.label }}
          </span>
        </div>
        <!-- Connector -->
        @if (!last) {
          <div
            class="flex-1 h-0.5 mx-2 rounded-full transition-colors"
            [class]="isCompleted(step.key) ? 'bg-emerald-400' : 'bg-zinc-200'"
          ></div>
        }
      }

      @if (isCancelled()) {
        <div class="ml-4 flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-rose-100 text-rose-600">
            <i class="pi pi-times"></i>
          </div>
          <span class="text-xs font-medium text-rose-600 hidden sm:block">Cancelado</span>
        </div>
      }
    </div>
  `,
})
export class StatusTimelineComponent {
  currentStatus = input.required<string>();

  steps = ORDER_STEPS;

  private statusOrder = computed(() => {
    const order: Record<string, number> = { rascunho: 0, aprovado: 1, em_producao: 2, entregue: 3 };
    return order;
  });

  isCancelled = computed(() => this.currentStatus()?.toLowerCase() === 'cancelado');

  isCurrent(key: string): boolean {
    return this.currentStatus()?.toLowerCase() === key;
  }

  isCompleted(key: string): boolean {
    const order = this.statusOrder();
    const currentIdx = order[this.currentStatus()?.toLowerCase()] ?? -1;
    const stepIdx = order[key] ?? -1;
    return stepIdx < currentIdx;
  }

  stepClass(key: string): string {
    if (this.isCurrent(key)) return 'bg-emerald-500 text-white';
    if (this.isCompleted(key)) return 'bg-emerald-100 text-emerald-600';
    return 'bg-zinc-100 text-zinc-400';
  }
}
