# 金鸿马物流安全平台通用功能模块库

## 概述

通用功能模块库为金鸿马物流安全平台提供可复用的UI组件和页面模块，包含完整的业务功能UI框架，支持多种客户端使用。

## 🏗️ 架构设计

### 模块化设计
- **独立功能模块**: 每个业务域为独立模块
- **组件化架构**: 高度可复用的UI组件
- **数据驱动**: 通过@Input/@Output进行数据交互
- **业务逻辑分离**: UI与业务逻辑完全分离

### 支持的客户端
- 🏢 **平台端**: 统一管理后台
- 🚚 **物流企业端**: 物流公司业务系统
- 📦 **货主端**: 货物发送方系统
- 🚗 **司机端**: 司机移动应用

## 📋 功能模块

### 1. 司机管理模块 (`driver`)
提供司机信息管理的完整UI框架：
- **司机列表页**: 数据表格、搜索筛选、分页
- **司机详情页**: 完整信息展示和相关记录
- **司机表单页**: 添加/编辑司机信息
- **页面路由**: `/drivers` 路径组

### 2. 车辆管理模块 (`vehicle`)
提供车辆信息管理的完整UI框架：
- **车辆列表页**: 表格展示车辆信息
- **车辆详情页**: 车辆信息和维保历史
- **车辆表单页**: 添加/编辑车辆信息
- **维保管理**: 维保记录和计划

### 3. 订单管理模块 (`order`)
提供订单和货运管理的完整UI框架：
- **订单列表页**: 订单状态管理
- **订单详情页**: 完整订单信息
- **订单跟踪页**: 实时位置跟踪
- **新建订单页**: 订单创建表单

### 4. 安全管理模块 (`safety`)
提供安全管理的完整UI框架：
- **安全记录列表**: 各类安全事件记录
- **安全告警列表**: 告警优先级管理
- **安全检查表**: 周期性检查项目
- **事故调查**: 事故分析和处理流程

### 5. 业务管理模块 (`business`) ⭐ 核心模块
提供证件和保险管理的完整UI框架：

#### 司机证件管理
- **证件列表页**: 支持多种证件类型筛选
- **证件详情页**: 证件完整信息和附件
- **证件表单页**: 新增/编辑证件信息
- **证件续期页**: 续期申请和流程

#### 车辆保险管理
- **保险列表页**: 支持保险类型和状态筛选
- **保险详情页**: 保险信息和理赔记录
- **保险表单页**: 新增/编辑保险信息
- **保险续期页**: 续期申请和流程

#### 到期提醒仪表盘
- **到期统计**: 证件和保险到期概览
- **优先级分类**: 按紧急程度分类显示
- **操作入口**: 快速跳转到续期页面

#### 审批流程管理
- **审批列表**: 所有待审批事项
- **审批详情**: 审批内容和建议
- **审批操作**: 通过/拒绝/补充材料

### 6. 财务管理模块 (`finance`)
提供财务管理的完整UI框架：
- **收入统计页**: 收入概览和图表
- **支出管理**: 支出记录和分类
- **发票管理**: 发票录入和查询
- **对账管理**: 与合作方的对账
- **财务报表**: 多维度财务报告

### 7. 字典管理模块 (`dictionary`)
提供系统字典的完整管理：
- **字典分类**: 分类管理和维护
- **字典值管理**: 具体的字典项
- **导入导出**: 批量维护功能

### 8. 员工管理模块 (`employee`)
提供员工信息的管理：
- **员工列表**: 员工信息展示
- **员工详情**: 完整员工档案
- **角色权限**: 角色和权限配置

## 🧩 通用组件库

### 基础组件
- **数据表格** (`sf-data-table`): 支持排序、筛选、分页
- **搜索表单** (`sf-search-form`): 通用搜索条件组件
- **操作工具栏** (`sf-action-toolbar`): 确认、取消等操作按钮
- **加载状态** (`sf-loading-spinner`): 加载动画组件
- **空状态** (`sf-empty-state`): 无数据时的展示
- **状态徽章** (`sf-status-badge`): 状态标签组件

### 业务组件
- **确认对话框** (`sf-confirm-dialog`): 重要操作确认
- **文件上传** (`sf-file-upload`): 文件上传组件
- **统计卡片** (`sf-statistics-card`): 关键指标展示
- **图表组件** (`sf-chart`): 各类图表展示
- **时间线** (`sf-timeline`): 时间序列展示
- **进度条** (`sf-progress-bar`): 进度指示器

## 🚀 快速开始

### 安装
```bash
npm install @jhm/shared-features
```

### 在项目中使用

#### 1. 导入共享模块
```typescript
import { SharedModule } from '@jhm/shared-features';

@NgModule({
  imports: [
    SharedModule,
    // 其他模块
  ]
})
export class AppModule { }
```

#### 2. 导入功能模块
```typescript
import { DriverModule, BusinessModule } from '@jhm/shared-features';

@NgModule({
  imports: [
    DriverModule,
    BusinessModule,
    // 其他模块
  ]
})
export class AppModule { }
```

### 使用示例

#### 司机列表组件
```typescript
import { Component } from '@angular/core';
import { Driver } from '@jhm/shared-features';

@Component({
  selector: 'app-driver-management',
  template: `
    <sf-driver-list
      [drivers]="drivers"
      [loading]="loading"
      [total]="total"
      [page]="page"
      [size]="size"
      [searchParams]="searchParams"
      (pageChange)="onPageChange($event)"
      (searchChange)="onSearchChange($event)"
      (driverSelect)="onViewDriver($event)"
      (driverEdit)="onEditDriver($event)"
      (driverDelete)="onDeleteDriver($event)">
    </sf-driver-list>
  `
})
export class DriverManagementComponent {
  drivers: Driver[] = [];
  
  onSearchChange(params: SearchParams): void {
    // 处理搜索变化，加载数据
    this.loadDrivers(params);
  }
}
```

