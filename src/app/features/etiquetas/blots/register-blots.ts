import Quill from 'quill';
import { IngredientesBlot } from './ingredientes-blot';
import { PlaceholderBlot } from './placeholder-blot';

let registered = false;

export function registerBlots(): void {
  if (registered) return;
  Quill.register(PlaceholderBlot);
  Quill.register(IngredientesBlot);
  registered = true;
}
