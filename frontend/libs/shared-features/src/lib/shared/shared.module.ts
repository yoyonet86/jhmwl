import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// 导入通用组件
import { DataTableComponent } from './components/data-table/data-table.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { ActionToolbarComponent } from './components/action-toolbar/action-toolbar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { StatisticsCardComponent } from './components/statistics-card/statistics-card.component';
import { ChartComponent } from './components/chart/chart.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';

/**
 * 通用组件库模块
 * 
 * 提供可复用的UI组件，包括：
 * - 数据表格组件
 * - 搜索表单组件  
 * - 操作工具栏组件
 * - 加载状态组件
 * - 空状态组件
 * - 状态徽章组件
 * - 确认对话框组件
 * - 文件上传组件
 * - 统计卡片组件
 * - 图表组件
 * - 时间线组件
 * - 进度条组件
 */
@NgModule({
  declarations: [
    DataTableComponent,
    SearchFormComponent,
    ActionToolbarComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    FileUploadComponent,
    StatisticsCardComponent,
    ChartComponent,
    TimelineComponent,
    ProgressBarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    // 导出所有通用组件
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DataTableComponent,
    SearchFormComponent,
    ActionToolbarComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    FileUploadComponent,
    StatisticsCardComponent,
    ChartComponent,
    TimelineComponent,
    ProgressBarComponent
  ]
})
export class SharedModule {
  constructor() {
    console.log('[共享组件库] SharedModule 已初始化');
  }
}
