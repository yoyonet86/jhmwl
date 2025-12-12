# 通用功能模块使用指南

## 概述

本指南详细介绍如何使用金鸿马物流安全平台的通用功能模块库，包括所有功能模块的使用方法、配置选项和最佳实践。

## 🏗️ 模块架构

### 模块组织结构
```
libs/shared-features/
├── src/lib/
│   ├── driver/           # 司机管理模块
│   ├── vehicle/          # 车辆管理模块
│   ├── order/            # 订单管理模块
│   ├── safety/           # 安全管理模块
│   ├── business/         # 业务管理模块（核心）
│   ├── finance/          # 财务管理模块
│   ├── dictionary/       # 字典管理模块
│   ├── employee/         # 员工管理模块
│   └── shared/           # 通用组件库
│       └── components/   # 基础UI组件
```

### 核心设计原则
- **业务逻辑分离**: UI组件只负责展示，业务逻辑由客户端实现
- **数据驱动**: 通过@Input/@Output模式进行数据交互
- **高度可配置**: 支持自定义表格列、表单字段、操作按钮等
- **响应式设计**: 移动端和桌面端自适应

## 📋 功能模块详解

### 1. 司机管理模块 (`driver`)

#### 模块特性
- 司机列表展示（支持搜索、筛选、分页）
- 司机信息添加/编辑表单
- 司机详情页面展示
- 驾驶证信息管理
- 状态管理（在职、请假、停职、离职）

#### 快速使用
```typescript
import { DriverModule } from '@jhm/shared-features';

@NgModule({
  imports: [DriverModule]
})
export class AppModule { }
```

#### 组件使用示例
```typescript
import { Component } from '@angular/core';
import { Driver, SearchParams } from '@jhm/shared-features';

@Component({
  selector: 'app-driver-page',
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
export class DriverPageComponent {
  drivers: Driver[] = [];
  loading = false;
  total = 0;
  page = 1;
  size = 10;
  searchParams: SearchParams = { page: 1, size: 10 };

  onSearchChange(params: SearchParams): void {
    this.searchParams = params;
    this.loadDrivers();
  }

  private loadDrivers(): void {
    this.loading = true;
    // 调用实际API
    // this.driverService.getDrivers(this.searchParams).subscribe(...)
    setTimeout(() => {
      this.drivers = this.getMockDrivers();
      this.total = this.drivers.length;
      this.loading = false;
    }, 1000);
  }
}
```

#### 数据模型
```typescript
interface Driver {
  id: number;
  organizationId: number;
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  idCard: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  licenseInfo: {
    licenseNumber: string;
    licenseType: string;
    issueDate: Date;
    expiryDate: Date;
    issuingAuthority: string;
  };
  status: DriverStatus;
  hireDate: Date;
  notes?: string;
}

enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}
```

### 2. 业务管理模块 (`business`) ⭐ 核心模块

业务管理模块是整个库的核心，包含证件管理、保险管理、到期提醒和审批流程等复杂功能。

#### 模块结构
```
business/
├── components/
│   ├── license-list/         # 证件列表组件
│   ├── license-form/         # 证件表单组件
│   ├── license-detail/       # 证件详情组件
│   ├── insurance-list/       # 保险列表组件
│   ├── insurance-form/       # 保险表单组件
│   ├── insurance-detail/     # 保险详情组件
│   ├── expiry-dashboard/     # 到期提醒仪表盘
│   └── approval-list/        # 审批列表组件
```

#### 司机证件管理

