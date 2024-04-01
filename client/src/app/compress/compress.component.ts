import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpResponse,
} from '@angular/common/http';
import { Component, EventEmitter, Inject, effect, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TuiAlertModule,
  TuiAlertService,
  TuiDataListModule,
  TuiDropdownModule,
  TuiGroupModule,
  TuiTextfieldControllerModule,
  tuiFadeIn,
  tuiHeightCollapse,
  tuiSlideInBottom,
  tuiSlideInLeft,
  tuiSlideInRight,
  tuiSlideInTop,
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
    TuiAlertModule,
    
  ],
  animations: [tuiSlideInLeft, tuiSlideInTop, tuiSlideInBottom, tuiSlideInRight, tuiFadeIn, tuiHeightCollapse],
  templateUrl: './compress.component.html',
  styleUrl: './compress.component.scss',
})
export class CompressComponent {
  private URL = signal('http://localhost:3000/upload');

  public uploader: FileUploader = new FileUploader({
    url: this.URL(),
    disableMultipart: false,
    autoUpload: false,
    method: 'post',
    itemAlias: 'files', // Change this line
  });

  compressionLevel = 1;


  isCompress = effect(() => this.option.get('action')?.value === 'compress');

  option = new FormGroup({
    action: new FormControl('compress'),
  });

  public onFileSelected(event: any) {
    const file: File = event[0];
    const fileItem = new FileItem(this.uploader, file, {} as any);
    fileItem.alias = 'files'; // 'files' should match the field name in multer
    this.uploader.queue.push(fileItem);
  }

  constructor(@Inject(TuiAlertService) private readonly alerts: TuiAlertService) {
    this.option.valueChanges.subscribe(({ action }) => {
      const newUrl = action === 'compress' ? 'http://localhost:3000/upload' : 'http://localhost:3000/decompress';
      console.log(this.compressionLevel)
      this.URL.set(newUrl);
      this.uploader.setOptions({ url: newUrl });
    });
  
    this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {
      this.alerts.open('Файл успешно загружен!').subscribe({
        complete: () => {
          console.log('Файл успешно загружен!');
        },
      });
    };
  }

    onUploadAllClick() {
      const action = this.option.get('action')?.value;
      console.log('UPLOAD ALL');
      
      if (action === 'compress') {
        this.URL.set('http://localhost:3000/upload')
        this.uploader.setOptions({ url: 'http://localhost:3000/upload', additionalParameter: { compressionLevel: this.compressionLevel }});
        // Use the compress endpoint
      } else if (action === 'decompress') {
        this.URL.set('http://localhost:3000/decompress')
        // Use the decompress endpoint
      }
      console.log(this.uploader)
    this.uploader.uploadAll();
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
  readonly max = 11;
  readonly sliderStep = 1;
  readonly steps = (this.max - this.min) / this.sliderStep;
  readonly quantum = 0.01;
}
