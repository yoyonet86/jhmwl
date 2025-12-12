import { Component } from '@angular/core';

@Component({
  selector: 'app-employees',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>员工管理</h1>
        <p>管理员工信息、部门设置和人事数据</p>
        <ion-button color="primary" [routerLink]="['/employees/create']">
          <ion-icon name="person-add" slot="start"></ion-icon>
          添加员工
        </ion-button>
      </div>

      <div class="page-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>员工列表</ion-card-title>
            <ion-card-subtitle>当前有 {{ employees.length }} 名员工</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let employee of employees">
                <ion-icon name="business" slot="start"></ion-icon>
                <ion-label>
                  <h2>{{ employee.name }} - {{ employee.position }}</h2>
                  <p>部门: {{ employee.department }} | 入职时间: {{ employee.hireDate }}</p>
                  <p>电话: {{ employee.phone }} | 状态: {{ employee.status }}</p>
                </ion-label>
                <ion-button fill="outline" size="small" [routerLink]="['/employees', employee.id]">
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
export class EmployeesComponent {
  employees = [
    {
      id: 1,
      name: '张管理员',
      position: '系统管理员',
      department: 'IT部',
      phone: '13800138000',
      hireDate: '2023-01-15',
      status: '在职'
    },
    {
      id: 2,
      name: '李经理',
      position: '物流经理',
      department: '运营部',
      phone: '13800138001',
      hireDate: '2023-03-20',
      status: '在职'
    },
    {
      id: 3,
      name: '王HR',
      position: '人事专员',
      department: '人事部',
      phone: '13800138002',
      hireDate: '2023-06-10',
      status: '在职'
    }
  ];
}