##### 证件列表组件
```typescript
import { Component } from '@angular/core';
import { DriverLicense, LicenseType, LicenseStatus } from '@jhm/shared-features';

@Component({
  selector: 'app-license-management',
  template: `
    <div class="license-management">
      <div class="page-header">
        <h1>司机证件管理</h1>
        <button ion-button color="primary" (click)="onAddLicense()">
          添加证件
        </button>
      </div>
      
      <sf-license-list
        [licenses]="licenses"
        [loading]="loading"
        [total]="total"
        (licenseSelect)="onViewLicense($event)"
        (licenseEdit)="onEditLicense($event)"
        (licenseDelete)="onDeleteLicense($event)"
        (licenseRenewal)="onRenewLicense($event)"
        (expiryCheck)="onCheckExpiry($event)">
      </sf-license-list>
      
      <sf-expiry-dashboard
        [expiringSoon]="expiringSoonLicenses"
        [expired]="expiredLicenses"
        [totalStats]="licenseStats"
        (renewalRequest)="onRenewalRequest($event)"
        (bulkAction)="onBulkAction($event)">
      </sf-expiry-dashboard>
    </div>
  `
})
export class LicenseManagementComponent {
  licenses: DriverLicense[] = [];
  expiringSoonLicenses: DriverLicense[] = [];
  expiredLicenses: DriverLicense[] = [];
  licenseStats = {
    total: 0,
    valid: 0,
    expiringSoon: 0,
    expired: 0
  };

  onLicenseRenewal(license: DriverLicense): void {
    // 跳转到续期页面或打开续期表单
    this.router.navigate(['/business/licenses', license.id, 'renew']);
  }

  onRenewalRequest(request: RenewalRequest): void {
    // 处理续期申请
    this.approvalService.submitRenewal(request).subscribe(...);
  }
}
```

##### 证件表单组件
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverLicense, LicenseType } from '@jhm/shared-features';

