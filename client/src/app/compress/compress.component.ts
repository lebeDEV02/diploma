import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpResponse,
} from '@angular/common/http';
import { Component, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  TuiDataListModule,
  TuiDropdownModule,
  TuiGroupModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import {
  TuiComboBoxModule,
  TuiDataListWrapperModule,
  TuiFilterByInputPipeModule,
  TuiInputRangeModule,
  TuiInputSliderModule,
  TuiRadioBlockModule,
  TuiSelectModule,
  TuiStringifyContentPipeModule,
  TuiStringifyPipeModule,
} from '@taiga-ui/kit';
import { FileUploader, FileItem, FileUploadModule } from 'ng2-file-upload';
const URL = 'http://localhost:3000/upload';
// const URL = 'http://localhost:3000/decompress';

@Component({
  selector: 'app-compress',
  standalone: true,
  imports: [
    FileUploadModule,
    CommonModule,
    TuiInputSliderModule,
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapperModule,
    TuiStringifyContentPipeModule,
    TuiFilterByInputPipeModule,
    TuiStringifyPipeModule,
    TuiComboBoxModule,
    TuiDropdownModule,
    TuiDataListModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiGroupModule,
    TuiRadioBlockModule,
    HttpClientModule,
  ],
  templateUrl: './compress.component.html',
  styleUrl: './compress.component.scss',
})
export class CompressComponent {
  public uploader: FileUploader = new FileUploader({
    url: URL,
    disableMultipart: false,
    autoUpload: true,
    method: 'post',
    itemAlias: 'file',
  });

  public onFileSelected(event: any) {
    const file: File = event[0];
    console.log(file);
  }

  constructor() {
    this.uploader.response.subscribe((response: Blob) => {
      // Assuming response is a Blob received from the server
      this.handleBlobResponse(response);
    });
  }

  handleBlobResponse(blob: Blob) {
    // Extract file name from content disposition header or use a default
    const filename = Date.now() + '_downloaded_file.txt';

    // Create a File object from the Blob
    const file = new File([blob], filename);

    // Now you can use the 'file' object as needed
    console.log('Downloaded TXT File:', file);

    // Trigger download
    this.triggerDownload(file);
  }

  triggerDownload(file: File) {
    const downloadLink = document.createElement('a');
    const url = window.URL.createObjectURL(file);

    downloadLink.href = url;
    downloadLink.download = file.name;

    // Append the link to the body and trigger a click event
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  }

  readonly min = 1;
  readonly max = 9;
  readonly sliderStep = 1;
  readonly steps = (this.max - this.min) / this.sliderStep;
  readonly quantum = 0.01;

  readonly control = new FormControl(1);

  readonly control2 = new FormControl();

  items = [
    'Luke Skywalker',
    'Leia Organa Solo',
    'Darth Vader',
    'Han Solo',
    'Obi-Wan Kenobi',
    'Yoda',
  ];

  readonly stringify = (item: { name: string; surname: string }): string =>
    `${item.name} ${item.surname}`;

  readonly testForm = new FormGroup({
    testValue: new FormControl(''),
  });
}
