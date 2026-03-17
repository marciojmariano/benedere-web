import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { OrcamentoService } from '../../core/services/orcamento.service';
import { ClienteService } from '../../core/services/cliente.service';
import { MarkupService } from '../../core/services/markup.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { Cliente, Markup, Ingrediente, UnidadeMedida } from '../../core/models';

@Component({
  selector: 'app-orcamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './orcamento-form.component.html',
})
export class OrcamentoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(OrcamentoService);
  private clienteService = inject(ClienteService);
  private markupService = inject(MarkupService);
  private ingredienteService = inject(IngredienteService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  form!: FormGroup;
  clientes: Cliente[] = [];
  markups: Markup[] = [];
  ingredientes: Ingrediente[] = [];
  salvando = false;

  unidades = [
    { label: 'Kg', value: UnidadeMedida.KG },
    { label: 'Gramas', value: UnidadeMedida.G },
    { label: 'Litro', value: UnidadeMedida.L },
    { label: 'Mililitro', value: UnidadeMedida.ML },
    { label: 'Unidade', value: UnidadeMedida.UNIDADE },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      cliente_id: [null, Validators.required],
      markup_id: [null],
      custo_embalagem: [0],
      taxa_entrega: [0],
      validade_dias: [7, [Validators.required, Validators.min(1)]],
      observacoes: [''],
      itens: this.fb.array([this.novoItem()]),
    });

    this.clienteService.listar().subscribe({ next: (data) => this.clientes = data });
    this.markupService.listar().subscribe({ next: (data) => this.markups = data });
    this.ingredienteService.listar().subscribe({ next: (data) => this.ingredientes = data });

    this.form.get('cliente_id')?.valueChanges.subscribe((clienteId) => {
    if (clienteId) {
      const cliente = this.clientes.find((c) => c.id === clienteId);
      if (cliente?.markup_id_padrao) {
        this.form.get('markup_id')?.setValue(cliente.markup_id_padrao);
      }
    }
  });
  }

  get itens(): FormArray { return this.form.get('itens') as FormArray; }

  novoItem(): FormGroup {
    return this.fb.group({
      ingrediente_id: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(0.001)]],
      unidade_medida: [UnidadeMedida.KG, Validators.required],
      observacoes: [''],
    });
  }

  adicionarItem(): void { this.itens.push(this.novoItem()); }
  removerItem(i: number): void { if (this.itens.length > 1) this.itens.removeAt(i); }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    this.service.criar(this.form.value).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento criado!' }); setTimeout(() => this.voltar(), 1000); },
      error: (err) => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.detail || 'Erro ao criar orçamento' }); this.salvando = false; },
    });
  }

  voltar(): void { this.router.navigate(['/orcamentos']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}