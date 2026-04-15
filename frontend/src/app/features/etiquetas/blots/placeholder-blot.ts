import Quill from 'quill';

const Embed = Quill.import('blots/embed') as any;

export class PlaceholderBlot extends Embed {
  static blotName = 'placeholder';
  static tagName = 'span';
  static className = 'ql-placeholder';

  static create(value: string): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-placeholder', value);
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('spellcheck', 'false');
    node.textContent = `{${value}}`;
    return node;
  }

  static value(node: HTMLElement): string {
    return node.getAttribute('data-placeholder') ?? '';
  }
}
