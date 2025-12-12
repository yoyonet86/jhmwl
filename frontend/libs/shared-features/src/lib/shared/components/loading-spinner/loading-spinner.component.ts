import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-loading-spinner',
  template: `
    <div class="loading-spinner-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>loading-spinner 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss']
})
export class Loading-spinnerComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
