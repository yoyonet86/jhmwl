import { Component } from '@angular/core';

@Component({
  selector: 'app-safety',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>安全管理</h1>
        <p>管理安全事件、事故报告和安全培训</p>
        <ion-button color="danger" [routerLink]="['/safety/incident/create']">
          <ion-icon name="warning" slot="start"></ion-icon>
          报告事件
        </ion-button>
      </div>

      <div class="page-content">
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-danger);">
                  <ion-icon name="warning"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.activeIncidents }}</h2>
                  <p>活跃事件</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-success);">
                  <ion-icon name="shield-checkmark"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.safetyScore }}</h2>
                  <p>安全评分</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <div class="stat-icon" style="color: var(--ion-color-warning);">
                  <ion-icon name="notifications"></ion-icon>
                </div>
                <div class="stat-info">
                  <h2>{{ stats.pendingReviews }}</h2>
                  <p>待审核</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <ion-card>
          <ion-card-header>
            <ion-card-title>最近安全事件</ion-card-title>
            <ion-card-subtitle>{{ incidents.length }} 个事件记录</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let incident of incidents">
                <ion-icon name="warning" slot="start" [style.color]="getIncidentColor(incident.severity)"></ion-icon>
                <ion-label>
                  <h2>{{ incident.title }}</h2>
                  <p>{{ incident.description }}</p>
                  <p>状态: {{ incident.status }} | 严重程度: {{ incident.severity }}</p>
                </ion-label>
                <ion-button fill="outline" size="small" [routerLink]="['/safety/incident', incident.id]">
                  查看
                </ion-button>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: var(--ion-color-dark);
    }

    .page-header p {
      margin: 0;
      color: var(--ion-color-medium);
      font-size: 1rem;
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

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SafetyComponent {
  stats = {
    activeIncidents: 3,
    safetyScore: 87,
    pendingReviews: 5
  };

  incidents = [
    {
      id: 1,
      title: '轻微碰撞事件',
      description: '车辆在停车场轻微碰撞，无人员受伤',
      status: '调查中',
      severity: '低'
    },
    {
      id: 2,
      title: '违规停车',
      description: '司机在禁停区域停车，已教育提醒',
      status: '已结案',
      severity: '低'
    },
    {
      id: 3,
      title: '疲劳驾驶警告',
      description: '连续驾驶超过4小时，已强制休息',
      status: '已处理',
      severity: '中'
    }
  ];

  getIncidentColor(severity: string): string {
    const colors: { [key: string]: string } = {
      '低': 'var(--ion-color-success)',
      '中': 'var(--ion-color-warning)',
      '高': 'var(--ion-color-danger)'
    };
    return colors[severity] || 'var(--ion-color-medium)';
  }
}