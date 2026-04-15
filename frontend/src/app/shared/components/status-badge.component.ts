import { Component, input, computed } from '@angular/core';

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  ring: string;
  dot: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  ativo: { label: 'Ativo', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  inativo: { label: 'Inativo', bg: 'bg-zinc-50', text: 'text-zinc-500', ring: 'ring-zinc-200', dot: 'bg-zinc-400' },
  rascunho: { label: 'Rascunho', bg: 'bg-zinc-50', text: 'text-zinc-600', ring: 'ring-zinc-200', dot: 'bg-zinc-400' },
  aprovado: { label: 'Aprovado', bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', dot: 'bg-sky-500' },
  em_producao: { label: 'Em Produção', bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', dot: 'bg-violet-500' },
  entregue: { label: 'Entregue', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  cancelado: { label: 'Cancelado', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500' },
  pendente: { label: 'Pendente', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  trial: { label: 'Trial', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  suspenso: { label: 'Suspenso', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1"
      [class]="config().bg + ' ' + config().text + ' ' + config().ring"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="config().dot"></span>
      {{ config().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<string>();

  config = computed<StatusConfig>(() => {
    const key = this.status()?.toLowerCase().replace(/ /g, '_') || '';
    return STATUS_MAP[key] || {
      label: this.status(),
      bg: 'bg-zinc-50',
      text: 'text-zinc-600',
      ring: 'ring-zinc-200',
      dot: 'bg-zinc-400',
    };
  });
}
