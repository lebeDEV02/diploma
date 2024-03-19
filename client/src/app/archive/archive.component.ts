import { CommonModule } from '@angular/common';
import {
  TuiInputPasswordModule,
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
import { Component } from '@angular/core';

const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';
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
  ],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
})
export class ArchiveComponent {
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  response: string;

  constructor() {
    this.uploader = new FileUploader({
      url: URL,
      disableMultipart: true, // 'DisableMultipart' must be 'true' for formatDataFunction to be called.
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item: any) => {
        return new Promise((resolve, reject) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date(),
          });
        });
      },
    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

    this.response = '';

    this.uploader.response.subscribe((res) => (this.response = res));
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  readonly testForm = new FormGroup({
    testValue: new FormControl(''),
  });

  isChecked = new FormControl(true);
}
