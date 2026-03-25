import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { FaixaPesoEmbalagemService } from '../../core/services/faixa-peso-embalagem.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { FaixaPesoEmbalagem, Ingrediente, TipoIngrediente } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-embalagens-config',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, TableModule, InputNumberModule, SelectModule,
    DialogModule, ToastModule, ConfirmDialogModule,
    PageHeaderComponent, CurrencyBrlPipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './embalagens-config.component.html',
})
export class EmbalagensConfigComponent implements OnInit {
  private faixaService = inject(FaixaPesoEmbalagemService);
  private ingredienteService = inject(IngredienteService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  faixas: FaixaPesoEmbalagem[] = [];
  embalagens: Ingrediente[] = [];
  carregando = false;
  dialogVisivel = false;
  salvando = false;
  faixaEditandoId: string | null = null;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      peso_min_g: [null, [Validators.required, Validators.min(0)]],
      peso_max_g: [null, [Validators.required, Validators.min(1)]],
      ingrediente_embalagem_id: [null, Validators.required],
    });
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.faixaService.listar().subscribe({
      next: (data) => { this.faixas = data; this.carregando = false; },
      error: () => { this.carregando = false; },
    });
    this.ingredienteService.listar().subscribe({
      next: (data) => {
        this.embalagens = data.filter(i => i.tipo === TipoIngrediente.EMBALAGEM);
      },
    });
  }

  abrirDialogNovo(): void {
    this.faixaEditandoId = null;
    this.form.reset();
    this.dialogVisivel = true;
  }

  abrirDialogEditar(faixa: FaixaPesoEmbalagem): void {
    this.faixaEditandoId = faixa.id;
    this.form.patchValue({
      peso_min_g: faixa.peso_min_g,
      peso_max_g: faixa.peso_max_g,
      ingrediente_embalagem_id: faixa.ingrediente_embalagem_id,
    });
    this.dialogVisivel = true;
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    const dados = this.form.value;

    const req$ = this.faixaEditandoId
      ? this.faixaService.atualizar(this.faixaEditandoId, dados)
      : this.faixaService.criar(dados);

    req$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.faixaEditandoId ? 'Faixa atualizada' : 'Faixa criada',
        });
        this.dialogVisivel = false;
        this.salvando = false;
        this.carregarDados();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.error?.detail || 'Erro ao salvar faixa',
        });
        this.salvando = false;
      },
    });
  }

  confirmarDesativar(faixa: FaixaPesoEmbalagem): void {
    this.confirmationService.confirm({
      message: `Desativar a faixa ${faixa.peso_min_g}g – ${faixa.peso_max_g}g?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.faixaService.desativar(faixa.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Desativado', detail: 'Faixa desativada' });
            this.carregarDados();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar faixa' });
          },
        });
      },
    });
  }

  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  get embalagemOptions() {
    return this.embalagens.map(e => ({ label: `${e.nome} — R$ ${parseFloat(e.custo_unitario).toFixed(2)}`, value: e.id }));
  }
}
