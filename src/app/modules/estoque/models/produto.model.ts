/**
 * produto e codigo
 */
export interface Produto {
  codigoInterno: string;
  nome: string;
}

/**
 * produto para listagem do select
 */
export interface ProdutoHtml {
  id: string;
  text: string;
}
