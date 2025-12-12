# 主题切换指南

## 概述

金鸿马物流安全平台的主题系统提供了完整的主题管理功能，支持浅色/深色主题切换，基于CSS变量实现高性能主题切换。

## 功能特性

### 🎨 主题系统架构
- **CSS变量驱动**: 基于CSS Custom Properties
- **明暗主题支持**: 浅色和深色两种主题
- **主题持久化**: 用户选择自动保存到本地存储
- **系统偏好检测**: 自动检测用户系统偏好
- **实时切换**: 无需刷新页面的主题切换

### 🛠️ 技术实现
- **CSS变量**: 统一的设计令牌系统
- **主题服务**: `ThemeService` 负责主题管理
- **事件驱动**: RxJS Observables 支持主题变化监听
- **响应式设计**: 移动端和桌面端适配

## 使用方法

### 1. 主题服务使用

#### 基础导入
```typescript
import { ThemeService, ThemeType } from '@jhm/theme-system';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button (click)="toggleTheme()">
      切换到 {{ isDark() ? '浅色' : '深色' }}主题
    </button>
  `
})
export class ThemeToggleComponent {
  constructor(private themeService: ThemeService) {}

  toggleTheme(): void {
    if (this.themeService.isDarkTheme()) {
      this.themeService.switchToLight();
    } else {
      this.themeService.switchToDark();
    }
  }

  isDark(): boolean {
    return this.themeService.isDarkTheme();
  }
}
```

#### 监听主题变化
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, ThemeType } from '@jhm/theme-system';

@Component({
  selector: 'app-theme-aware',
  template: `
    <div [class.dark-theme]="isDarkTheme">
      内容会根据主题变化
    </div>
  `
})
export class ThemeAwareComponent implements OnInit, OnDestroy {
  isDarkTheme = false;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkTheme = theme === ThemeType.DARK;
        console.log('主题已切换为:', theme);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. 主题配置方法

#### 自动系统偏好
```typescript
// 使用系统偏好
this.themeService.switchToSystem();

// 检查系统偏好
if (this.themeService.isSystemDark()) {
  console.log('用户系统使用深色主题');
}
```

#### 手动主题设置
```typescript
// 设置固定主题
this.themeService.switchToLight();  // 浅色主题
this.themeService.switchToDark();   // 深色主题

// 获取当前主题
const currentTheme = this.themeService.getCurrentTheme();
```

### 3. 样式变量使用

#### 在组件中使用
```typescript
// TypeScript 组件中
export class MyComponent {
  backgroundColor = 'var(--jhm-bg-primary)';
  textColor = 'var(--jhm-text-primary)';
  primaryColor = 'var(--jhm-primary-500)';
}
```

```scss
// SCSS 样式中
.my-component {
  background-color: var(--jhm-bg-primary);
  color: var(--jhm-text-primary);
  border-color: var(--jhm-border-light);

  .primary-button {
    background-color: var(--jhm-primary-500);
    color: white;
    
    &:hover {
      background-color: var(--jhm-primary-600);
    }
  }
}
```

#### 在 HTML 中使用
```html
<div class="text-success">成功文字</div>
<div class="bg-primary rounded-lg p-4">主要背景卡片</div>
<div class="border-light shadow-md">带边框和阴影的容器</div>
```

### 4. 主题定制

#### 自定义主题变量
```scss
// 在 variables.scss 中添加自定义变量
:root {
  --my-custom-primary: #1e90ff;
  --my-custom-success: #28a745;
}

[data-theme="dark"] {
  --my-custom-primary: #4db0ff;
  --my-custom-success: #34c759;
}
```

#### 主题扩展
```scss
// themes/custom.scss
[data-theme="custom"] {
  --jhm-primary-500: #ff6b6b;
  --jhm-success: #51cf66;
  --jhm-warning: #ffd43b;
  --jhm-error: #ff6b6b;
}
```

## API 参考

### ThemeService 方法

#### 主题切换
```typescript
switchTheme(theme: ThemeType): void
switchToLight(): void
switchToDark(): void
switchToSystem(): void
```

#### 状态查询
```typescript
isLightTheme(): boolean
isDarkTheme(): boolean
getCurrentTheme(): ThemeType
getSystemTheme(): ThemeType
isSystemDark(): boolean
```

#### 事件监听
```typescript
currentTheme$: Observable<ThemeType>
```

#### 辅助信息
```typescript
getThemeDisplayName(theme: ThemeType): string
getThemeIcon(theme: ThemeType): string
getAvailableThemes(): Array<{type: ThemeType, name: string, icon: string}>
```

## 最佳实践

### 1. 主题感知组件
```typescript
@Component({
  selector: 'app-themable',
  template: `
    <div class="app-container" [class.dark]="isDark">
      <!-- 组件内容 -->
    </div>
  `
})
export class ThemableComponent implements OnInit {
  isDark = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDark = this.themeService.isDarkTheme();
    
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDark = theme === ThemeType.DARK;
      // 根据主题调整组件行为
      this.updateComponentBehavior(theme);
    });
  }

  private updateComponentBehavior(theme: ThemeType): void {
    // 主题相关的逻辑
  }
}
```

### 2. 主题工具类使用
```scss
// 使用预设的工具类
.card {
  background: var(--jhm-bg-primary);
  border: 1px solid var(--jhm-border-light);
  border-radius: var(--jhm-radius-lg);
  padding: var(--jhm-space-4);
  box-shadow: var(--jhm-shadow-sm);
}

// 响应式设计
@media (max-width: 767px) {
  .mobile-layout {
    padding: var(--jhm-space-2);
    font-size: var(--jhm-text-sm);
  }
}
```

### 3. 性能优化
```typescript
// 避免频繁的主题切换检查
export class OptimizedComponent {
  private themeSubscription: Subscription;

  constructor(private themeService: ThemeService) {
    // 一次性订阅，而不是在每个方法中检查
    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      theme => this.handleThemeChange(theme)
    );
  }

  private handleThemeChange(theme: ThemeType): void {
    // 批量更新DOM，而不是逐个更新
    this.updateAllElements(theme);
  }
}
```

## 故障排除

### 1. 主题不生效
- 检查 CSS 变量是否正确导入
- 确认主题服务已正确注入
- 验证 HTML 元素是否有 `data-theme` 属性

### 2. 闪烁问题
- 在应用启动时预加载主题选择
- 使用服务端渲染 (SSR) 时确保主题选择先行加载

### 3. 样式覆盖问题
- 使用更高的 CSS 特异性
- 使用 `!important` 作为最后的手段

## 浏览器兼容性

- **Chrome**: 88+ (CSS 自定义属性完全支持)
- **Firefox**: 85+ (CSS 自定义属性完全支持)
- **Safari**: 14+ (CSS 自定义属性完全支持)
- **Edge**: 88+ (基于 Chromium)

## 相关资源

- [CSS 自定义属性 MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Angular 主题系统最佳实践](https://angular.io/guide/component-styles)
- [设计令牌指南](https://design-tokens.github.io/community-group/format/)
