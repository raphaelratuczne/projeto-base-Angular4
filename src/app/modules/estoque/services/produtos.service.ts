import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from '../../../shared/auth.service';
import { Produto } from '../models/produto.model';
import { ProdutoCompleto } from '../models/produto-completo.model';

@Injectable()
export class ProdutosService {

  // local do service
  private apiUrl = window.location.origin;

  constructor(private http: Http,
              private authSrvc: AuthService) {}

  /**
   * tras lista de produtos completa
   * @return {Observable<IProdutoCompleto[]>} listagem de produtos
   */
  public getListagemCompleta(): Observable<ProdutoCompleto[]> {
    // pega dados do usuario
    let objLogin = this.authSrvc.getObjetoLogin();
    // monta url get
    let url = `${this.apiUrl}/api/Produto/GetListaProdutosCompleta?idEmpresa=${objLogin.dados.idEmpresa}&hashLogin=${objLogin.dados.hashLogin}`;
    // chamada
    return this.http.get(url)
                    .map( this.extractData )
                    .catch( this.handleError );
  }

  /**
   * tras lista de produtos simples
   * @return {Observable<Produto[]>} listagem de produtos
   */
  public getListagem(): Observable<Produto[]> {
    // pega dados do usuario
    let objLogin = this.authSrvc.getObjetoLogin();
    // monta url get
    let url = `${this.apiUrl}/api/Produto/GetListaProdutos?idEmpresa=${objLogin.dados.idEmpresa}&hashLogin=${objLogin.dados.hashLogin}`;
    // chamada
    return this.http.get(url)
                    .map( this.extractData )
                    .catch( this.handleError );
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
  private handleError (error: Response | any) {
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
