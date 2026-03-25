import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';

import { IngredienteService } from '../../core/services/ingrediente.service';
import { MarkupService } from '../../core/services/markup.service';
import { Markup, TipoIngrediente, UnidadeMedida } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-ingrediente-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, InputTextModule, InputNumberModule, SelectModule, TextareaModule,
    ToastModule, TabsModule,
    PageHeaderComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService],
  templateUrl: './ingrediente-form.component.html',
})
export class IngredienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(IngredienteService);
  private markupService = inject(MarkupService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  markups: Markup[] = [];
  salvando = false;
  ingredienteId: string | null = null;
  activeTab = signal(0);

  tiposIngrediente = [
    { label: 'Insumo (alimentar)', value: TipoIngrediente.INSUMO },
    { label: 'Embalagem', value: TipoIngrediente.EMBALAGEM },
  ];

  unidades = [
    { label: 'Kg', value: UnidadeMedida.KG },
    { label: 'Gramas (g)', value: UnidadeMedida.G },
    { label: 'Litro (L)', value: UnidadeMedida.L },
    { label: 'Mililitro (mL)', value: UnidadeMedida.ML },
    { label: 'Unidade', value: UnidadeMedida.UNIDADE },
  ];

  // Preview de custo calculado
  custoPreview = computed(() => {
    const custo = this.form?.get('custo_unitario')?.value;
    const unidade = this.form?.get('unidade_medida')?.value;
    return { custo: custo || 0, unidade };
  });

  ngOnInit(): void {
    this.ingredienteId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo: [TipoIngrediente.INSUMO, [Validators.required]],
      descricao: [''],
      unidade_medida: [null, [Validators.required]],
      custo_unitario: [null, [Validators.required, Validators.min(0.0001)]],
      markup_id: [null],
    });

    this.markupService.listar().subscribe({ next: (data) => this.markups = data });

    if (this.ingredienteId) {
      this.service.buscarPorId(this.ingredienteId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.voltar(),
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    const req$ = this.ingredienteId
      ? this.service.atualizar(this.ingredienteId, this.form.value)
      : this.service.criar(this.form.value);
    req$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ingrediente salvo com sucesso' });
        setTimeout(() => this.voltar(), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar ingrediente' });
        this.salvando = false;
      },
    });
  }

  voltar(): void { this.router.navigate(['/ingredientes']); }
  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  getCustoLabel(): string {
    const u = this.form.get('unidade_medida')?.value;
    if (!u) return 'por unidade';
    const map: Record<string, string> = {
      [UnidadeMedida.KG]: 'por kg',
      [UnidadeMedida.G]: 'por 100g',
      [UnidadeMedida.L]: 'por litro',
      [UnidadeMedida.ML]: 'por 100ml',
      [UnidadeMedida.UNIDADE]: 'por unidade',
    };
    return map[u] || 'por unidade';
  }
}
