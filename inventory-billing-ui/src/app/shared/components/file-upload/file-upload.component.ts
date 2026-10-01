import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  @Input() label = 'Upload file';
  @Input() accept = '';
  @Input() multiple = false;
  @Input() maxSizeMb = 5;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() required = false;
  @Input() hint = '';
  @Input() errorMessage = '';

  @Output() readonly filesSelected =
    new EventEmitter<File[]>();

  @Output() readonly fileRemoved =
    new EventEmitter<File>();

  selectedFiles: File[] = [];
  isDragging = false;

  get maxSizeBytes(): number {
    return this.maxSizeMb * 1024 * 1024;
  }

  get hasFiles(): boolean {
    return this.selectedFiles.length > 0;
  }

  onBrowseClick(input: HTMLInputElement): void {
    if (this.disabled || this.loading) {
      return;
    }

    input.click();
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.processFiles(Array.from(input.files));

    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (this.disabled || this.loading) {
      return;
    }

    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (this.disabled || this.loading) {
      return;
    }

    const files = event.dataTransfer?.files;

    if (!files?.length) {
      return;
    }

    this.processFiles(Array.from(files));
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(
      (selectedFile) => selectedFile !== file,
    );

    this.fileRemoved.emit(file);
    this.filesSelected.emit([...this.selectedFiles]);
  }

  formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter((file) =>
      this.isValidFile(file),
    );

    if (!this.multiple) {
      this.selectedFiles = validFiles.slice(0, 1);
    } else {
      this.selectedFiles = [
        ...this.selectedFiles,
        ...validFiles,
      ];
    }

    this.filesSelected.emit([...this.selectedFiles]);
  }

  private isValidFile(file: File): boolean {
    if (file.size > this.maxSizeBytes) {
      return false;
    }

    if (!this.accept.trim()) {
      return true;
    }

    const acceptedTypes = this.accept
      .split(',')
      .map((type) => type.trim().toLowerCase())
      .filter(Boolean);

    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return acceptedTypes.some((acceptedType) => {
      if (acceptedType.startsWith('.')) {
        return fileName.endsWith(acceptedType);
      }

      if (acceptedType.endsWith('/*')) {
        return fileType.startsWith(
          acceptedType.slice(0, -1),
        );
      }

      return fileType === acceptedType;
    });
  }
}