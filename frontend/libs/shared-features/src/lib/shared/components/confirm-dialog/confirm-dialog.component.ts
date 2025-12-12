import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-confirm-dialog',
  template: `
    <div class="confirm-dialog-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>confirm-dialog 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./confirm-dialog.component.scss']
})
export class Confirm-dialogComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