@Component({
  selector: 'sf-license-form',
  template: `
    <div class="license-form-container">
      <form [formGroup]="licenseForm" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>基本信息</h3>
          
          <div class="form-row">
            <label>司机</label>
            <select formControlName="driverId" required>
              <option value="">请选择司机</option>
              <option *ngFor="let driver of drivers" [value]="driver.id">
                {{ driver.name }} ({{ driver.employeeId }})
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <label>证件类型</label>
            <select formControlName="licenseType" required>
              <option value="">请选择证件类型</option>
              <option value="DRIVER_LICENSE">驾驶证</option>
              <option value="TRANSPORT_CERTIFICATE">运输从业资格证</option>
              <option value="HEALTH_CERTIFICATE">健康证</option>
              <option value="ROAD_TRANSPORT_CERTIFICATE">道路运输证</option>
            </select>
          </div>
          
          <div class="form-row">
            <label>证件号</label>
            <input type="text" formControlName="licenseNumber" required>
          </div>
          
          <div class="form-row">
            <label>发证日期</label>
            <input type="date" formControlName="issueDate" required>
          </div>
          
          <div class="form-row">
            <label>到期日期</label>
            <input type="date" formControlName="expiryDate" required>
          </div>
          
          <div class="form-row">
            <label>发证机关</label>
            <input type="text" formControlName="issuingAuthority" required>
          </div>
        </div>
        
        <div class="form-section">
          <h3>附件信息</h3>
          <sf-file-upload
            [accept]="'image/*,.pdf'"
            [multiple]="true"
            [maxSize]="5242880"
            (uploadComplete)="onFileUpload($event)">
          </sf-file-upload>
        </div>
        
        <div class="form-section">
          <h3>备注</h3>
          <textarea formControlName="notes" rows="3"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">
            取消
          </button>
          <button type="submit" class="btn-primary" [disabled]="!licenseForm.valid">
            {{ mode === 'create' ? '创建' : '更新' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./license-form.component.scss']
})
export class LicenseFormComponent {
  @Input() license: DriverLicense | null = null;
  @Input() drivers: any[] = [];
  @Input() mode: 'create' | 'edit' | 'renew' = 'create';
  @Output() save = new EventEmitter<DriverLicense>();
  @Output() cancel = new EventEmitter<void>();

  licenseForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.licenseForm = this.fb.group({
      driverId: ['', Validators.required],
      licenseType: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      issuingAuthority: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnChanges(): void {
    if (this.license && this.mode !== 'create') {
      this.licenseForm.patchValue(this.license);
    }
  }

  onSubmit(): void {
    if (this.licenseForm.valid) {
      const licenseData = {
        ...this.licenseForm.value,
        id: this.license?.id,
        mode: this.mode
      };
      this.save.emit(licenseData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
```

#### 到期提醒仪表盘

##### 仪表盘组件
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DriverLicense, VehicleInsurance } from '@jhm/shared-features';

interface ExpiryStats {
  licenses: {
    valid: number;
    expiringSoon: number;
    expired: number;
  };
  insurance: {
    valid: number;
    expiringSoon: number;
    expired: number;
  };
}

@Component({
  selector: 'sf-expiry-dashboard',
  template: `
    <div class="expiry-dashboard">
      <h2>到期提醒仪表盘</h2>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number text-success">{{ totalStats.licenses.valid }}</div>
          <div class="stat-label">有效证件</div>
        </div>
        <div class="stat-card">
          <div class="stat-number text-warning">{{ totalStats.licenses.expiringSoon }}</div>
          <div class="stat-label">即将到期证件</div>
        </div>
        <div class="stat-card">
          <div class="stat-number text-error">{{ totalStats.licenses.expired }}</div>
          <div class="stat-label">已过期证件</div>
        </div>
        <div class="stat-card">
          <div class="stat-number text-info">{{ totalStats.insurance.valid }}</div>
          <div class="stat-label">有效保险</div>
        </div>
      </div>
      
      <!-- 即将到期列表 -->
      <div class="expiry-section">
        <h3>即将到期 (30天内)</h3>
        <div class="expiry-list">
          <div *ngFor="let item of expiringSoonItems" class="expiry-item">
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-details">
                {{ item.type }} - 到期日期: {{ item.expiryDate | date:'yyyy-MM-dd' }}
              </div>
            </div>
            <div class="item-actions">
              <span class="days-left" [class.urgent]="item.daysLeft <= 7">
                {{ item.daysLeft }} 天
              </span>
              <button class="btn-sm btn-warning" (click)="onRenewalRequest(item)">
                续期
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 已过期列表 -->
      <div class="expiry-section" *ngIf="expiredItems.length > 0">
        <h3>已过期</h3>
        <div class="expiry-list">
          <div *ngFor="let item of expiredItems" class="expiry-item expired">
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-details">
                {{ item.type }} - 到期日期: {{ item.expiryDate | date:'yyyy-MM-dd' }}
              </div>
            </div>
            <div class="item-actions">
              <span class="days-left expired">{{ item.daysExpired }} 天前过期</span>
              <button class="btn-sm btn-error" (click)="onRenewalRequest(item)">
                立即续期
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 批量操作 -->
      <div class="bulk-actions" *ngIf="hasExpiringItems()">
        <h3>批量操作</h3>
        <button class="btn-primary" (click)="onBulkRenewal()">
          批量续期申请
        </button>
        <button class="btn-secondary" (click)="onExportReport()">
          导出提醒报告
        </button>
      </div>
    </div>
  `
})
export class ExpiryDashboardComponent {
  @Input() expiringSoon: (DriverLicense | VehicleInsurance)[] = [];
  @Input() expired: (DriverLicense | VehicleInsurance)[] = [];
  @Input() totalStats: ExpiryStats;
  @Output() renewalRequest = new EventEmitter<any>();
  @Output() bulkAction = new EventEmitter<string>();

  onRenewalRequest(item: any): void {
    this.renewalRequest.emit({
      type: item.type,
      id: item.id,
      action: 'renewal'
    });
  }

  onBulkRenewal(): void {
    this.bulkAction.emit('bulk_renewal');
  }

  hasExpiringItems(): boolean {
    return this.expiringSoon.length > 0 || this.expired.length > 0;
  }
}
```

#### 审批流程管理

##### 审批列表组件
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApprovalWorkflow, ApprovalStatus } from '@jhm/shared-features';

@Component({
  selector: 'sf-approval-list',
  template: `
    <div class="approval-list">
      <div class="list-header">
        <h2>审批管理</h2>
        <div class="filter-tabs">
          <button 
            *ngFor="let status of approvalStatuses"
            [class.active]="currentStatus === status.value"
            (click)="onStatusFilter(status.value)">
            {{ status.label }} ({{ getCountByStatus(status.value) }})
          </button>
        </div>
      </div>
      
      <div class="approval-items">
        <div *ngFor="let workflow of filteredWorkflows" class="approval-item">
          <div class="item-header">
            <div class="item-title">
              <h4>{{ getWorkflowTitle(workflow) }}</h4>
              <span class="workflow-type">{{ getWorkflowTypeText(workflow.workflowType) }}</span>
            </div>
            <div class="item-meta">
              <span class="submit-date">提交时间: {{ workflow.submittedAt | date:'yyyy-MM-dd HH:mm' }}</span>
              <span class="applicant">申请人: {{ workflow.applicantName }}</span>
            </div>
          </div>
          
          <div class="item-content">
            <div class="request-info">
              <h5>申请信息</h5>
              <div class="info-grid">
                <div class="info-item" *ngFor="let item of getRequestInfo(workflow)">
                  <label>{{ item.label }}:</label>
                  <span>{{ item.value }}</span>
                </div>
              </div>
            </div>
            
            <div class="request-data" *ngIf="workflow.requestData">
              <h5>申请详情</h5>
              <pre>{{ workflow.requestData | json }}</pre>
            </div>
          </div>
          
          <div class="item-actions" *ngIf="workflow.status === 'PENDING'">
            <button class="btn-success" (click)="onApprove(workflow)">
              同意
            </button>
            <button class="btn-error" (click)="onReject(workflow)">
              拒绝
            </button>
            <button class="btn-secondary" (click)="onRequestInfo(workflow)">
              补充材料
            </button>
          </div>
          
          <div class="item-status" *ngIf="workflow.status !== 'PENDING'">
            <sf-status-badge 
              [status]="workflow.status"
              [class]="getStatusBadgeClass(workflow.status)"
              [text]="getStatusText(workflow.status)">
            </sf-status-badge>
          </div>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="filteredWorkflows.length === 0">
        <ion-icon name="document-outline" size="large"></ion-icon>
        <h3>暂无审批事项</h3>
        <p>所有申请已处理完成</p>
      </div>
    </div>
  `
})
export class ApprovalListComponent {
  @Input() workflows: ApprovalWorkflow[] = [];
  @Output() approve = new EventEmitter<ApprovalWorkflow>();
  @Output() reject = new EventEmitter<ApprovalWorkflow>();
  @Output() requestInfo = new EventEmitter<ApprovalWorkflow>();

  currentStatus: ApprovalStatus | 'ALL' = 'ALL';
  
  approvalStatuses = [
    { label: '全部', value: 'ALL' },
    { label: '待审批', value: ApprovalStatus.PENDING },
    { label: '已同意', value: ApprovalStatus.APPROVED },
    { label: '已拒绝', value: ApprovalStatus.REJECTED }
  ];

  get filteredWorkflows(): ApprovalWorkflow[] {
    if (this.currentStatus === 'ALL') {
      return this.workflows;
    }
    return this.workflows.filter(w => w.status === this.currentStatus);
  }

  onApprove(workflow: ApprovalWorkflow): void {
    this.approve.emit(workflow);
  }

  onReject(workflow: ApprovalWorkflow): void {
    this.reject.emit(workflow);
  }

  getStatusText(status: ApprovalStatus): string {
    const statusMap = {
      [ApprovalStatus.PENDING]: '待审批',
      [ApprovalStatus.APPROVED]: '已同意',
      [ApprovalStatus.REJECTED]: '已拒绝',
      [ApprovalStatus.CANCELLED]: '已取消'
    };
    return statusMap[status] || status;
  }
}
```

### 3. 通用组件库使用

#### 数据表格组件
```typescript
import { Component } from '@angular/core';
import { TableConfig } from '@jhm/shared-features';

@Component({
  selector: 'app-data-table-demo',
  template: `
    <sf-data-table
      [data]="data"
      [config]="tableConfig"
      [loading]="loading"
      [total]="total"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (rowClick)="onRowClick($event)"
      [actionButtons]="actionButtons"
      (actionClick)="onActionClick($event)">
    </sf-data-table>
  `
})
export class DataTableDemoComponent {
  data: any[] = [];
  loading = false;
  total = 0;

  tableConfig: TableConfig = {
    columns: [
      {
        key: 'name',
        label: '姓名',
        sortable: true,
        width: '150px'
      },
      {
        key: 'status',
        label: '状态',
        sortable: true,
        formatter: (value) => this.getStatusText(value)
      },
      {
        key: 'createdAt',
        label: '创建时间',
        sortable: true,
        formatter: (value) => new Date(value).toLocaleDateString()
      }
    ],
    pagination: {
      pageSize: 10,
      pageSizeOptions: [10, 20, 50, 100]
    },
    sorting: {
      defaultSort: { key: 'createdAt', direction: 'desc' }
    },
    selection: {
      enabled: true,
      mode: 'multiple'
    }
  };

  actionButtons = [
    {
      key: 'view',
      label: '查看',
      type: 'primary',
      icon: 'eye',
      handler: (row) => this.onView(row)
    },
    {
      key: 'edit',
      label: '编辑',
      type: 'secondary',
      icon: 'create',
      handler: (row) => this.onEdit(row)
    }
  ];

  onPageChange(event: any): void {
    console.log('分页变化:', event);
  }

  onSortChange(event: any): void {
    console.log('排序变化:', event);
  }
}
```

#### 文件上传组件
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-file-upload-demo',
  template: `
    <sf-file-upload
      [accept]="'.pdf,.doc,.docx,.jpg,.png'"
      [multiple]="true"
      [maxSize]="10485760"
      [maxCount]="5"
      [uploadUrl]="'/api/upload'"
      (uploadStart)="onUploadStart()"
      (uploadProgress)="onUploadProgress($event)"
      (uploadComplete)="onUploadComplete($event)"
      (uploadError)="onUploadError($event)">
      
      <div class="upload-area">
        <ion-icon name="cloud-upload-outline" size="large"></ion-icon>
        <p>点击或拖拽文件到此处上传</p>
        <small>支持 PDF, DOC, DOCX, JPG, PNG 格式，单个文件不超过 10MB</small>
      </div>
    </sf-file-upload>
  `
})
export class FileUploadDemoComponent {
  onUploadStart(): void {
    console.log('开始上传');
  }

