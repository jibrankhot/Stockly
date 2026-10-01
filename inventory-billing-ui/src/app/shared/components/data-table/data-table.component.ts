import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export interface DataTableColumn<T = unknown> {
  key: keyof T;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<
  T extends Record<string, unknown>,
> {
  @Input() columns: readonly DataTableColumn<T>[] = [];

  @Input() data: readonly T[] = [];

  @Input() loading = false;

  @Input() emptyMessage = 'No records found.';

  @Input() trackByKey: keyof T = 'id' as keyof T;

  getColumnValue(
    row: T,
    column: DataTableColumn<T>,
  ): unknown {
    return row[column.key];
  }

  getRowKey(
    row: T,
    index: number,
  ): string | number {
    const value = row[this.trackByKey];

    return typeof value === 'string' ||
      typeof value === 'number'
      ? value
      : index;
  }
}