import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sf-file-upload',
  template: `
    <div class="file-upload-container">
      <!-- TODO: 实现完整的组件模板 -->
      <p>file-upload 组件 - 开发中...</p>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./file-upload.component.scss']
})
export class File-uploadComponent {
  @Input() loading = false;
  @Output() change = new EventEmitter<any>();
}
