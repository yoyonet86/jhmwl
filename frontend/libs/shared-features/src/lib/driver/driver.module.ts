import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// 导入共享模块
import { SharedModule } from '../shared/shared.module';

// 导入页面组件
import { DriverListPageComponent } from './pages/driver-list/driver-list-page.component';
import { DriverFormPageComponent } from './pages/driver-form/driver-form-page.component';
import { DriverDetailPageComponent } from './pages/driver-detail/driver-detail-page.component';

// 导入组件
import { DriverListComponent } from './components/driver-list/driver-list.component';
import { DriverFormComponent } from './components/driver-form/driver-form.component';
import { DriverDetailComponent } from './components/driver-detail/driver-detail.component';

/**
 * 司机管理模块
 * 
 * 提供司机信息管理的完整UI框架，包括：
 * - 司机列表页面（搜索、筛选、分页）
 * - 司机添加/编辑页面（表单）
 * - 司机详情页面（信息展示）
 * 
 * @note 该模块仅提供UI结构，业务逻辑由各客户端实现
 */
const routes: Routes = [
  {
    path: '',
    component: DriverListPageComponent,
    data: { title: '司机列表' }
  },
  {
    path: 'create',
    component: DriverFormPageComponent,
    data: { title: '添加司机', mode: 'create' }
  },
  {
    path: ':id',
    component: DriverDetailPageComponent,
    data: { title: '司机详情' }
  },
  {
    path: ':id/edit',
    component: DriverFormPageComponent,
    data: { title: '编辑司机', mode: 'edit' }
  }
];

@NgModule({
  declarations: [
    // 页面组件
    DriverListPageComponent,
    DriverFormPageComponent,
    DriverDetailPageComponent,
    
    // 业务组件
    DriverListComponent,
    DriverFormComponent,
    DriverDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    // 导出组件供其他模块使用
    DriverListComponent,
    DriverFormComponent,
    DriverDetailComponent
  ]
})
export class DriverModule {
  constructor() {
    console.log('[司机管理模块] DriverModule 已初始化');
  }
}
