import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * 主题系统模块
 * 
 * 该模块为金鸿马物流安全平台提供统一的主题管理功能，包括：
 * - 浅色/深色主题切换
 * - 主题持久化存储
 * - 系统偏好检测
 * - 完整的设计系统变量
 * 
 * @usage
 * ```typescript
 * // 在组件中使用
 * import { ThemeService } from '@jhm/theme-system';
 * 
 * constructor(private themeService: ThemeService) {}
 * 
 * switchToDark() {
 *   this.themeService.switchToDark();
 * }
 * ```
 */
@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: []
})
export class ThemeModule {
  constructor() {
    console.log('[主题系统] ThemeModule 已初始化');
  }
}

// 导出主题相关的类型和枚举
export { ThemeType } from './theme.service';
export { ThemeService } from './theme.service';
