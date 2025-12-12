import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableConfig } from '../../../models/types';

/**
 * 数据表格组件 - 简化版本
 */
@Component({
  selector: 'sf-data-table',
  template: `
    <div class="data-table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th *ngFor="let column of config?.columns">
                {{ column.label }}
              </th>
              <th *ngIf="actionButtons?.length">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of data">
              <td *ngFor="let column of config?.columns">
                {{ row[column.key] }}
              </td>
              <td *ngIf="actionButtons?.length">
                <button *ngFor="let button of actionButtons" 
                        [class]="'btn btn-sm btn-' + button.type"
                        (click)="onActionClick(button, row)">
                  {{ button.label }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination" *ngIf="total > 0">
        <span>共 {{ total }} 条记录</span>
      </div>
    </div>
  `,
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() config: TableConfig | null = null;
  @Input() total = 0;
  @Input() page = 1;
  @Input() size = 10;
  @Input() loading = false;
  @Input() actionButtons: any[] = [];

  @Output() pageChange = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<any>();

  onActionClick(button: any, row: any): void {
    this.actionClick.emit({ button, row });
  }
}
