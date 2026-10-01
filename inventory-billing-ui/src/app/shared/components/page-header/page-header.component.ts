import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() showBackButton = false;
  @Input() backLabel = 'Back';

  @Output() readonly backClicked =
    new EventEmitter<void>();

  onBackClick(): void {
    this.backClicked.emit();
  }
}