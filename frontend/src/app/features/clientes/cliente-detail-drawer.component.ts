import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

import { Cliente } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AvatarComponent } from '../../shared/components/avatar.component';

@Component({
  selector: 'app-cliente-detail-drawer',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule, StatusBadgeComponent, AvatarComponent],
  template: `
    <p-drawer
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      position="right"
      styleClass="!w-full sm:!w-[440px]"
    >
      @if (cliente()) {
        <ng-template pTemplate="header">
          <div class="flex items-center gap-3 w-full">
            <app-avatar [name]="cliente()!.nome" size="md" />
            <div class="min-w-0">
              <h3 class="font-semibold text-zinc-800 truncate">{{ cliente()!.nome }}</h3>
              <app-status-badge [status]="cliente()!.ativo ? 'ativo' : 'inativo'" />
            </div>
          </div>
        </ng-template>

        <div class="space-y-6 py-2">

          <!-- Contato -->
          <div class="bg-white rounded-2xl border border-zinc-100 p-5">
            <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Contato</p>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <i class="pi pi-envelope text-zinc-400 w-4 shrink-0"></i>
                <span class="text-sm text-zinc-600">{{ cliente()!.email || '—' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <i class="pi pi-phone text-zinc-400 w-4 shrink-0"></i>
                <span class="text-sm text-zinc-600">{{ cliente()!.telefone || '—' }}</span>
              </div>
              @if (cliente()!.endereco) {
                <div class="flex items-start gap-3">
                  <i class="pi pi-map-marker text-zinc-400 w-4 shrink-0 mt-0.5"></i>
                  <span class="text-sm text-zinc-600 leading-relaxed">{{ cliente()!.endereco }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Vínculos -->
          @if (cliente()!.nutricionista_id || cliente()!.markup_id_padrao) {
            <div class="bg-white rounded-2xl border border-zinc-100 p-5">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Vínculos</p>
              <div class="space-y-3">
                @if (cliente()!.nutricionista_id) {
                  <div class="flex items-center gap-3">
                    <i class="pi pi-user text-emerald-500 w-4 shrink-0"></i>
                    <span class="text-sm text-zinc-600">Nutricionista vinculada</span>
                  </div>
                }
                @if (cliente()!.markup_id_padrao) {
                  <div class="flex items-center gap-3">
                    <i class="pi pi-percentage text-emerald-500 w-4 shrink-0"></i>
                    <span class="text-sm text-zinc-600">Markup padrão configurado</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Observações -->
          @if (cliente()!.observacoes) {
            <div class="bg-white rounded-2xl border border-zinc-100 p-5">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Observações</p>
              <p class="text-sm text-zinc-600 leading-relaxed">{{ cliente()!.observacoes }}</p>
            </div>
          }

        </div>

        <ng-template pTemplate="footer">
          <div class="flex gap-3">
            <p-button
              label="Editar"
              icon="pi pi-pencil"
              styleClass="flex-1"
              (onClick)="editar.emit(cliente()!)"
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
export class ClienteDetailDrawerComponent {
  visible = input(false);
  cliente = input<Cliente | null>(null);

  visibleChange = output<boolean>();
  editar = output<Cliente>();
}
