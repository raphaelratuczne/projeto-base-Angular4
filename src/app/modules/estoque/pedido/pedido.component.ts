import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
// import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../../../shared/auth.service';
import { ProdutosService } from '../services/produtos.service';
import { PedidoService } from '../services/pedido.service';
import { Produto, ProdutoHtml } from '../models/produto.model';
import { RespostaPedido } from '../models/resposta-pedido.model';

@Component({
  selector: 'pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit, OnDestroy, AfterViewInit {

  // params: string;
  // inscricao: Subscription;
  // modal
  @ViewChild('modalPedido') public modalPedido: ModalDirective;
  // lista de pedidos
  public pedidos: RespostaPedido[] = [];
  // se esta carregando os pedidos
  public carregandoPedidos: boolean = true;
  // lista de produtos
  public produtos: Produto[] = [];
  // filtro por produto
  public filtroPorProdutos: ProdutoHtml[] = [];
  // filtro por status
  public filtroPorStatus: string = '';
  // filtro por codigo do pedido
  public filtroPorCodigo: string = '';
  // filtro por numero da nota fiscal
  public filtroPorNumeroNotaFiscal: string;
  // filtro por data inicial
  public filtroPorDataInicial: Date;
  // dados de config do calendario inicial
  public datepickerInicialOpts: any = {
    language:'pt-BR',
    placeholder:'Data inicial'
  };
  // filtro por data final
  public filtroPorDataFinal: Date;
  // dados de config do calendario final
  public datepickerFinalOpts: any = {
    language: 'pt-BR',
    placeholder: 'Data final',
    startDate: null
  };
  // pedido no modal
  public pedido: RespostaPedido;
  // confirmacao de cancelamento
  public cancelar: boolean = false;
  // descricao do cancelamento
  public descrCancelamento: string = '';
  // se esta aguardando resposta do pedido de cancelamento
  public aguardandoCancelamento: boolean = false;
  // se houve sucesso ao cancelar
  public pedidoCancelado: boolean = false;
  // se houve um erro ao cancelar
  public errorCancelar: boolean = false;
  // mensagem de erro do cancelamento
  public errorMsgCancelar: string = '';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authSrvc: AuthService,
              private pedidoSrvc: PedidoService,
              private produtosSrvc: ProdutosService) {}

  ngOnInit() {

    // this.inscricao = this.route.params.subscribe( params => {
    //   if ( Object.keys(params).length > 0 && typeof(params['params']) !== undefined ) {
    //     this.params = params['params'];
    //     console.log(this.params);
    //   }
    // });

    // traz a lista de produtos para filtrar
    this.produtosSrvc.getListagem()
      .subscribe(
        res => {
          this.produtos = res;
          // console.log( this.produtos );
        },
        error => console.log(error)
      );

    // traz a listagem de pedidos
    this.pedidoSrvc.getListagemPedidos()
      .subscribe(
        res => {
          this.pedidos = res;
          this.carregandoPedidos = false;
          // console.log( this.pedidos );
        },
        error => console.log(error)
      );

  }

  ngAfterViewInit() {
    // corrige o tamanho dos campos de data - pq o css manhoso nao quer funcionar (T_T)
    // seta width de 100%
    // lista de elementos na tela
    let arrEl = document.getElementsByClassName('date');
    if (arrEl.length > 0) {
      for (let i in arrEl) {
        if ((<HTMLDivElement>arrEl[i]).style !== undefined) (<HTMLDivElement>arrEl[i]).style.width = '100%';
      }
    }
  }

  ngOnDestroy() {
    // this.inscricao.unsubscribe();
  }

  /**
   * faz o filtro dos pedidos para a listagem
   * @return {RespostaPedido[]} lista de pedidos
   */
  public obterPedidos(): RespostaPedido[] {
    if ( this.pedidos.length === 0 )
      return [];

    // referencia da lista completa
    let lista = this.pedidos;

    // filtro por produtos
    if ( this.filtroPorProdutos !== undefined && this.filtroPorProdutos.length > 0 ) {
      // faz um loop por produto selecionado no filtro
      for (let produtoSelecionado of this.filtroPorProdutos) {
        // faz um loop na lista de pedidos
        lista = lista.filter( pedido => {
          // procura pelo produto filtrado na lista de produtos do pedido
          return pedido.pedidoItens.find( produto => { return produto.codigoInternoProduto === produtoSelecionado.id; } ) !== undefined;
        });
      }
    }

    // filtro por staus
    if ( this.filtroPorStatus !== undefined && this.filtroPorStatus.trim() !== '' ) {
      lista = lista.filter( pedido => { return pedido.status.toLowerCase().indexOf(this.filtroPorStatus.toLowerCase()) >= 0; } );
    }

    // filtro por codigo do pedido
    if ( this.filtroPorCodigo !== undefined && this.filtroPorCodigo.trim() !== '' ) {
      lista = lista.filter( pedido => { return pedido.codigoInterno.toLowerCase().indexOf(this.filtroPorCodigo.toLowerCase()) >= 0; } );
    }

    // filtro pelo numero da nota fiscal
    // if ( this.filtroPorNumeroNotaFiscal !== undefined && this.filtroPorNumeroNotaFiscal.trim() !== '' ) {
    //   lista = lista.filter( pedido => { return pedido.notaFiscal_NumeroNota !== null && pedido.notaFiscal_NumeroNota.indexOf(this.filtroPorCodigo) >= 0; } );
    // }

    // filtro por data inicial
    if ( this.filtroPorDataInicial !== undefined && this.filtroPorDataInicial !== null ) {
      lista = lista.filter( pedido => { return pedido.dataPedido !== null && new Date(pedido.dataPedido).getTime() >= new Date(this.filtroPorDataInicial).getTime(); } );
    }

    // filtro por data final
    if ( this.filtroPorDataFinal !== undefined && this.filtroPorDataFinal !== null ) {
      lista = lista.filter( pedido => { return pedido.dataPedido !== null && new Date(pedido.dataPedido).getTime() <= new Date(this.filtroPorDataFinal).getTime(); } );
    }

    return lista;
  }

  /**
   * monta lista de produtos no formato para o campo select
   * @return {ProdutoHtml[]} produto para listagem do select
   */
  public obterProdutos(): ProdutoHtml[] {
    if ( this.produtos.length === 0 )
      return [];

    return this.produtos.map( p => { return {id: p.codigoInterno, text: p.nome}; } );
  }

  /**
   * pega os valores do select
   * @param {any} value valores
   */
  public refiltrarProdutos(value:any): void {
    this.filtroPorProdutos = value;
  }

  /**
   * evento ao setar a data inicial
   * @param {Date} dataDe data inicial
   */
  eventoFiltroPorDataInicial(dataDe: Date): void {
    // atualiza o valor
    this.filtroPorDataInicial = dataDe;
    // seta o valor minimo para data final
    this.datepickerFinalOpts.startDate = dataDe;
  }

  /**
   * evento ao setar a data final
   * @param {Date} dataAte data final
   */
  eventoFiltroPorDataFinal(dataAte: Date): void {
    // atualiza o valor
    this.filtroPorDataFinal = dataAte;
  }

  /**
   * pega os dados do pedido e exibe o modal
   * @param {RespostaPedido} pedido
   */
  public verPedidoModal(pedido: RespostaPedido): void {
    this.pedido = pedido;
    this.modalPedido.show();
  }

  /**
   * esconde o modal
   */
  public esconderModal(): void {
    this.modalPedido.hide();
  }

  /**
   * evento disparado ao esconder o modal
   */
  public eventoEsconderModal(): void {
    // reseta o status de cancelar
    this.cancelar = false;
    // limpa o campo
    this.descrCancelamento = '';
  }

  /**
   * faz o cancelamento de um pedido
   * @param {RespostaPedido} pedido pedido a ser cancelado
   */
  public cancelarPedido(pedido: RespostaPedido): void {
    // flag cancelando
    this.aguardandoCancelamento = true;
    // envia o cancelamento
    this.pedidoSrvc.cancelarPedido(pedido.codigoInterno, this.descrCancelamento)
                        .subscribe(
                          res => {
                            // se a resposta foi positiva
                            if (res.success) {
                              // flag de cancelando
                              this.aguardandoCancelamento = false;
                              // esconde o modal
                              this.modalPedido.hide();
                              // flag carregando os pedidos
                              this.carregandoPedidos = true;
                              // traz novamente a lista de pedidos
                              this.pedidoSrvc.getListagemPedidos()
                                                .subscribe(
                                                  res => {
                                                    this.pedidos = res;
                                                    this.carregandoPedidos = false;
                                                  },
                                                  error => console.log(error)
                                                );
                            } else {
                              // console.log(res.message);
                              this.exibeErroCancelamento(res.message);
                            }
                          },
                          error => this.exibeErroCancelamento(error)
                        );
  }

  private exibeErroCancelamento(msg: string): void {
    this.aguardandoCancelamento = true;
    this.errorCancelar = true;
    this.errorMsgCancelar = msg;
    setTimeout(() => {
      this.aguardandoCancelamento = false;
      this.errorCancelar = false;
      this.errorMsgCancelar = '';
      this.modalPedido.hide();
      this.carregandoPedidos = true;
      this.pedidoSrvc.getListagemPedidos()
                        .subscribe(
                          res => {
                            this.pedidos = res;
                            this.carregandoPedidos = false;
                          },
                          error => alert(error)
                        );
    }, 5000);
  }

  /**
   * faz logout do sistema
   */
  public logout(): void {
    if ( this.authSrvc.limpar() )
      this.router.navigate(['login']);
  }

}
