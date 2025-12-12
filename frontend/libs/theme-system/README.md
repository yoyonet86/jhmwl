# 金鸿马物流安全平台主题系统

## 概述

主题系统为金鸿马物流安全平台提供统一的设计系统和主题管理功能，包括完整的颜色系统、排版规范、间距系统、浅色/深色主题切换等。

## 功能特性

### 🎨 完整的设计系统
- **颜色系统**: 品牌色、中性色、状态色（成功、警告、错误等）
- **排版系统**: 字体族、字号、行高、粗细、文字样式
- **间距系统**: 标准间距规范（4px基础单位，24级间距）
- **视觉系统**: 阴影、圆角、边框等视觉属性规范

### 🌓 明暗主题系统
- **浅色主题**: 清晰明亮的配色方案
- **深色主题**: 护眼深色配色方案  
- **主题切换**: 用户选择、系统偏好识别、持久化存储
- **CSS变量**: 基于CSS变量的主题颜色管理

### 📱 响应式设计
- **断点系统**: 移动端、平板、桌面断点定义
- **响应式工具类**: 移动优先的实用工具类
- **流式布局**: 支持自适应布局

## 快速开始

### 安装
```bash
# 主题系统库将构建为npm包后安装
npm install @jhm/theme-system
```

### 导入样式
在主样式文件中导入主题系统：
```scss
@import '@jhm/theme-system/styles/variables.scss';
@import '@jhm/theme-system/styles/global.scss';
@import '@jhm/theme-system/styles/themes/light.scss';
@import '@jhm/theme-system/styles/themes/dark.scss';
```

### 在应用中使用
```typescript
// 1. 导入主题服务
import { ThemeService, ThemeType } from '@jhm/theme-system';

// 2. 注入服务
constructor(private themeService: ThemeService) {}

// 3. 主题切换
switchToDark() {
  this.themeService.switchToDark();
}

switchToLight() {
  this.themeService.switchToLight();
}

// 4. 监听主题变化
this.themeService.currentTheme$.subscribe(theme => {
  console.log('当前主题:', theme);
});
```

## 设计令牌 (Design Tokens)

### 颜色系统
```scss
// 主品牌色
--jhm-primary-50: #e8f4ff;
--jhm-primary-100: #c8e0ff;
--jhm-primary-200: #9fd0ff;
--jhm-primary-500: #1e90ff; // 主品牌色

// 中性色
--jhm-neutral-50: #f8f9fa;
--jhm-neutral-500: #9aa0a6;
--jhm-neutral-900: #202124;

// 状态色
--jhm-success: #34c759;
--jhm-warning: #ff9500;
--jhm-error: #ff3b30;
--jhm-info: #007aff;
```

### 排版系统
```scss
// 字体大小
--jhm-text-xs: 0.75rem;    // 12px
--jhm-text-sm: 0.875rem;   // 14px
--jhm-text-base: 1rem;     // 16px
--jhm-text-lg: 1.125rem;   // 18px
--jhm-text-xl: 1.25rem;    // 20px
--jhm-text-2xl: 1.5rem;    // 24px

// 字体粗细
--jhm-font-light: 300;
--jhm-font-normal: 400;
--jhm-font-medium: 500;
--jhm-font-semibold: 600;
--jhm-font-bold: 700;
```

### 间距系统
```scss
--jhm-space-1: 0.25rem;   // 4px
--jhm-space-2: 0.5rem;    // 8px
--jhm-space-3: 0.75rem;   // 12px
--jhm-space-4: 1rem;      // 16px
--jhm-space-6: 1.5rem;    // 24px
--jhm-space-8: 2rem;      // 32px
--jhm-space-12: 3rem;     // 48px
```

## 实用工具类

### 文字颜色
```html
<p class="text-primary">主要文字</p>
<p class="text-secondary">次要文字</p>
<p class="text-success">成功文字</p>
<p class="text-warning">警告文字</p>
<p class="text-error">错误文字</p>
```

### 间距
```html
<div class="m-4 p-6">外边距16px，内边距24px</div>
<div class="mx-2 my-4">水平外边距8px，垂直外边距16px</div>
```

### 背景和边框
```html
<div class="bg-primary border-light rounded-lg">
  主要背景色，浅色边框，圆角
</div>
```

### 响应式
```html
<div class="mobile-hidden desktop-block">
  移动端隐藏，桌面端显示
</div>
```

## 组件样式

### 按钮
```html
<button class="btn-primary">主要按钮</button>
<button class="btn-secondary">次要按钮</button>
<button class="btn-success">成功按钮</button>
<button class="btn-warning">警告按钮</button>
<button class="btn-error">错误按钮</button>
```

### 卡片
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
  </div>
  <div class="card-body">
    卡片内容
  </div>
</div>
```

### 表格
```html
<table class="table">
  <thead>
    <tr>
      <th>列1</th>
      <th>列2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>数据1</td>
      <td>数据2</td>
    </tr>
  </tbody>
</table>
```

### 状态徽章
```html
<span class="badge-success">正常</span>
<span class="badge-warning">警告</span>
<span class="badge-error">错误</span>
<span class="badge-info">信息</span>
```

## API 参考

### ThemeService

#### 方法
```typescript
// 主题切换
switchTheme(theme: ThemeType): void
switchToLight(): void
switchToDark(): void
switchToSystem(): void

// 状态检查
isLightTheme(): boolean
isDarkTheme(): boolean
getCurrentTheme(): ThemeType
getSystemTheme(): ThemeType
isSystemDark(): boolean

// 监听变化
currentTheme$: Observable<ThemeType>

// 获取主题信息
getThemeDisplayName(theme: ThemeType): string
getThemeIcon(theme: ThemeType): string
getAvailableThemes(): Array<{type: ThemeType, name: string, icon: string}>
```

#### 示例
```typescript
// 监听主题变化
this.themeService.currentTheme$.subscribe(theme => {
  document.body.className = `theme-${theme}`;
});

// 检查当前主题
if (this.themeService.isDarkTheme()) {
  console.log('当前为深色主题');
}

// 切换到系统偏好
this.themeService.switchToSystem();
```

## 自定义主题

### 添加新主题
1. 在 `themes/` 目录下创建新的主题文件
2. 定义主题变量覆盖
3. 在 `variables.scss` 中添加对应的CSS变量
4. 更新 `ThemeType` 枚举

### 示例：企业定制主题
```scss
// themes/enterprise.scss
[data-theme="enterprise"] {
  --jhm-primary-500: #1a73e8;
  --jhm-bg-primary: #ffffff;
  --jhm-text-primary: #1f2937;
}
```

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 开发指南

### 构建库
```bash
cd frontend
ng build theme-system
```

### 开发测试
```bash
# 在主题系统目录下运行
ng build --watch
```

## 贡献指南

1. 遵循现有的设计令牌规范
2. 确保新颜色符合WCAG AA标准
3. 添加相应的深色主题样式
4. 更新文档和示例

## 许可证

MIT License
