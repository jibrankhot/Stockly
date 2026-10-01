import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type StatusChipVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [],
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  @Input() label = '';
  @Input() variant: StatusChipVariant = 'neutral';
  @Input() dot = true;
}