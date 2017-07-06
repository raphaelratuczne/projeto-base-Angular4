import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from '../../../shared/auth.service';
import { Pedido } from '../models/pedido.model';
import { RequisicaoPedido } from '../models/requisicao-pedido.model';
import { RespostaPedido } from '../models/resposta-pedido.model';
import { CancelarPedido } from '../models/cancelar-pedido.model';

@Injectable()
export class PedidoService {

  /**
   * pedido de produtos
   */
  private _pedido: Pedido = {
    observacao: '',
    listaProdutos: []
  };
  // headers da chamada
  private headers = new Headers({'Content-Type': 'application/json;'});
  // pedido de produtos (POST)
  private requisicaoPedido: RequisicaoPedido;
  // local do service
  private apiUrl = window.location.origin;

  constructor(private http: Http,
              private authSrvc: AuthService) {}

  /**
   * retorna o objeto de pedido
   * @return {Pedido}
   */
  public get pedido(): Pedido {
    return this._pedido;
  }

  /**
   * seta o objeto de pedido
   * @param  {Pedido} pedido
   */
  public set pedido(pedido: Pedido) {
    this._pedido = pedido;
  }

  /**
   * envia a solicitacao de criacao do pedido
   * @return {Observable<RespostaPedido>} dados do pedido gerado
   */
  public gerarPedido(): Observable<RespostaPedido | any> {
    // pega dados do usuario
    let objLogin = this.authSrvc.getObjetoLogin();
    // monta url get
    let url = `${this.apiUrl}/api/Expedicao/PedidoExpedicao?hashLogin=${objLogin.dados.hashLogin}`;
    // objeto de pedido
    let objPedido: RequisicaoPedido = {
      idEmpresa:    objLogin.dados.idEmpresa,
      idUsuario:    objLogin.dados.idUsuario,
      observacao:   this._pedido.observacao,
      pedidoItens:  []
    };
    // lista de produtos do pedido
    for (let prod of this._pedido.listaProdutos) {
      objPedido.pedidoItens.push({
        codigoInternoProduto: prod.produtoCodigoInterno,
        quantidadeSolicitada: prod.quantidade
      });
    }

    let options = new RequestOptions({
      headers: this.headers
    });

    // chamada
    return this.http.post(
              url,
              objPedido,
              options
            )
            .map( this.extractData )
            .catch( this.handleError );
  }

  /**
 * tras lista de pedidos
 * @return {Observable<RespostaPedido[]>} listagem de pedidos
 */
  public getListagemPedidos(): Observable<RespostaPedido[]> {
    // pega dados do usuario
    let objLogin = this.authSrvc.getObjetoLogin();
    // monta url get
    let url = `${this.apiUrl}/api/Expedicao/PedidoExpedicao?idEmpresa=${objLogin.dados.idEmpresa}&hashLogin=${objLogin.dados.hashLogin}`;
    // chamada
    return this.http.get(url)
                    .map( this.extractData )
                    .catch( this.handleError );
  }

  /**
   * cancela um pedido
   * @param {string} codigoInterno codigo do pedido
   * @param {string} descricaoCancelamento descricao do cancelamento
   * @return {Observable<any>}
   */
  public cancelarPedido(codigoInterno: string, descricaoCancelamento: string): Observable<any> {
    // pega dados do usuario
    let objLogin = this.authSrvc.getObjetoLogin();
    // monta url get
    let url = `${this.apiUrl}/api/Expedicao/PedidoExpedicao?idEmpresa=${objLogin.dados.idEmpresa}&hashLogin=${objLogin.dados.hashLogin}`;
    // objeto de cancelamento
    let objBody: CancelarPedido = {
      idEmpresa: objLogin.dados.idEmpresa,
      idUsuario: objLogin.dados.idUsuario,
      codigoInterno: codigoInterno,
      descricaoDoCancelamento: descricaoCancelamento
    };
    let body = JSON.stringify(objBody);
    // cabecalho
    let options = new RequestOptions({
      headers: this.headers,
      body: body
    });

    return this.http.delete(url, options)
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
