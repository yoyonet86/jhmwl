import { Component } from '@angular/core';

@Component({
  selector: 'app-drivers',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>司机管理</h1>
        <p>管理司机信息、许可证和绩效</p>
        <ion-button color="primary" [routerLink]="['/drivers/create']">
          <ion-icon name="person-add" slot="start"></ion-icon>
          添加司机
        </ion-button>
      </div>

      <div class="page-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>司机列表</ion-card-title>
            <ion-card-subtitle>当前有 {{ drivers.length }} 名司机</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let driver of drivers">
                <ion-icon name="person" slot="start"></ion-icon>
                <ion-label>
                  <h2>{{ driver.name }}</h2>
                  <p>电话: {{ driver.phone }} | 驾照: {{ driver.licenseNumber }}</p>
                  <p>状态: {{ driver.status }}</p>
                </ion-label>
                <ion-button fill="outline" size="small" [routerLink]="['/drivers', driver.id]">
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
export class DriversComponent {
  drivers = [
    {
      id: 1,
      name: '张三',
      phone: '13800138001',
      licenseNumber: 'A123456789',
      status: '活跃'
    },
    {
      id: 2,
      name: '李四',
      phone: '13800138002',
      licenseNumber: 'B987654321',
      status: '活跃'
    },
    {
      id: 3,
      name: '王五',
      phone: '13800138003',
      licenseNumber: 'A555666777',
      status: '请假'
    }
  ];
}