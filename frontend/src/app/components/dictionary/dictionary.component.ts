import { Component } from '@angular/core';

@Component({
  selector: 'app-dictionary',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>字典管理</h1>
        <p>管理系统基础数据和配置项</p>
        <ion-button color="primary" [routerLink]="['/dictionary/create']">
          <ion-icon name="add-circle" slot="start"></ion-icon>
          添加字典项
        </ion-button>
      </div>

      <div class="page-content">
        <div class="dictionary-categories">
          <ion-card *ngFor="let category of categories" class="category-card">
            <ion-card-header>
              <ion-card-title>{{ category.name }}</ion-card-title>
              <ion-card-subtitle>{{ category.items.length }} 个配置项</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item *ngFor="let item of category.items">
                  <ion-label>
                    <h3>{{ item.name }} ({{ item.code }})</h3>
                    <p>{{ item.description }}</p>
                  </ion-label>
                  <ion-toggle 
                    [checked]="item.isActive" 
                    (ionChange)="toggleItem(category.code, item.id, $event)">
                  </ion-toggle>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>
        </div>
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

    .dictionary-categories {
      display: grid;
      gap: 1.5rem;
    }

    .category-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    }
  `]
})
export class DictionaryComponent {
  categories = [
    {
      name: '车辆类型',
      code: 'vehicle_types',
      items: [
        { id: 1, name: '货车', code: 'TRUCK', description: '大型货运车辆', isActive: true },
        { id: 2, name: '面包车', code: 'VAN', description: '轻型货运车辆', isActive: true },
        { id: 3, name: '轿车', code: 'CAR', description: '小型乘用车辆', isActive: false }
      ]
    },
    {
      name: '订单状态',
      code: 'order_status',
      items: [
        { id: 4, name: '待确认', code: 'PENDING', description: '订单待客户确认', isActive: true },
        { id: 5, name: '进行中', code: 'IN_PROGRESS', description: '订单正在执行', isActive: true },
        { id: 6, name: '已完成', code: 'COMPLETED', description: '订单已完成', isActive: true },
        { id: 7, name: '已取消', code: 'CANCELLED', description: '订单已取消', isActive: true }
      ]
    },
    {
      name: '安全事件类型',
      code: 'incident_types',
      items: [
        { id: 8, name: '交通事故', code: 'ACCIDENT', description: '车辆交通事故', isActive: true },
        { id: 9, name: '违规行为', code: 'VIOLATION', description: '交通法规违反', isActive: true },
        { id: 10, name: '设备故障', code: 'EQUIPMENT_FAILURE', description: '车辆设备故障', isActive: true }
      ]
    }
  ];

  toggleItem(categoryCode: string, itemId: number, event: any): void {
    console.log(`Toggle ${categoryCode} item ${itemId}:`, event.detail.checked);
    // TODO: Implement actual toggle logic
  }
}