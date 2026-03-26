import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

import { Ingrediente } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-ingrediente-detail-drawer',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule, StatusBadgeComponent, CurrencyBrlPipe],
  template: `
    <p-drawer
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      position="right"
      styleClass="!w-full sm:!w-[440px]"
    >
      @if (ingrediente()) {
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3 w-full">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <i class="pi pi-box text-emerald-600"></i>
            </div>
            <div class="min-w-0">
              <h3 class="font-semibold text-zinc-800 truncate">{{ ingrediente()!.nome }}</h3>
              <app-status-badge [status]="ingrediente()!.ativo ? 'ativo' : 'inativo'" />
            </div>
          </div>
        </ng-template>

        <div class="space-y-6 py-2">

          <!-- Custo principal -->
          <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5">
            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Custo Unitário</p>
            <p class="text-3xl font-bold text-emerald-700">{{ ingrediente()!.custo_unitario | currencyBrl }}</p>
            <p class="text-sm text-emerald-600 mt-0.5">{{ unidadeLabel() }}</p>
          </div>

          <!-- Conversões de custo -->
          @if (mostrarConversoes()) {
            <div class="bg-white rounded-2xl border border-zinc-100 p-5">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Conversões</p>
              <div class="space-y-3">
                @for (conv of conversoes(); track conv.label) {
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-zinc-500">{{ conv.label }}</span>
                    <span class="font-semibold text-zinc-800">{{ conv.valor | currencyBrl }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Informações -->
          <div class="bg-white rounded-2xl border border-zinc-100 p-5">
            <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Informações</p>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-zinc-500">Unidade de medida</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 uppercase">
                  {{ ingrediente()!.unidade_medida }}
                </span>
              </div>
              @if (ingrediente()!.descricao) {
                <div class="pt-2 border-t border-zinc-100">
                  <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Descrição</p>
                  <p class="text-sm text-zinc-600 leading-relaxed">{{ ingrediente()!.descricao }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Markup vinculado -->
          @if (ingrediente()!.markup_id) {
            <div class="bg-white rounded-2xl border border-zinc-100 p-5">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Markup Específico</p>
              <div class="flex items-center gap-2">
                <i class="pi pi-percentage text-emerald-500"></i>
                <span class="text-sm text-zinc-600">Markup personalizado vinculado</span>
              </div>
            </div>
          }

        </div>

        <ng-template pTemplate="footer">
          <div class="flex gap-3">
            <p-button
              label="Editar"
              icon="pi pi-pencil"
              styleClass="flex-1"
              (onClick)="editar.emit(ingrediente()!)"
            />
            <p-button
              icon="pi pi-times"
              severity="secondary"
              [text]="true"
              (onClick)="visibleChange.emit(false)"
            />
          </div>
        </ng-template>
      }
    </p-drawer>
  `,
})
export class IngredienteDetailDrawerComponent {
  visible = input(false);
  ingrediente = input<Ingrediente | null>(null);

  visibleChange = output<boolean>();
  editar = output<Ingrediente>();

  unidadeLabel = computed(() => {
    const u = this.ingrediente()?.unidade_medida;
    const map: Record<string, string> = {
      KG: 'por quilograma',
      G: 'por grama',
      L: 'por litro',
      ML: 'por mililitro',
      UNIDADE: 'por unidade',
    };
    return map[u || ''] || '';
  });

  mostrarConversoes = computed(() => {
    const u = this.ingrediente()?.unidade_medida;
    return u === 'KG' || u === 'G' || u === 'L' || u === 'ML';
  });

  conversoes = computed(() => {
    const ing = this.ingrediente();
    if (!ing) return [];
    const custo = +ing.custo_unitario;
    const u = ing.unidade_medida;

    if (u === 'KG') {
      return [
        { label: 'Custo por 100g', valor: custo / 10 },
        { label: 'Custo por 500g', valor: custo / 2 },
        { label: 'Custo por 200g', valor: custo / 5 },
      ];
    }
    if (u === 'G') {
      return [
        { label: 'Custo por 100g', valor: custo * 100 },
        { label: 'Custo por 500g', valor: custo * 500 },
        { label: 'Custo por 1kg', valor: custo * 1000 },
      ];
    }
    if (u === 'L') {
      return [
        { label: 'Custo por 100ml', valor: custo / 10 },
        { label: 'Custo por 250ml', valor: custo / 4 },
        { label: 'Custo por 500ml', valor: custo / 2 },
      ];
    }
    if (u === 'ML') {
      return [
        { label: 'Custo por 100ml', valor: custo * 100 },
        { label: 'Custo por 500ml', valor: custo * 500 },
        { label: 'Custo por 1L', valor: custo * 1000 },
      ];
    }
    return [];
  });
}
