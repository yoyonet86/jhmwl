import { Component } from '@angular/core';

@Component({
  selector: 'app-vehicles',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>车辆管理</h1>
        <p>管理车队信息、维护记录和检查状态</p>
        <ion-button color="primary" [routerLink]="['/vehicles/create']">
          <ion-icon name="car" slot="start"></ion-icon>
          添加车辆
        </ion-button>
      </div>

      <div class="page-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>车辆列表</ion-card-title>
            <ion-card-subtitle>当前有 {{ vehicles.length }} 辆车辆</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let vehicle of vehicles">
                <ion-icon name="car" slot="start"></ion-icon>
                <ion-label>
                  <h2>{{ vehicle.plateNumber }} - {{ vehicle.make }} {{ vehicle.model }}</h2>
                  <p>类型: {{ vehicle.type }} | 状态: {{ vehicle.status }}</p>
                  <p>下次保养: {{ vehicle.nextMaintenance }}</p>
                </ion-label>
                <ion-button fill="outline" size="small" [routerLink]="['/vehicles', vehicle.id]">
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
export class VehiclesComponent {
  vehicles = [
    {
      id: 1,
      plateNumber: '京A12345',
      make: '一汽',
      model: '解放J6',
      type: '货车',
      status: '可用',
      nextMaintenance: '2024-12-20'
    },
    {
      id: 2,
      plateNumber: '京B67890',
      make: '东风',
      model: '天龙',
      type: '货车',
      status: '维护中',
      nextMaintenance: '2024-12-15'
    },
    {
      id: 3,
      plateNumber: '沪C11111',
      make: '福田',
      model: '欧曼',
      type: '货车',
      status: '使用中',
      nextMaintenance: '2024-12-25'
    }
  ];
}