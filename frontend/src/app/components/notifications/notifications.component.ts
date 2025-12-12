import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>通知中心</h1>
        <p>查看系统通知和消息</p>
      </div>

      <div class="page-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>通知列表</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>通知页面 - 开发中</p>
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
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
      color: var(--ion-color-dark);
    }

    .page-header p {
      margin: 0;
      color: var(--ion-color-medium);
      font-size: 1rem;
    }
  `]
})
export class NotificationsComponent {}