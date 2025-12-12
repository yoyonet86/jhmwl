import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-search-form',
  template: `
    <div class="search-form-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>search-form 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./search-form.component.scss']
})
export class Search-formComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
