import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-chart',
  template: `
    <div class="chart-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>chart 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
