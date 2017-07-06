import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Usuario } from '../models/usuario.model';

@Injectable()
export class LoginService {

  // headers da chamada
  private headers = new RequestOptions({headers: new Headers({'Content-Type': 'application/json;'})});

  private apiUrl = window.location.origin;

  constructor(private http: Http) {}

  /**
   * envia os dados de login para o servico
   * @param {Usuario} usuario dados do usuario
   * @return {Observable<any>} dados do login
   */
  public efetuarLogin(usuario: Usuario): Observable<any> {
    return this.http.post(
              this.apiUrl + '/api/Acesso/EfetuarLogin',
              {nome: usuario.nome, senha: usuario.senha},
              this.headers
            )
            .map(this.extractData)
            .catch(this.handleError);
  }

  /**
   * extrai dados recebidos
   * @param {Response|any} res resposta da chamada
   * @return {any} retorna os dados em formato JSON
   */
  private extractData(res: Response | any) {
    let body = res.json();
    return body.data;
  }

  /**
   * exibe erro
   * @param {Response|any} error
   * @return {string} mensagem de erro
   */
  private handleError (error: Response | any): Observable<string> {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body['error'] || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
