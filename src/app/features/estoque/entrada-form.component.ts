import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';

import { EstoqueService } from '../../core/services/estoque.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { Ingrediente } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-entrada-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    ButtonModule, InputNumberModule, TextareaModule, ToastModule,
    DatePickerModule, AutoCompleteModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './entrada-form.component.html',
})
export class EntradaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(EstoqueService);
  private ingredienteService = inject(IngredienteService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  form!: FormGroup;
  ingredienteSelecionado = signal<Ingrediente | null>(null);
  sugestoesIngredientes = signal<Ingrediente[]>([]);
  private todosIngredientes: Ingrediente[] = [];
  salvando = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      quantidade: [null, [Validators.required, Validators.min(0.0001)]],
      preco_unitario_custo: [null, [Validators.required, Validators.min(0.0001)]],
      data_movimentacao: [new Date(), Validators.required],
      observacoes: [null],
    });

    this.ingredienteService.listar(true).subscribe({
      next: (ingredientes) => {
        this.todosIngredientes = ingredientes;
      },
    });
  }

  buscarIngredientes(event: { query: string }): void {
    const termo = event.query.toLowerCase().trim();
    this.sugestoesIngredientes.set(
      this.todosIngredientes.filter(i =>
        i.nome.toLowerCase().includes(termo)
      )
    );
  }

  isInvalid(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  salvar(): void {
    if (!this.ingredienteSelecionado()) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um ingrediente' });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios' });
      return;
    }

    const { quantidade, preco_unitario_custo, data_movimentacao, observacoes } = this.form.value;
    const dataFormatada = data_movimentacao instanceof Date
      ? data_movimentacao.toISOString().split('T')[0]
      : data_movimentacao;

    this.salvando = true;
    this.service.registrarEntrada({
      ingrediente_id: this.ingredienteSelecionado()!.id,
      quantidade,
      preco_unitario_custo,
      data_movimentacao: dataFormatada,
      observacoes: observacoes || null,
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Entrada registrada com sucesso' });
        setTimeout(() => this.router.navigate(['/estoque']), 1200);
      },
      error: (err) => {
        const detail = err?.error?.detail ?? 'Falha ao registrar entrada';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
        this.salvando = false;
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/estoque']);
  }
}
