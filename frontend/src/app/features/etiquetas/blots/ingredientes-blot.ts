import Quill from 'quill';

const Embed = Quill.import('blots/embed') as any;

export class IngredientesBlot extends Embed {
  static blotName = 'ingredientes-tabela';
  static tagName = 'div';
  static className = 'ql-ingredientes-placeholder';

  static create(): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = `
      <div class="ingredientes-chip">
        <i class="pi pi-list"></i>
        Tabela de Ingredientes
        <small>(pesos individuais + peso total)</small>
      </div>
    `;
    return node;
  }

  static value(): boolean {
    return true;
  }
}
