import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AuthService } from '../../../shared/auth.service';
import { ProdutosService } from '../services/produtos.service';
import { PedidoService } from '../services/pedido.service';
import { ProdutoCompleto } from '../models/produto-completo.model';
import { Pedido } from '../models/pedido.model';

@Component({
  selector: 'estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.scss']
})
export class EstoqueComponent implements OnInit, OnDestroy {

  // modal
  @ViewChild('modalPedido') public modalPedido: ModalDirective;
  // lista de produtos
  public produtos: ProdutoCompleto[] = [];
  // se esta carregando produtos
  public carregandoProdutos: boolean = true;
  // filtro de produtos
  public filtro: string = '';
  // pedido de produtos (referencia para o html)
  public pedido: Pedido;
  // se esta aguardando a resposta da criacao de um pedido
  public aguardandoPedido: boolean = false;
  // se o pedido foi criado com sucesso
  public pedidoCriado: boolean = false;
  // se houve erro no pedido
  public errorPedido: boolean = false;
  // mensagem de erro do pedido
  public errorMsgPedido: string = '';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authSrvc: AuthService,
              private produtosSrvc: ProdutosService,
              private pedidoSrvc: PedidoService) {}

  ngOnInit() {
    // referencia o pedido
    this.pedido = this.pedidoSrvc.pedido;

    // traz lista de produtos
    this.getListaProdutos();
  }

  ngOnDestroy() {}

  getListaProdutos(): void {
    this.carregandoProdutos = true;

    this.produtosSrvc.getListagemCompleta()
        .subscribe(
          res => {
            // console.log(res);
            // se já tem produtos dentro de um pedido
            if ( this.pedido.listaProdutos.length > 0 )
              this.produtos = this.arrumaQuantidades(res);
            else
              this.produtos = res;

            this.carregandoProdutos = false;
          },
          error => console.log(error)
        );
  }

  /**
   * retorna o tabindex dos botoes
   * @param  {number} id index no loop
   * @return {Array<number>} numeros do tabindex do campo e do botao
   */
  public getTabindex(id: number): Array<number> {
    return [id+(id-1), id+(id-1)+1];
  }

  /**
   * exibe o modal
   */
  public exibirModal(): void {
    this.modalPedido.show();
  }

  /**
   * esconde o modal
   */
  public esconderModal(): void {
    this.modalPedido.hide();
  }

  /**
   * faz o filtro dos produtos
   * @return {ProdutoCompleto[]} lista de produtos
   */
  public obterProdutos(): ProdutoCompleto[] {
    if ( this.produtos.length === 0 )
      return this.produtos;

    if ( this.filtro === undefined || this.filtro.trim() === '' )
      return this.produtos.filter( p => { return p.quantidadeDisponivel > 0 });

    return this.produtos.filter( p => {
      if ( ( p.produtoCodigoInterno.toLowerCase().indexOf(this.filtro.toLowerCase()) >= 0 ||
           p.produtoNome.toLowerCase().indexOf(this.filtro.toLowerCase()) >= 0 ) &&
          p.quantidadeDisponivel > 0 ) {
        return true;
      }
      return false;
    });
  }

  /**
   * corrige as quantidades dos proutos que ja estao no pedido
   * @param {ProdutoCompleto[]} listaProdutos
   * @return {ProdutoCompleto[]}
   */
  private arrumaQuantidades(listaProdutos: ProdutoCompleto[]): ProdutoCompleto[] {
    // faz um loop na listagem
    return listaProdutos.map( produtoCompleto => {
      // procura pelo produto no pedido
      let produtoEncontrado = this.pedido.listaProdutos.find( produtoSelecionado => {
        return produtoSelecionado.idProduto === produtoCompleto.idProduto;
      } );
      // se encontrou o pedido, diminui a quantidade
      if ( produtoEncontrado )
        produtoCompleto.quantidadeDisponivel -= produtoEncontrado.quantidade;

      return produtoCompleto;
    } );
  }

  /**
   * soma o total de produtos de um pedido
   * @return {number}
   */
  getTotalProdutosPedido(): number {
    let total = 0;
    for(let prod of this.pedido.listaProdutos){
      total += prod.quantidade;
    }
    return total;
  }

  /**
   * adiciona produto ao pedido
   * @param {HTMLInputElement} prod variavel local
   * @param {ProdutoCompleto} produto objeto de produto
   */
  public addProdutoPedido(prod: HTMLInputElement, produto: ProdutoCompleto): void {

    if (prod.value.trim() === '')
      prod.value = '0';

    // converte a quantidade para numero
    let qtdade = parseInt(prod.value);
    // se o produto já estava no pedido
    let jaAdicionado = false;

    // verifica se tem a quantidade disponivel
    if ( produto.quantidadeDisponivel >= qtdade && qtdade >= 1 ) {
      // verifica se o produto já esta no pedido
      if ( this.pedidoSrvc.pedido.listaProdutos.length > 0 ) {
        for (let i in this.pedidoSrvc.pedido.listaProdutos) {
          if ( this.pedidoSrvc.pedido.listaProdutos[i].idProduto === produto.idProduto ) {
            // incrementa quantidade
            this.pedidoSrvc.pedido.listaProdutos[i].quantidade += qtdade;
            jaAdicionado = true;
            break;
          }
        }

      }
      // se o produto ainda nao foi adicionado
      if ( !jaAdicionado ) {
        // adiciona produto ao pedido
        this.pedidoSrvc.pedido.listaProdutos.push({
          idProduto:           produto.idProduto,
          produtoCodigoInterno: produto.produtoCodigoInterno,
          quantidade:           qtdade
        });
      }
      // encontra o produto na listagem
      for (let i in this.produtos) {
        if ( this.produtos[i].idProduto === produto.idProduto ) {
          // desconta quantidade pedida da quantidade disponivel
          this.produtos[i].quantidadeDisponivel -= qtdade;
          // zera o valor
          prod.value = '0';
          break;
        }
      }
    }
    // console.log(this.pedidoSrvc.pedido);
  }

  /**
   * ao apertar Enter, adiciona um produto
   * @param {KeyboardEvent} event evento de Enter
   * @param {HTMLInputElement} prod variavel local
   * @param {ProdutoCompleto} produto objeto de produto
   */
  public onEnter(event: KeyboardEvent, prod: HTMLInputElement, produto: ProdutoCompleto): void {
    event.preventDefault();
    // adiciona o produto
    this.addProdutoPedido(prod, produto);

    // pega o indice atual
    let tabIndex = (<HTMLInputElement>event.target).tabIndex;
    // pega uma lista dos inputs da tela
    let arrEl = document.getElementsByTagName('input');
    // procura pelo proximo campo
    for (let i in arrEl) {
      if ( arrEl[i].tabIndex === (tabIndex + 2) ) {
        arrEl[i].focus();
        break;
      }
    }
  }

  /**
   * remove um produto do pedido
   * @param {number} idProduto id do produto
   */
  public removeProdutoPedido(idProduto: number): void {
    // busca pelo produto no pedido
    for (let i in this.pedidoSrvc.pedido.listaProdutos) {
      if ( this.pedidoSrvc.pedido.listaProdutos[i].idProduto === idProduto ) {
        // busca o produto na lista de produtos
        for (let j in this.produtos) {
          if ( this.produtos[j].idProduto === idProduto ) {
            // retorna a quantidade ao produto
            this.produtos[j].quantidadeDisponivel += this.pedidoSrvc.pedido.listaProdutos[i].quantidade;
            break; /* for this.produtos */
          }
        }

        // remove o produto do pedido
        this.pedidoSrvc.pedido.listaProdutos.splice(parseInt(i), 1);
        break;
      }
    }
  }

  /**
   * limpa pedido
   */
  public limparPedido(): void {
    // limpa observacao
    this.pedidoSrvc.pedido.observacao = '';
    // clona a lista
    let prods = this.pedidoSrvc.pedido.listaProdutos.filter(p => { return true; });
    // faz um loop para remover os produtos
    for (let prod of prods) {
      this.removeProdutoPedido( prod.idProduto );
    }
    // this.esconderModal();
  }

  /**
   * retorna o produto pelo id passado
   * @param {number} id id do produto
   * @return {ProdutoCompleto} objeto de produto
   */
  public podutoPorId(id: number): ProdutoCompleto {
    return this.produtos.find( p => { return p.idProduto === id } );
  }

  /**
   * seta a classe de erro do campo de quantidade
   * @param {HTMLInputElement} prod variavel local
   * @param {ProdutoCompleto} produto objeto de produto
   * @return {any} objeto com a classe a ser aplicada
   */
  public validaClasse(prod: HTMLInputElement, produto: ProdutoCompleto): any {
    return {
      'invalido': parseInt(prod.value) > produto.quantidadeDisponivel || prod.value.trim() === ''
    };
  }

  /**
   * seta a mensagem de title do elemento
   * @param {HTMLInputElement} prod variavel local
   * @param {ProdutoCompleto} produto objeto de produto
   * @return {string} mensagem de title
   */
  public validaTitle(prod: HTMLInputElement, produto: ProdutoCompleto): string {
    return parseInt(prod.value) > produto.quantidadeDisponivel ? 'A quantidade selecionada é maior que a quantidade disponível' : '';
  }

  /**
   * seleciona todo o conteudo de uma caixa de texto
   * @param {FocusEvent} event evento de foco
   */
  public selectAllContent(event:FocusEvent): void {
    (<HTMLInputElement>event.target).select();
  }

  /**
   * verifica se deve ou nao bloquear o botao
   * @param {HTMLInputElement} prod variavel local
   * @param {ProdutoCompleto} produto objeto de produto
   * @return {boolean}
   */
  public bloquearBotao(prod: HTMLInputElement, produto: ProdutoCompleto): boolean {
    return parseInt(prod.value) <= 0 || parseInt(prod.value) > produto.quantidadeDisponivel || prod.value.trim() === '';
  }

  /**
   * evento para forcar a verificacao ao alterar o campo
   * @param {KeyboardEvent} event
   * @param {HTMLInputElement} prod
   * @param {ProdutoCompleto} produto
   */
  alteraQtdade(event: KeyboardEvent, prod: HTMLInputElement, produto: ProdutoCompleto): void {
    // console.log(event, prod, produto);
  }

  /**
   * gera o pedido
   */
  gerarPedido(): void {
    this.aguardandoPedido = true;
    this.pedidoSrvc.gerarPedido().subscribe(
      res => {
        // console.log(res);
        if (typeof(res['status']) !== undefined && res['status'] === 'GERADO') {
          this.pedidoCriado = true;
          setTimeout(() => {
            this.pedidoCriado = false;
            this.aguardandoPedido = false;
            this.limparPedido();
            this.esconderModal();
            this.getListaProdutos();
          }, 3000);
          // this.router.navigate(['expedicao']);
        } else {
          let obj = String(res);
          this.exibeErroPedido( JSON.parse(obj)[''][0] );
        }
      },
      error => this.exibeErroPedido(error)
    );
  }

  /**
   * se retornou erro ao gerar pedido
   * @param {string} msg mensagem de erro
   */
  private exibeErroPedido(msg: string): void {
    this.errorPedido = true;
    this.pedidoCriado = false;
    this.aguardandoPedido = true;
    this.errorMsgPedido = msg;
    setTimeout(() => {
      this.aguardandoPedido = false;
      this.errorPedido = false;
      this.limparPedido();
      this.esconderModal();
      this.getListaProdutos();
      this.errorMsgPedido = '';
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