#### 证件管理
```typescript
import { Component } from '@angular/core';
import { DriverLicense, LicenseType } from '@jhm/shared-features';

@Component({
  selector: 'app-license-management',
  template: `
    <sf-license-list
      [licenses]="licenses"
      [loading]="loading"
      [total]="total"
      (licenseSelect)="onViewLicense($event)"
      (licenseRenewal)="onRenewLicense($event)"
      (expiryClick)="onCheckExpiry()">
    </sf-license-list>
    
    <sf-expiry-dashboard
      [expiringSoon]="expiringSoonLicenses"
      [expired]="expiredLicenses"
      (renewalRequest)="onRenewalRequest($event)">
    </sf-expiry-dashboard>
  `
})
export class LicenseManagementComponent {
  licenses: DriverLicense[] = [];
}
```

## 📊 数据模型

### 核心实体
```typescript
interface Driver {
  id: number;
  employeeId: string;
  name: string;
  phone: string;
  licenseInfo: LicenseInfo;
  status: DriverStatus;
  // ... 更多字段
}

interface DriverLicense {
  id: number;
  driverId: number;
  licenseType: LicenseType;
  licenseNumber: string;
  issueDate: Date;
  expiryDate: Date;
  status: LicenseStatus;
  // ... 更多字段
}

interface VehicleInsurance {
  id: number;
  vehicleId: number;
  insuranceType: InsuranceType;
  policyNumber: string;
  premiumAmount: number;
  expiryDate: Date;
  status: InsuranceStatus;
  // ... 更多字段
}
```

### 业务管理专用模型
```typescript
// 到期提醒统计
interface ExpiryStats {
  licenses: {
    valid: number;
    expiringSoon: number; // 30天内到期
    expired: number;
  };
  insurance: {
    valid: number;
    expiringSoon: number;
    expired: number;
  };
}

// 审批流程
interface ApprovalWorkflow {
  workflowType: ApprovalWorkflowType;
  entityType: string;
  entityId: number;
  status: ApprovalStatus;
  applicantId: number;
  approverId: number;
}
```

## 🎨 样式系统

### CSS变量
组件库使用主题系统的CSS变量：
```scss
// 颜色
color: var(--jhm-text-primary);
background-color: var(--jhm-bg-primary);

// 间距
padding: var(--jhm-space-4);
margin: var(--jhm-space-3);

// 字体
font-size: var(--jhm-text-base);
font-weight: var(--jhm-font-medium);

// 圆角
border-radius: var(--jhm-radius-md);
```

### 响应式设计
```scss
// 移动端适配
@media (max-width: 767px) {
  .driver-list-container {
    padding: var(--jhm-space-4);
  }
}

// 平板适配
@media (min-width: 768px) and (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 🔧 配置选项

### 表格配置
```typescript
const tableConfig: TableConfig<Driver> = {
  columns: [
    {
      key: 'name',
      label: '姓名',
      sortable: true
    },
    {
      key: 'status',
      label: '状态',
      formatter: (value) => getStatusText(value)
    }
  ],
  pagination: {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50]
  }
};
```

### 表单配置
```typescript
const formConfig: FormConfig = {
  fields: [
    {
      key: 'name',
      label: '姓名',
      type: 'text',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50
      }
    }
  ],
  layout: 'vertical'
};
```

## 🛠️ 开发指南

### 创建新模块
1. 在 `src/lib/` 下创建模块目录
2. 创建组件目录结构 `components/`, `pages/`
3. 创建模块配置文件 `.module.ts`
4. 更新 `public-api.ts` 导出
5. 创建组件和页面

### 示例：车辆管理模块
```
src/lib/vehicle/
├── components/
│   ├── vehicle-list/
│   ├── vehicle-form/
│   └── vehicle-detail/
├── pages/
│   ├── vehicle-list/
│   ├── vehicle-form/
│   └── vehicle-detail/
├── vehicle.module.ts
└── index.ts
```

### 构建库
```bash
ng build shared-features
```

### 测试
```bash
ng test shared-features
```

## 📝 开发注意事项

### 1. 业务逻辑分离
- 组件只负责UI展示，不包含业务逻辑
- 通过@Input接收数据，通过@Output发出事件
- 业务逻辑由各客户端独立实现

### 2. 数据驱动设计
- 使用统一的接口定义数据模型
- 支持多种数据源（API、本地存储等）
- 兼容不同的数据结构

### 3. 可配置性
- 支持自定义表格列
- 支持自定义表单字段
- 支持自定义操作按钮
- 支持自定义验证规则

### 4. 无障碍性
- 支持键盘导航
- 提供语义化HTML
- 支持屏幕阅读器
- 符合WCAG标准

## 🔄 版本更新

### v1.0.0 (当前版本)
- ✅ 基础架构完成
- ✅ 8个功能模块框架
- ✅ 通用组件库
- ✅ 业务管理模块（证件、保险、审批）
- ✅ 主题系统集成
- ✅ 响应式设计

### 计划中的功能
- [ ] 更多图表类型支持
- [ ] 高级筛选功能
- [ ] 批量操作功能
- [ ] 导入导出功能
- [ ] 更多主题支持
- [ ] 国际化支持

## 🤝 贡献指南

1. 遵循现有的代码风格和架构
2. 确保组件的可复用性
3. 添加相应的单元测试
4. 更新文档和示例
5. 确保响应式设计

## 📄 许可证

MIT License
