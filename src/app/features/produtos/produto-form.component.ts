import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';

import { ProdutoService, ProdutoComposicaoCreate } from '../../core/services/produto.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { Ingrediente, TipoRefeicao, TIPO_REFEICAO_LABELS } from '../../core/models';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule,
    SelectModule, TextareaModule, ToastModule, InputNumberModule, DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './produto-form.component.html',
})
export class ProdutoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ProdutoService);
  private ingredienteService = inject(IngredienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  ingredientes: Ingrediente[] = [];
  salvando = false;
  produtoId: string | null = null;
  isEdicao = false;

  tiposRefeicao = Object.values(TipoRefeicao).map(v => ({
    label: TIPO_REFEICAO_LABELS[v],
    value: v,
  }));

  ngOnInit(): void {
    this.produtoId = this.route.snapshot.paramMap.get('id');
    this.isEdicao = !!this.produtoId;

    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo_refeicao: [null],
      descricao: [''],
      composicao: this.fb.array([]),
    });

    this.ingredienteService.listar().subscribe({
      next: (data) => this.ingredientes = data,
    });

    if (this.produtoId) {
      this.service.buscarPorId(this.produtoId).subscribe({
        next: (data) => {
          this.form.patchValue({
            nome: data.nome,
            tipo_refeicao: data.tipo_refeicao,
            descricao: data.descricao,
          });
          // Carrega composição existente
          if (data.composicao?.length) {
            data.composicao.forEach(c => this.adicionarIngrediente(c.ingrediente_id, +c.quantidade_g, c.ordem));
          }
        },
        error: () => this.voltar(),
      });
    }
  }

  // ── Composição (FormArray) ──────────────────────────────────────────────

  get composicaoArray(): FormArray {
    return this.form.get('composicao') as FormArray;
  }

  adicionarIngrediente(ingredienteId: string = '', quantidadeG: number = 0, ordem: number = -1): void {
    const idx = ordem >= 0 ? ordem : this.composicaoArray.length;
    this.composicaoArray.push(this.fb.group({
      ingrediente_id: [ingredienteId, Validators.required],
      quantidade_g: [quantidadeG, [Validators.required, Validators.min(0.01)]],
      ordem: [idx],
    }));
  }

  removerIngrediente(index: number): void {
    this.composicaoArray.removeAt(index);
    // Reordenar
    this.composicaoArray.controls.forEach((c, i) => c.patchValue({ ordem: i }));
  }

  getIngredienteNome(ingredienteId: string): string {
    return this.ingredientes.find(i => i.id === ingredienteId)?.nome ?? '';
  }

  getIngredienteCusto(ingredienteId: string): number {
    return +(this.ingredientes.find(i => i.id === ingredienteId)?.custo_unitario ?? 0);
  }

  calcularCustoItem(ingredienteId: string, quantidadeG: number): number {
    const custoPorKg = this.getIngredienteCusto(ingredienteId);
    return (quantidadeG / 1000) * custoPorKg;
  }

  get pesoTotal(): number {
    return this.composicaoArray.controls.reduce((acc, c) => acc + (+c.value.quantidade_g || 0), 0);
  }

  get custoTotal(): number {
    return this.composicaoArray.controls.reduce((acc, c) => {
      return acc + this.calcularCustoItem(c.value.ingrediente_id, +c.value.quantidade_g || 0);
    }, 0);
  }

  // ── Salvar ─────────────────────────────────────────────────────────────

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;

    if (this.isEdicao && this.produtoId) {
      // Atualiza dados básicos
      const { composicao, ...dados } = this.form.value;
      this.service.atualizar(this.produtoId, dados).subscribe({
        next: () => {
          // Depois salva composição
          if (composicao?.length) {
            this.service.substituirComposicao(this.produtoId!, composicao).subscribe({
              next: () => this.sucessoESair(),
              error: () => this.erroAoSalvar(),
            });
          } else {
            this.sucessoESair();
          }
        },
        error: () => this.erroAoSalvar(),
      });
    } else {
      // Criação com composição junto
      this.service.criar(this.form.value).subscribe({
        next: () => this.sucessoESair(),
        error: () => this.erroAoSalvar(),
      });
    }
  }

  private sucessoESair(): void {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto salvo com sucesso' });
    setTimeout(() => this.voltar(), 1000);
  }

  private erroAoSalvar(): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar produto' });
    this.salvando = false;
  }

  voltar(): void { this.router.navigate(['/produtos']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}
