import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type LoaderSize =
  | 'small'
  | 'medium'
  | 'large';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  @Input() size: LoaderSize = 'medium';
  @Input() message = '';
  @Input() fullArea = false;
}