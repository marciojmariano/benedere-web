import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tenant } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EtiquetaService extends ApiService {
  private readonly path = '/tenants/label-settings';

  obterSettings(): Observable<Tenant> {
    return this.get<Tenant>(this.path);
  }

  salvarSettings(payload: {
    template_delta: any;
    html_output: string;
    dimensions: { w: number; h: number };
    offset?: { x: number; y: number };
  }): Observable<Tenant> {
    return this.patch<Tenant>(this.path, payload);
  }
}