  onUploadProgress(event: any): void {
    console.log('上传进度:', event);
  }

  onUploadComplete(files: any[]): void {
    console.log('上传完成:', files);
  }

  onUploadError(error: any): void {
    console.error('上传错误:', error);
  }
}
```

## 🎨 样式和主题集成

### CSS变量使用
```scss
// 使用主题系统的CSS变量
.my-component {
  background-color: var(--jhm-bg-primary);
  color: var(--jhm-text-primary);
  border: 1px solid var(--jhm-border-light);
  border-radius: var(--jhm-radius-lg);
  padding: var(--jhm-space-4);
  margin: var(--jhm-space-2);
  box-shadow: var(--jhm-shadow-sm);

  // 响应式设计
  @media (max-width: 767px) {
    padding: var(--jhm-space-2);
    margin: var(--jhm-space-1);
  }

  // 深色主题适配
  [data-theme="dark"] & {
    background-color: var(--jhm-bg-secondary);
    border-color: var(--jhm-border-medium);
  }
}
```

### 实用工具类
```html
<!-- 间距工具类 -->
<div class="p-4 m-2">内边距16px，外边距8px</div>
<div class="px-3 py-2">水平内边距12px，垂直内边距8px</div>

<!-- 颜色工具类 -->
<p class="text-success">成功文字</p>
<p class="text-warning">警告文字</p>
<p class="text-error">错误文字</p>

