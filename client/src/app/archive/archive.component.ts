import { CommonModule } from '@angular/common';
import {
  TuiInputPasswordModule,
  TuiInputSliderModule,
  TuiRadioBlockModule,
  TuiSelectModule,
  TuiToggleModule,
} from '@taiga-ui/kit';

import { FileUploader, FileItem, FileUploadModule } from 'ng2-file-upload';
import { TuiGroupModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Component, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const URL = 'http://localhost:3000/archive';
@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [
    FileUploadModule,
    CommonModule,
    TuiToggleModule,
    TuiSelectModule,
    TuiGroupModule,
    TuiRadioBlockModule,
    FormsModule,
    ReactiveFormsModule,
    TuiInputPasswordModule,
    TuiTextfieldControllerModule,
    HttpClientModule,
    TuiInputSliderModule
  ],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
})
export class ArchiveComponent {

  http = inject(HttpClient);
  public uploader: FileUploader = new FileUploader({
    url: URL,
    disableMultipart: false,
    autoUpload: false,
    method: 'post',
    itemAlias: 'files', // Change this line
  });

  compressionLevel = 1;

  option = new FormGroup({
    type: new FormControl('zip'),
  });

  // public fileOverBase(e: any): void {
  //   this.hasBaseDropZoneOver = e;
  // }

  // public fileOverAnother(e: any): void {
  //   this.hasAnotherDropZoneOver = e;
  // }

  readonly min = 1;
  readonly max = 11;
  readonly sliderStep = 1;
  readonly steps = (this.max - this.min) / this.sliderStep;
  readonly quantum = 0.01;
  files: File[] = [];

  onFileSelected(event: any) {
    const filesArray: Array<any> = Array.from(event);
    this.files.push(...filesArray);
    console.log(this.files)
  }

  uploadAll() {
    const formData: FormData = new FormData();
  
    this.files.forEach((file, index) => {
      formData.append(`files`, file, file.name);
    });

    console.log(this.option.get('type')?.value);
    formData.append('type', this.option.get('type')?.value ?? '');
    formData.append('compressionLevel', this.compressionLevel.toString());
  
    this.http.post('http://localhost:3000/archive', formData, { responseType: 'blob' })
    .subscribe(response => {
      console.log(response);
    });
  }

  removeFile(item: any, index: number) {
    item.remove();
    this.files.splice(index, 1);
  }

  removeAllFiles() {
    this.uploader.clearQueue();
    this.files = [];
  }

  readonly testForm = new FormGroup({
    testValue: new FormControl(''),
  });

  isChecked = new FormControl(true);
}
