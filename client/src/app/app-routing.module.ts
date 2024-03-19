import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompressComponent } from './compress/compress.component';
import { ArchiveComponent } from './archive/archive.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  { path: 'compress', component: CompressComponent },
  { path: 'archive', component: ArchiveComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
