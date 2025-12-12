import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>系统设置</h1>
        <p>管理系统配置、用户权限和系统参数</p>
      </div>

      <div class="page-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>系统配置</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>系统设置页面 - 开发中</p>
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
export class SettingsComponent {}