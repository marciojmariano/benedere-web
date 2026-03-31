import Quill from 'quill';
import { IngredientesBlot } from './ingredientes-blot';
import { PlaceholderBlot } from './placeholder-blot';

let registered = false;

export function registerBlots(): void {
  if (registered) return;

  // AlignStyle gera inline style="text-align:..." em vez de class="ql-align-*"
  // Garante alinhamento no print/preview sem depender de CSS externo
  const AlignStyle = Quill.import('attributors/style/align') as any;
  Quill.register(AlignStyle, true);

  // SizeStyle com whitelist=null aceita valores px arbitrários do toolbar
  const SizeStyle = Quill.import('attributors/style/size') as any;
  SizeStyle.whitelist = null;
  Quill.register(SizeStyle, true);

  Quill.register(PlaceholderBlot);
  Quill.register(IngredientesBlot);
  registered = true;
}
