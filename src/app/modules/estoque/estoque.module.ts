import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';
import * as $ from 'jquery';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';

import { EstoqueComponent } from './estoque/estoque.component';
import { PedidoComponent } from './pedido/pedido.component';
import { EstoqueRoutingModule } from './estoque.routing.module';
import { ProdutosService } from './services/produtos.service';
import { PedidoService } from './services/pedido.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EstoqueRoutingModule,
    ModalModule.forRoot(),
    SelectModule,
    NKDatetimeModule,
  ],
  declarations: [
    EstoqueComponent,
    PedidoComponent,
  ],
  providers: [
    ProdutosService,
    PedidoService
  ]
})
export class EstoqueModule { }
