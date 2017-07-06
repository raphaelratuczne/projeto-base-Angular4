import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthService } from '../../shared/auth.service';
import { EstoqueComponent } from './estoque/estoque.component';
import { PedidoComponent } from './pedido/pedido.component';

const estoqueRoutes: Routes = [
  // { path: 'estoque/:params', component: EstoqueComponent, canActivate: [AuthService] },
  { path: 'estoque', component: EstoqueComponent, canActivate: [AuthService] },
  // { path: 'pedido/:params', component: PedidoComponent, canActivate: [AuthService] },
  { path: 'pedido', component: PedidoComponent, canActivate: [AuthService] },
];

@NgModule({
  imports: [RouterModule.forChild(estoqueRoutes)],
  exports: [RouterModule]
})
export class EstoqueRoutingModule {}
