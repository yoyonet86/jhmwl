import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Driver, DriverStatus, SearchParams, PaginatedResult } from '../../../models/interfaces';
import { TableConfig, SearchFilter, ActionButton } from '../../../models/types';

/**
 * 司机列表组件
 * 
 * 提供司机信息的数据展示、搜索、筛选、分页等功能
 * 仅负责UI展示，业务逻辑由父组件处理
 */
@Component({
  selector: 'sf-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss']
})
export class DriverListComponent implements OnInit, OnDestroy {
  @Input() drivers: Driver[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() page = 1;
  @Input() size = 10;
  @Input() searchParams: SearchParams = { page: 1, size: 10 };
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<SearchParams>();
  @Output() driverSelect = new EventEmitter<Driver>();
  @Output() driverEdit = new EventEmitter<Driver>();
  @Output() driverDelete = new EventEmitter<Driver>();

  private destroy$ = new Subject<void>();

  // 表格配置
  tableConfig: TableConfig<Driver> = {
    columns: [
      {
        key: 'employeeId',
        label: '员工编号',
        sortable: true
      },
      {
        key: 'name',
        label: '姓名',
        sortable: true
      },
      {
        key: 'phone',
        label: '联系电话',
        sortable: false
      },
      {
        key: 'licenseInfo',
        label: '驾驶证号',
        sortable: false,
        formatter: (value) => value.licenseNumber
      },
      {
        key: 'status',
        label: '状态',
        sortable: true,
        formatter: (value) => this.getStatusText(value)
      },
      {
        key: 'hireDate',
        label: '入职日期',
        sortable: true,
        formatter: (value) => new Date(value).toLocaleDateString()
      }
    ],
    pagination: {
      pageSize: 10,
      pageSizeOptions: [10, 20, 50, 100]
    },
    sorting: {
      defaultSort: { key: 'name', direction: 'asc' }
    },
    selection: {
      enabled: false,
      mode: 'multiple'
    }
  };

  // 搜索条件配置
  searchFilters: SearchFilter[] = [
    {
      key: 'keyword',
      label: '搜索关键词',
      type: 'text',
      placeholder: '请输入姓名、员工编号或联系电话'
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '在职', value: DriverStatus.ACTIVE },
        { label: '请假', value: DriverStatus.ON_LEAVE },
        { label: '停职', value: DriverStatus.SUSPENDED },
        { label: '离职', value: DriverStatus.INACTIVE }
      ]
    },
    {
      key: 'licenseType',
      label: '驾驶证类型',
      type: 'select',
      placeholder: '选择驾驶证类型'
    }
  ];

  // 操作按钮配置
  actionButtons: ActionButton[] = [
    {
      key: 'view',
      label: '查看',
      type: 'primary',
      icon: 'eye',
      handler: (driver) => this.onViewDriver(driver)
    },
    {
      key: 'edit',
      label: '编辑',
      type: 'secondary',
      icon: 'create',
      handler: (driver) => this.onEditDriver(driver)
    },
    {
      key: 'delete',
      label: '删除',
      type: 'danger',
      icon: 'trash',
      handler: (driver) => this.onDeleteDriver(driver),
      visible: (driver) => driver.status !== DriverStatus.ACTIVE
    }
  ];

  ngOnInit(): void {
    console.log('[司机列表] 组件初始化');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 处理页面变化
   */
  onPageChange(event: { page: number; size: number }): void {
    this.pageChange.emit(event.page);
    this.sizeChange.emit(event.size);
    this.emitSearchChange();
  }

  /**
   * 处理搜索变化
   */
  onSearchChange(filters: any): void {
    this.searchChange.emit({ ...this.searchParams, ...filters, page: 1 });
  }

  /**
   * 处理排序变化
   */
  onSortChange(event: { key: keyof Driver; direction: 'asc' | 'desc' }): void {
    this.searchChange.emit({
      ...this.searchParams,
      sortBy: String(event.key),
      sortDirection: event.direction,
      page: 1
    });
  }

  /**
   * 处理查看司机
   */
  onViewDriver(driver: Driver): void {
    this.driverSelect.emit(driver);
  }

  /**
   * 处理编辑司机
   */
  onEditDriver(driver: Driver): void {
    this.driverEdit.emit(driver);
  }

  /**
   * 处理删除司机
   */
  onDeleteDriver(driver: Driver): void {
    this.driverDelete.emit(driver);
  }

  /**
   * 获取状态显示文本
   */
  private getStatusText(status: DriverStatus): string {
    const statusMap = {
      [DriverStatus.ACTIVE]: '在职',
      [DriverStatus.INACTIVE]: '离职',
      [DriverStatus.ON_LEAVE]: '请假',
      [DriverStatus.SUSPENDED]: '停职'
    };
    return statusMap[status] || status;
  }

  /**
   * 获取状态徽章样式
   */
  getStatusBadgeClass(status: DriverStatus): string {
    const classMap = {
      [DriverStatus.ACTIVE]: 'badge-success',
      [DriverStatus.INACTIVE]: 'badge-secondary',
      [DriverStatus.ON_LEAVE]: 'badge-warning',
      [DriverStatus.SUSPENDED]: 'badge-error'
    };
    return classMap[status] || 'badge-info';
  }

  /**
   * 发送搜索变化事件
   */
  private emitSearchChange(): void {
    this.searchChange.emit(this.searchParams);
  }

  /**
   * 获取统计信息
   */
  getStats(): { total: number; active: number; inactive: number } {
    const total = this.drivers.length;
    const active = this.drivers.filter(d => d.status === DriverStatus.ACTIVE).length;
    const inactive = total - active;
    return { total, active, inactive };
  }
}
