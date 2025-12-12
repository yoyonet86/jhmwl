import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-progress-bar',
  template: `
    <div class="progress-bar-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>progress-bar 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./progress-bar.component.scss']
})
export class Progress-barComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
