import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-empty-state',
  template: `
    <div class="empty-state-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>empty-state 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./empty-state.component.scss']
})
export class Empty-stateComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
