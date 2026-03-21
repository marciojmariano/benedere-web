import { Component, inject, input, output, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

import { Ingrediente } from '../../core/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

export interface ComposicaoItem {
  ingrediente_id: string;
  quantidade_g: number;
  ordem: number;
}

@Component({
  selector: 'app-produto-composicao',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DragDropModule,
    SelectModule, InputNumberModule, CurrencyBrlPipe,
  ],
  templateUrl: './produto-composicao.component.html',
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      background: white;
      opacity: 0.95;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .drag-list.cdk-drop-list-dragging .drag-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
})
export class ProdutoComposicaoComponent implements OnInit {
  private fb = inject(FormBuilder);

  ingredientes = input.required<Ingrediente[]>();
  initialItems = input<ComposicaoItem[]>([]);
  composicaoChange = output<ComposicaoItem[]>();

  composicaoForm!: FormArray;
  formGroup!: FormGroup;

  ngOnInit(): void {
    this.composicaoForm = this.fb.array([]);
    this.formGroup = this.fb.group({ composicao: this.composicaoForm });

    const items = this.initialItems();
    if (items.length) {
      items
        .sort((a, b) => a.ordem - b.ordem)
        .forEach(item => this.addItem(item.ingrediente_id, item.quantidade_g, item.ordem));
    }
  }

  addItem(ingredienteId = '', quantidadeG = 0, ordem = -1): void {
    const idx = ordem >= 0 ? ordem : this.composicaoForm.length;
    this.composicaoForm.push(this.fb.group({
      ingrediente_id: [ingredienteId, Validators.required],
      quantidade_g: [quantidadeG, [Validators.required, Validators.min(0.01)]],
      ordem: [idx],
    }));
    this.emitChange();
  }

  removeItem(index: number): void {
    this.composicaoForm.removeAt(index);
    this.reindex();
    this.emitChange();
  }

  onDrop(event: CdkDragDrop<FormGroup[]>): void {
    const controls = this.composicaoForm.controls;
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    this.reindex();
    this.emitChange();
  }

  onFieldChange(): void {
    this.emitChange();
  }

  private reindex(): void {
    this.composicaoForm.controls.forEach((c, i) => c.patchValue({ ordem: i }, { emitEvent: false }));
  }

  private emitChange(): void {
    this.composicaoChange.emit(
      this.composicaoForm.controls.map((c, i) => ({
        ingrediente_id: c.value.ingrediente_id,
        quantidade_g: +c.value.quantidade_g || 0,
        ordem: i,
      }))
    );
  }

  // ── Cálculos ──────────────────────────────────────────────────────────

  ingredientesDisponiveis(currentId: string): Ingrediente[] {
    const usados = new Set(
      this.composicaoForm.controls
        .map(c => c.value.ingrediente_id)
        .filter((id: string) => id && id !== currentId)
    );
    return this.ingredientes().filter(i => !usados.has(i.id));
  }

  getCusto(ingredienteId: string): number {
    return +(this.ingredientes().find(i => i.id === ingredienteId)?.custo_unitario ?? 0);
  }

  calcularCustoItem(ingredienteId: string, quantidadeG: number): number {
    return (quantidadeG / 1000) * this.getCusto(ingredienteId);
  }

  get pesoTotal(): number {
    return this.composicaoForm.controls.reduce((acc, c) => acc + (+c.value.quantidade_g || 0), 0);
  }

  get custoTotal(): number {
    return this.composicaoForm.controls.reduce((acc, c) => {
      return acc + this.calcularCustoItem(c.value.ingrediente_id, +c.value.quantidade_g || 0);
    }, 0);
  }

  get isValid(): boolean {
    return this.composicaoForm.valid;
  }

  getItems(): ComposicaoItem[] {
    return this.composicaoForm.controls.map((c, i) => ({
      ingrediente_id: c.value.ingrediente_id,
      quantidade_g: +c.value.quantidade_g || 0,
      ordem: i,
    }));
  }
}
