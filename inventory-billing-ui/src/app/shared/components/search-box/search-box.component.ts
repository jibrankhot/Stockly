import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent implements OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() value = '';
  @Input() debounceMs = 300;
  @Input() minLength = 0;
  @Input() disabled = false;
  @Input() ariaLabel = 'Search';

  @Output() readonly searchChange =
    new EventEmitter<string>();

  private readonly searchSubject =
    new Subject<string>();

  private readonly searchSubscription: Subscription;

  constructor() {
    this.searchSubscription =
      this.searchSubject
        .pipe(
          debounceTime(this.debounceMs),
          distinctUntilChanged(),
        )
        .subscribe((value) => {
          const searchTerm = value.trim();

          if (
            searchTerm.length === 0 ||
            searchTerm.length >= this.minLength
          ) {
            this.searchChange.emit(searchTerm);
          }
        });
  }

  onInput(value: string): void {
    this.value = value;
    this.searchSubject.next(value);
  }

  clear(): void {
    if (this.disabled) {
      return;
    }

    this.value = '';
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}