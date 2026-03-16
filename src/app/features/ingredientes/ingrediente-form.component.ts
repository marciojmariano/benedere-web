import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { IngredienteService } from '../../core/services/ingrediente.service';
import { MarkupService } from '../../core/services/markup.service';
import { Markup, UnidadeMedida } from '../../core/models';

@Component({
  selector: 'app-ingrediente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, ToastModule],
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

  unidades = [
    { label: 'Kg', value: UnidadeMedida.KG },
    { label: 'Gramas', value: UnidadeMedida.G },
    { label: 'Litro', value: UnidadeMedida.L },
    { label: 'Mililitro', value: UnidadeMedida.ML },
    { label: 'Unidade', value: UnidadeMedida.UNIDADE },
  ];

  ngOnInit(): void {
    this.ingredienteId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      unidade_medida: [null, [Validators.required]],
      custo_unitario: ['', [Validators.required, Validators.min(0.0001)]],
      descricao: [''],
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
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Salvo com sucesso' }); setTimeout(() => this.voltar(), 1000); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar' }); this.salvando = false; },
    });
  }

  voltar(): void { this.router.navigate(['/ingredientes']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}