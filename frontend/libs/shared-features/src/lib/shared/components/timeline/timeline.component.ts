import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-timeline',
  template: `
    <div class="timeline-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>timeline 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
