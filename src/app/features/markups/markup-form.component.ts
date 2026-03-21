import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';

import { MarkupService } from '../../core/services/markup.service';
import { IndiceMarkupService } from '../../core/services/indice-markup.service';
import { IndiceMarkup } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { GaugeMarkupComponent } from '../../shared/components/gauge-markup.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-markup-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    ButtonModule, InputTextModule, InputNumberModule, TextareaModule, ToastModule, MultiSelectModule,
    PageHeaderComponent, GaugeMarkupComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService],
  templateUrl: './markup-form.component.html',
})
export class MarkupFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(MarkupService);
  private indiceService = inject(IndiceMarkupService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  indices: IndiceMarkup[] = [];
  salvando = false;
  markupId: string | null = null;

  // Custo simulado para preview
  custoSimulado = signal(10);

  // Fator calculado a partir dos índices selecionados
  fatorCalculado = computed(() => {
    const ids: string[] = this.form?.get('indices_ids')?.value || [];
    if (!ids.length) return 1;
    const selecionados = this.indices.filter(i => ids.includes(i.id));
    return selecionados.reduce((fator, idx) => fator * (1 + +idx.percentual / 100), 1);
  });

  precoVenda = computed(() => this.custoSimulado() * this.fatorCalculado());

  markupPercentage = computed(() => {
    const f = this.fatorCalculado();
    if (f <= 1) return 0;
    return ((f - 1) / f) * 100;
  });

  indicesSelecionados = computed(() => {
    const ids: string[] = this.form?.get('indices_ids')?.value || [];
    return this.indices.filter(i => ids.includes(i.id));
  });

  ngOnInit(): void {
    this.markupId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: [''],
      indices_ids: [[], [Validators.required, Validators.minLength(1)]],
    });

    this.indiceService.listar().subscribe({
      next: (data) => {
        this.indices = data;
        // Re-trigger computed after indices load
        this.form.get('indices_ids')?.updateValueAndValidity();
      },
    });

    if (this.markupId) {
      this.service.buscarPorId(this.markupId).subscribe({
        next: (data) => {
          this.form.patchValue({
            nome: data.nome,
            descricao: data.descricao,
            indices_ids: data.indices.map((i: any) => i.id),
          });
        },
        error: () => this.voltar(),
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    const req$ = this.markupId
      ? this.service.atualizar(this.markupId, this.form.value)
      : this.service.criar(this.form.value);
    req$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Markup salvo!' });
        setTimeout(() => this.voltar(), 1000);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.detail || 'Erro ao salvar' });
        this.salvando = false;
      },
    });
  }

  voltar(): void { this.router.navigate(['/markups']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}
