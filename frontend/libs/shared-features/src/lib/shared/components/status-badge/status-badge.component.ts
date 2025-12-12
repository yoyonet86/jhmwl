import { Component, Input } from '@angular/core';

/**
 * 状态徽章组件
 * 用于显示各种状态的标签，支持自定义样式和颜色
 */
@Component({
  selector: 'sf-status-badge',
  template: `
    <span 
      class="status-badge" 
      [class]="badgeClass"
      [attr.title]="title || text">
      {{ text }}
    </span>
  `,
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() text: string = '';
  @Input() class: string = '';
  @Input() title: string = '';

  get badgeClass(): string {
    return `status-badge ${this.class}`;
  }
}
