import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="error-container">
      <div class="error-content">
        <ion-icon name="help-circle-outline" class="error-icon"></ion-icon>
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在或已被移动</p>
        <ion-button color="primary" [routerLink]="['/dashboard']">
          <ion-icon name="home" slot="start"></ion-icon>
          返回首页
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
    }

    .error-content {
      text-align: center;
      color: white;
      padding: 2rem;
    }

    .error-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .error-content h1 {
      font-size: 4rem;
      font-weight: 700;
      margin: 0;
    }

    .error-content h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .error-content p {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .error-content ion-button {
      margin-top: 2rem;
    }
  `]
})
export class NotFoundComponent {}