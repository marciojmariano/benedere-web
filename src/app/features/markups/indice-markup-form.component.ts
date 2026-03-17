import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { IndiceMarkupService } from '../../core/services/indice-markup.service';

@Component({
  selector: 'app-indice-markup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './indice-markup-form.component.html',
})
export class IndiceMarkupFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(IndiceMarkupService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  salvando = false;
  indiceId: string | null = null;

  ngOnInit(): void {
    this.indiceId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      percentual: ['', [Validators.required, Validators.min(0.01), Validators.max(99.99)]],
      descricao: [''],
    });
    if (this.indiceId) {
      this.service.buscarPorId(this.indiceId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.voltar(),
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    const req$ = this.indiceId
      ? this.service.atualizar(this.indiceId, this.form.value)
      : this.service.criar(this.form.value);
    req$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Índice salvo!' }); setTimeout(() => this.voltar(), 1000); },
      error: (err) => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.detail || 'Erro ao salvar' }); this.salvando = false; },
    });
  }

  voltar(): void { this.router.navigate(['/indices-markup']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}