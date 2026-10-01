import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [],
  templateUrl: './form-actions.component.html',
  styleUrl: './form-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormActionsComponent {
  @Input() align: 'left' | 'center' | 'right' | 'between' =
    'right';

  @Input() sticky = false;
}