<!-- 背景工具类 -->
<div class="bg-primary rounded-lg shadow-md">主要背景卡片</div>

<!-- 响应式工具类 -->
<div class="mobile-hidden desktop-block">
  移动端隐藏，桌面端显示
</div>
```

## 🔧 配置和自定义

### 自定义表格列
```typescript
const customTableConfig: TableConfig<Driver> = {
  columns: [
    {
      key: 'name',
      label: '姓名',
      sortable: true,
      width: '120px',
      formatter: (value, row) => `${value} (${row.employeeId})`
    },
    {
      key: 'licenseInfo',
      label: '驾驶证',
      formatter: (value) => value?.licenseNumber || '未设置'
    }
  ]
};
```

### 自定义表单字段
```typescript
const licenseFormConfig: FormConfig = {
  fields: [
    {
      key: 'licenseType',
      label: '证件类型',
      type: 'select',
      required: true,
      options: [
        { label: '驾驶证', value: 'DRIVER_LICENSE' },
        { label: '运输从业资格证', value: 'TRANSPORT_CERTIFICATE' },
        { label: '健康证', value: 'HEALTH_CERTIFICATE' }
      ]
    },
    {
      key: 'expiryDate',
      label: '到期日期',
      type: 'date',
      required: true,
      validation: {
        custom: (value) => {
          const expiryDate = new Date(value);
          const today = new Date();
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(today.getFullYear() + 1);
          
          if (expiryDate < today) {
            return '到期日期不能早于今天';
          }
          if (expiryDate > oneYearFromNow) {
            return '到期日期不能超过一年';
          }
          return null;
        }
      }
    }
  ]
};
```

## 📊 最佳实践

### 1. 组件通信
```typescript
// 使用@Input和@Output进行父子组件通信
export class ParentComponent {
  data: any[] = [];
  
