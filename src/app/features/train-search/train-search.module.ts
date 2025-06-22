import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TrainSearchComponent } from './train-search.component';

const routes: Routes = [{ path: '', component: TrainSearchComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TrainSearchComponent,
  ],
})
export class TrainSearchModule {}
