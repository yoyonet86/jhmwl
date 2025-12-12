import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ResponsiveLayoutService } from '../../services/responsive-layout.service';
import { User } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container" [class.mobile]="isMobile">
      <div class="dashboard-header">
        <h1>仪表盘</h1>
        <p>欢迎回来，{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
      </div>

      <div class="dashboard-content">
        <!-- Quick Stats Cards -->
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-primary);">
                  <ion-icon name="people"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.activeDrivers }}</h2>
                  <p>活跃司机</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-success);">
                  <ion-icon name="car"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.availableVehicles }}</h2>
                  <p>可用车辆</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-warning);">
                  <ion-icon name="document-text"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.pendingOrders }}</h2>
                  <p>待处理订单</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-danger);">
                  <ion-icon name="shield-alert"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.safetyIncidents }}</h2>
                  <p>安全事件</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Recent Activities -->
        <div class="dashboard-section">
          <h2>最近活动</h2>
          <ion-card>
            <ion-list>
              <ion-item *ngFor="let activity of recentActivities" lines="full">
                <ion-icon [name]="getActivityIcon(activity.type)" slot="start" 
                         [style.color]="getActivityColor(activity.type)"></ion-icon>
                <ion-label>
                  <h3>{{ activity.title }}</h3>
                  <p>{{ activity.description }}</p>
                  <p class="activity-time">{{ activity.timestamp | date:'short' }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-section">
          <h2>快速操作</h2>
          <div class="quick-actions-grid">
            <ion-button 
              *ngFor="let action of quickActions" 
              expand="block" 
              [color]="action.color"
              [routerLink]="action.route"
              class="quick-action-btn">
              <ion-icon [name]="action.icon" slot="start"></ion-icon>
              {{ action.label }}
            </ion-button>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="dashboard-section" *ngIf="alerts.length > 0">
          <h2>系统提醒</h2>
          <ion-list>
            <ion-item *ngFor="let alert of alerts" [color]="getAlertColor(alert.severity)">
              <ion-icon [name]="getAlertIcon(alert.severity)" slot="start"></ion-icon>
              <ion-label>
                <h3>{{ alert.title }}</h3>
                <p>{{ alert.message }}</p>
              </ion-label>
              <ion-button fill="clear" size="small" (click)="dismissAlert(alert.id)">
                <ion-icon name="close"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-container.mobile {
      padding: 1rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      margin: 0 0 0.5rem 0;
    }

    .dashboard-header p {
      font-size: 1.1rem;
      color: var(--ion-color-medium);
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
    }

    .stat-info h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: var(--ion-color-dark);
    }

    .stat-info p {
      margin: 0.25rem 0 0 0;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    .dashboard-section {
      margin-bottom: 2rem;
    }

    .dashboard-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      margin: 0 0 1rem 0;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .quick-action-btn {
      height: 60px;
      border-radius: 12px;
      font-weight: 600;
    }

    .activity-time {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .quick-action-btn {
        height: 50px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isMobile = false;

  stats = {
    activeDrivers: 45,
    availableVehicles: 32,
    pendingOrders: 18,
    safetyIncidents: 2
  };

  recentActivities = [
    {
      id: 1,
      type: 'order',
      title: '新订单创建',
      description: '订单 #ORD-2024-001 已创建',
      timestamp: new Date('2024-12-12T08:30:00'),
      icon: 'document-text',
      color: 'primary'
    },
    {
      id: 2,
      type: 'driver',
      title: '司机状态更新',
      description: '张三已完成今日最后一单',
      timestamp: new Date('2024-12-12T08:15:00'),
      icon: 'person',
      color: 'success'
    },
    {
      id: 3,
      type: 'vehicle',
      title: '车辆维护提醒',
      description: '车辆 #V001 需要进行定期保养',
      timestamp: new Date('2024-12-12T07:45:00'),
      icon: 'car',
      color: 'warning'
    }
  ];

  quickActions = [
    {
      label: '创建订单',
      icon: 'add-circle',
      route: '/orders/create',
      color: 'primary'
    },
    {
      label: '添加司机',
      icon: 'person-add',
      route: '/drivers/create',
      color: 'success'
    },
    {
      label: '车辆检查',
      icon: 'build',
      route: '/vehicles/inspection',
      color: 'warning'
    },
    {
      label: '安全报告',
      icon: 'shield-checkmark',
      route: '/safety/report',
      color: 'danger'
    }
  ];

  alerts = [
    {
      id: 1,
      severity: 'high',
      title: '驾驶证即将过期',
      message: '司机李四的驾驶证将在30天后过期'
    },
    {
      id: 2,
      severity: 'medium',
      title: '车辆需要保养',
      message: '3辆车辆即将到达保养里程'
    }
  ];

  constructor(
    private authService: AuthService,
    private layoutService: ResponsiveLayoutService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Subscribe to layout changes
    this.layoutService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
      });

    // Load dashboard data
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // TODO: Implement actual API calls to load dashboard data
    console.log('Loading dashboard data...');
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'order': 'document-text',
      'driver': 'person',
      'vehicle': 'car',
      'safety': 'shield-alert'
    };
    return icons[type] || 'information-circle';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'order': 'var(--ion-color-primary)',
      'driver': 'var(--ion-color-success)',
      'vehicle': 'var(--ion-color-warning)',
      'safety': 'var(--ion-color-danger)'
    };
    return colors[type] || 'var(--ion-color-medium)';
  }

  getAlertColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'light',
      'info': 'primary'
    };
    return colors[severity] || 'light';
  }

  getAlertIcon(severity: string): string {
    const icons: { [key: string]: string } = {
      'high': 'warning',
      'medium': 'information-circle',
      'low': 'checkbox',
      'info': 'information-circle'
    };
    return icons[severity] || 'information-circle';
  }

  dismissAlert(alertId: number): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }
}