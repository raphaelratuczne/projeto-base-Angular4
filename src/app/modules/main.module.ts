import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginModule } from './login/login.module';
import { EstoqueModule } from './estoque/estoque.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    LoginModule,
    EstoqueModule
  ],
  declarations: []
})
export class MainModule { }
