import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProdutoService } from '../../core/services/produto.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { Ingrediente, TipoRefeicao, TIPO_REFEICAO_LABELS } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ProdutoComposicaoComponent, ComposicaoItem } from './produto-composicao.component';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule,
    SelectModule, TextareaModule, ToastModule,
    PageHeaderComponent, ProdutoComposicaoComponent,
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

  @ViewChild(ProdutoComposicaoComponent) composicaoComp?: ProdutoComposicaoComponent;

  form!: FormGroup;
  ingredientes: Ingrediente[] = [];
  composicaoInicial: ComposicaoItem[] = [];
  composicaoAtual: ComposicaoItem[] = [];
  salvando = false;
  produtoId: string | null = null;
  isEdicao = false;
  activeTab = 0;

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
          if (data.composicao?.length) {
            this.composicaoInicial = data.composicao.map(c => ({
              ingrediente_id: c.ingrediente_id,
              quantidade_g: +c.quantidade_g,
              ordem: c.ordem,
            }));
          }
        },
        error: () => this.voltar(),
      });
    }
  }

  onComposicaoChange(items: ComposicaoItem[]): void {
    this.composicaoAtual = items;
  }

  // ── Salvar ─────────────────────────────────────────────────────────────

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;

    const composicao = this.composicaoAtual.length ? this.composicaoAtual : [];

    if (this.isEdicao && this.produtoId) {
      this.service.atualizar(this.produtoId, this.form.value).subscribe({
        next: () => {
          if (composicao.length) {
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
      const payload = { ...this.form.value, composicao };
      this.service.criar(payload).subscribe({
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
