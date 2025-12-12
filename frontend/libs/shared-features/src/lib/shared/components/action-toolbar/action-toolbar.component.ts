import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-action-toolbar',
  template: `
    <div class="action-toolbar-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>action-toolbar 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./action-toolbar.component.scss']
})
export class Action-toolbarComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
