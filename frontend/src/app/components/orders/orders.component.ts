import { Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>订单管理</h1>
        <p>管理运输订单、配送跟踪和客户信息</p>
        <ion-button color="primary" [routerLink]="['/orders/create']">
          <ion-icon name="add-circle" slot="start"></ion-icon>
          创建订单
        </ion-button>
      </div>

      <div class="page-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>订单列表</ion-card-title>
            <ion-card-subtitle>当前有 {{ orders.length }} 个订单</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let order of orders">
                <ion-icon name="document-text" slot="start"></ion-icon>
                <ion-label>
                  <h2>{{ order.orderNumber }}</h2>
                  <p>客户: {{ order.customer }} | 状态: {{ order.status }}</p>
                  <p>起: {{ order.pickup }} | 止: {{ order.delivery }}</p>
                </ion-label>
                <ion-button fill="outline" size="small" [routerLink]="['/orders', order.id]">
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
export class OrdersComponent {
  orders = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      customer: '北京科技有限公司',
      status: '进行中',
      pickup: '北京市朝阳区',
      delivery: '上海市浦东新区'
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      customer: '上海贸易公司',
      status: '待配送',
      pickup: '上海市宝山区',
      delivery: '广州市天河区'
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      customer: '深圳制造业',
      status: '已完成',
      pickup: '深圳市南山区',
      delivery: '北京市海淀区'
    }
  ];
}