import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Driver, DriverStatus, SearchParams, PaginatedResult } from '../../../models/interfaces';

/**
 * 司机列表页面组件
 * 作为司机管理功能的容器页面，负责协调各个组件
 */
@Component({
  selector: 'sf-driver-list-page',
  templateUrl: './driver-list-page.component.html',
  styleUrls: ['./driver-list-page.component.scss']
})
export class DriverListPageComponent implements OnInit, OnDestroy {
  drivers: Driver[] = [];
  loading = false;
  total = 0;
  page = 1;
  size = 10;
  searchParams: SearchParams = { page: 1, size: 10 };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[司机列表页] 页面初始化');
    this.loadDrivers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 加载司机数据
   */
  private loadDrivers(): void {
    this.loading = true;
    
    // TODO: 这里应该调用实际的API
    // 暂时使用模拟数据
    setTimeout(() => {
      this.drivers = this.getMockDrivers();
      this.total = this.drivers.length;
      this.loading = false;
    }, 1000);
  }

  /**
   * 处理搜索变化
   */
  onSearchChange(params: SearchParams): void {
    this.searchParams = params;
    this.page = params.page;
    this.size = params.size;
    this.loadDrivers();
  }

  /**
   * 处理分页变化
   */
  onPageChange(page: number): void {
    this.page = page;
    this.searchParams.page = page;
    this.loadDrivers();
  }

  /**
   * 处理页面大小变化
   */
  onSizeChange(size: number): void {
    this.size = size;
    this.page = 1;
    this.searchParams.size = size;
    this.searchParams.page = 1;
    this.loadDrivers();
  }

  /**
   * 处理查看司机
   */
  onViewDriver(driver: Driver): void {
    this.router.navigate(['/drivers', driver.id]);
  }

  /**
   * 处理编辑司机
   */
  onEditDriver(driver: Driver): void {
    this.router.navigate(['/drivers', driver.id, 'edit']);
  }

  /**
   * 处理删除司机
   */
  onDeleteDriver(driver: Driver): void {
    // TODO: 实现删除逻辑
    console.log('[司机列表页] 删除司机:', driver);
  }

  /**
   * 处理添加司机
   */
  onAddDriver(): void {
    this.router.navigate(['/drivers/create']);
  }

  /**
   * 获取模拟司机数据
   */
  private getMockDrivers(): Driver[] {
    return [
      {
        id: 1,
        organizationId: 1,
        employeeId: 'DRV001',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        idCard: '110101199001011234',
        address: '北京市朝阳区建国路1号',
        emergencyContact: {
          name: '李四',
          phone: '13900139001',
          relationship: '配偶'
        },
        licenseInfo: {
          licenseNumber: '110101199001011234A',
          licenseType: 'A2',
          issueDate: new Date('2020-01-01'),
          expiryDate: new Date('2026-01-01'),
          issuingAuthority: '北京市交通管理局'
        },
        status: DriverStatus.ACTIVE,
        hireDate: new Date('2020-01-01'),
        notes: '经验丰富，驾驶技能优秀',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date(),
        createdByUserId: 1,
        updatedByUserId: 1,
        deletedAt: undefined,
        version: 1
      },
      {
        id: 2,
        organizationId: 1,
        employeeId: 'DRV002',
        name: '王五',
        phone: '13800138002',
        email: 'wangwu@example.com',
        idCard: '110101199002021234',
        address: '北京市海淀区中关村大街2号',
        emergencyContact: {
          name: '赵六',
          phone: '13900139002',
          relationship: '配偶'
        },
        licenseInfo: {
          licenseNumber: '110101199002021234B',
          licenseType: 'B2',
          issueDate: new Date('2019-05-01'),
          expiryDate: new Date('2025-05-01'),
          issuingAuthority: '北京市交通管理局'
        },
        status: DriverStatus.ON_LEAVE,
        hireDate: new Date('2019-05-01'),
        notes: '',
        createdAt: new Date('2019-05-01'),
        updatedAt: new Date(),
        createdByUserId: 1,
        updatedByUserId: 1,
        deletedAt: undefined,
        version: 1
      }
    ];
  }
}
