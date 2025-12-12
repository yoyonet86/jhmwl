import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

// 页面组件
import { LicenseListPageComponent } from './pages/license-list/license-list-page.component';
import { LicenseDetailPageComponent } from './pages/license-detail/license-detail-page.component';
import { LicenseFormPageComponent } from './pages/license-form/license-form-page.component';
import { LicenseRenewalPageComponent } from './pages/license-renewal/license-renewal-page.component';
import { InsuranceListPageComponent } from './pages/insurance-list/insurance-list-page.component';
import { InsuranceDetailPageComponent } from './pages/insurance-detail/insurance-detail-page.component';
import { InsuranceFormPageComponent } from './pages/insurance-form/insurance-form-page.component';
import { InsuranceRenewalPageComponent } from './pages/insurance-renewal/insurance-renewal-page.component';
import { ExpiryDashboardPageComponent } from './pages/expiry-dashboard/expiry-dashboard-page.component';
import { ApprovalListPageComponent } from './pages/approval-list/approval-list-page.component';

// 业务组件
import { LicenseListComponent } from './components/license-list/license-list.component';
import { LicenseFormComponent } from './components/license-form/license-form.component';
import { LicenseDetailComponent } from './components/license-detail/license-detail.component';
import { InsuranceListComponent } from './components/insurance-list/insurance-list.component';
import { InsuranceFormComponent } from './components/insurance-form/insurance-form.component';
import { InsuranceDetailComponent } from './components/insurance-detail/insurance-detail.component';
import { ExpiryDashboardComponent } from './components/expiry-dashboard/expiry-dashboard.component';
import { ApprovalListComponent } from './components/approval-list/approval-list.component';

/**
 * 业务管理模块
 * 
 * 提供司机证件管理和车辆保险管理的完整UI框架，包括：
 * - 司机证件管理（列表、详情、表单、续期）
 * - 车辆保险管理（列表、详情、表单、续期）
 * - 到期提醒仪表盘
 * - 审批流程管理
 */
const routes: Routes = [
  // 证件管理
  {
    path: 'licenses',
    component: LicenseListPageComponent,
    data: { title: '司机证件管理' }
  },
  {
    path: 'licenses/create',
    component: LicenseFormPageComponent,
    data: { title: '新增证件', mode: 'create' }
  },
  {
    path: 'licenses/:id',
    component: LicenseDetailPageComponent,
    data: { title: '证件详情' }
  },
  {
    path: 'licenses/:id/edit',
    component: LicenseFormPageComponent,
    data: { title: '编辑证件', mode: 'edit' }
  },
  {
    path: 'licenses/:id/renew',
    component: LicenseRenewalPageComponent,
    data: { title: '证件续期', mode: 'renew' }
  },

  // 保险管理
  {
    path: 'insurance',
    component: InsuranceListPageComponent,
    data: { title: '车辆保险管理' }
  },
  {
    path: 'insurance/create',
    component: InsuranceFormPageComponent,
    data: { title: '新增保险', mode: 'create' }
  },
  {
    path: 'insurance/:id',
    component: InsuranceDetailPageComponent,
    data: { title: '保险详情' }
  },
  {
    path: 'insurance/:id/edit',
    component: InsuranceFormPageComponent,
    data: { title: '编辑保险', mode: 'edit' }
  },
  {
    path: 'insurance/:id/renew',
    component: InsuranceRenewalPageComponent,
    data: { title: '保险续期', mode: 'renew' }
  },

  // 到期提醒和审批
  {
    path: 'expiry-dashboard',
    component: ExpiryDashboardPageComponent,
    data: { title: '到期提醒仪表盘' }
  },
  {
    path: 'approvals',
    component: ApprovalListPageComponent,
    data: { title: '审批管理' }
  }
];

@NgModule({
  declarations: [
    // 页面组件
    LicenseListPageComponent,
    LicenseDetailPageComponent,
    LicenseFormPageComponent,
    LicenseRenewalPageComponent,
    InsuranceListPageComponent,
    InsuranceDetailPageComponent,
    InsuranceFormPageComponent,
    InsuranceRenewalPageComponent,
    ExpiryDashboardPageComponent,
    ApprovalListPageComponent,

    // 业务组件
    LicenseListComponent,
    LicenseFormComponent,
    LicenseDetailComponent,
    InsuranceListComponent,
    InsuranceFormComponent,
    InsuranceDetailComponent,
    ExpiryDashboardComponent,
    ApprovalListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    // 导出组件供其他模块使用
    LicenseListComponent,
    LicenseFormComponent,
    LicenseDetailComponent,
    InsuranceListComponent,
    InsuranceFormComponent,
    InsuranceDetailComponent,
    ExpiryDashboardComponent,
    ApprovalListComponent
  ]
})
export class BusinessModule {
  constructor() {
    console.log('[业务管理模块] BusinessModule 已初始化');
  }
}