  onChildEvent(eventData: any): void {
    console.log('收到子组件事件:', eventData);
    // 处理事件逻辑
  }
}
```

### 2. 错误处理
```typescript
export class DataService {
  loadData(): Observable<any[]> {
    return this.http.get<any[]>('/api/data').pipe(
      catchError(error => {
        console.error('数据加载失败:', error);
        return of([]); // 返回空数组作为fallback
      })
    );
  }
}
```

### 3. 性能优化
```typescript
// 使用OnPush变化检测策略
@Component({
  selector: 'sf-optimized-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class OptimizedTableComponent {
  // 组件逻辑
}
```

### 4. 响应式设计
```scss
// 移动优先的响应式设计
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--jhm-space-2);

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--jhm-space-4);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--jhm-space-6);
  }
}
```

## 🚀 部署和构建

### 构建库
```bash
# 构建主题系统
ng build theme-system

# 构建通用功能模块
ng build shared-features
```

### 打包发布
```bash
# 创建发布包
npm run build:libs

# 发布到npm
npm publish dist/theme-system
npm publish dist/shared-features
```

## 📝 注意事项

### 1. 兼容性
- Angular 20+ 版本
- Ionic 8+ 版本
- 支持现代浏览器 (Chrome 88+, Firefox 85+, Safari 14+)

### 2. 性能考虑
- 使用 OnPush 变化检测策略
- 避免在模板中使用复杂表达式
- 合理使用 async 管道

### 3. 可访问性
- 提供语义化 HTML 结构
- 支持键盘导航
- 使用适当的 ARIA 标签
- 确保颜色对比度符合 WCAG 标准

这个通用功能模块库为金鸿马物流安全平台提供了完整的前端解决方案，支持多种客户端应用，大大提高了开发效率和代码复用性。
