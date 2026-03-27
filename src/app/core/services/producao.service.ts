import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ExplosaoProducaoResponse, StatusPedido } from '../models';

@Injectable({ providedIn: 'root' })
export class ProducaoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getExplosao(params: {
    data_inicio: string;
    data_fim: string;
    status?: StatusPedido[];
    filtro_data?: 'entrega' | 'criacao';
  }): Observable<ExplosaoProducaoResponse> {
    let httpParams = new HttpParams()
      .set('data_inicio', params.data_inicio)
      .set('data_fim', params.data_fim)
      .set('filtro_data', params.filtro_data ?? 'entrega');

    (params.status ?? [StatusPedido.APROVADO, StatusPedido.EM_PRODUCAO]).forEach(s => {
      httpParams = httpParams.append('status', s);
    });

    return this.http.get<ExplosaoProducaoResponse>(
      `${this.baseUrl}/producao/explosao`,
      { params: httpParams },
    );
  }
}
