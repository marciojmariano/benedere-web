import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { PedidoService } from '../../core/services/pedido.service';
import { ClienteService } from '../../core/services/cliente.service';
import { MarkupService } from '../../core/services/markup.service';
import { Cliente, Markup } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AvatarComponent } from '../../shared/components/avatar.component';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, SelectModule,
    TextareaModule, ToastModule, DatePickerModule, PageHeaderComponent, AvatarComponent,
  ],
  providers: [MessageService],
  templateUrl: './pedido-form.component.html',
})
export class PedidoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pedidoService = inject(PedidoService);
  private clienteService = inject(ClienteService);
  private markupService = inject(MarkupService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  form!: FormGroup;
  clientes: Cliente[] = [];
  markups: Markup[] = [];
  salvando = false;
  carregando = true;
  minDate = new Date();

  clienteSelecionado = computed(() => {
    const id = this.form?.get('cliente_id')?.value;
    return this.clientes.find(c => c.id === id) ?? null;
  });

  markupSelecionado = computed(() => {
    const id = this.form?.get('markup_id')?.value;
    return this.markups.find(m => m.id === id) ?? null;
  });

  ngOnInit(): void {
    this.form = this.fb.group({
      cliente_id: [null, Validators.required],
      markup_id: [null],
      observacoes: [''],
      data_entrega_prevista: [null],
    });

    forkJoin({
      clientes: this.clienteService.listar(),
      markups: this.markupService.listar(),
    }).subscribe({
      next: ({ clientes, markups }) => {
        this.clientes = clientes;
        this.markups = markups;
        this.carregando = false;
      },
    });

    // Auto-fill markup do cliente quando selecionado
    this.form.get('cliente_id')?.valueChanges.subscribe(clienteId => {
      const cliente = this.clientes.find(c => c.id === clienteId);
      if (cliente?.markup_id_padrao) {
        this.form.patchValue({ markup_id: cliente.markup_id_padrao }, { emitEvent: false });
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;

    const formValue = { ...this.form.value };
    if (formValue.data_entrega_prevista instanceof Date) {
      formValue.data_entrega_prevista = formValue.data_entrega_prevista.toISOString();
    }

    this.pedidoService.criar(formValue).subscribe({
      next: (pedido) => {
        this.messageService.add({ severity: 'success', summary: 'Pedido criado!', detail: `Pedido ${pedido.numero} criado como rascunho` });
        setTimeout(() => this.router.navigate(['/pedidos', pedido.id]), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar pedido' });
        this.salvando = false;
      },
    });
  }

  voltar(): void { this.router.navigate(['/pedidos']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}
