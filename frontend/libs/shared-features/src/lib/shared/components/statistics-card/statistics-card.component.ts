import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-statistics-card',
  template: `
    <div class="statistics-card-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>statistics-card 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./statistics-card.component.scss']
})
export class Statistics-cardComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
