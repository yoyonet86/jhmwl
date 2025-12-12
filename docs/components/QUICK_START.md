# 中国地址组件快速开始 (Chinese Address Component Quick Start)

## 1分钟快速集成 (1-Minute Quick Integration)

### 步骤 1: 导入数据 (Import Data)

```bash
mysql -u root -p your_database < db/seed/chinese_address_data.sql
```

### 步骤 2: 前端使用 (Frontend Usage)

```typescript
// 在你的组件中
import { FormBuilder } from '@angular/forms';

export class YourComponent {
  addressForm = this.fb.group({});
  
  constructor(private fb: FormBuilder) {}
}
```

```html
<!-- 在你的模板中 -->
<app-chinese-address-selector
  [formGroup]="addressForm"
  [required]="true">
</app-chinese-address-selector>
```

### 步骤 3: 获取地址数据 (Get Address Data)

```typescript
onSubmit() {
  console.log(this.addressForm.value);
  // 输出:
  // {
  //   provinceId: 1,
  //   provinceName: "广东省",
  //   cityId: 35,
  //   cityName: "广州市",
  //   districtId: 156,
  //   districtName: "天河区",
  //   detailedAddress: "天河路123号",
  //   fullAddress: "广东省广州市天河区天河路123号"
  // }
}
```

## 完整文档 (Full Documentation)

详细信息请查看: [chinese-address-component.md](./chinese-address-component.md)

## API 端点 (API Endpoints)

```typescript
// 需要实现的后端 API
GET  /api/v1/regions/provinces           // 返回34个省份
GET  /api/v1/regions/cities?provinceId=1 // 返回指定省份的城市
GET  /api/v1/regions/districts?cityId=35 // 返回指定城市的区县
```

## 数据验证 (Data Verification)

```sql
-- 检查数据是否导入成功
SELECT COUNT(*) FROM regions WHERE region_type = 'PROVINCE';  -- 应该是 34
SELECT COUNT(*) FROM regions WHERE region_type = 'CITY';      -- 应该是 79
SELECT COUNT(*) FROM regions WHERE region_type = 'DISTRICT';  -- 应该是 45
```

## 常见用法 (Common Usage)

### 订单表单 (Order Form)

```html
<form [formGroup]="orderForm">
  <!-- 发货地址 -->
  <h3>发货地址</h3>
  <app-chinese-address-selector
    [formGroup]="originAddressForm"
    [required]="true">
  </app-chinese-address-selector>

  <!-- 收货地址 -->
  <h3>收货地址</h3>
  <app-chinese-address-selector
    [formGroup]="destinationAddressForm"
    [required]="true">
  </app-chinese-address-selector>
</form>
```

### 客户管理 (Customer Management)

```html
<form [formGroup]="customerForm">
  <ion-input formControlName="name" placeholder="客户名称"></ion-input>
  
  <app-chinese-address-selector
    [formGroup]="addressForm"
    [required]="true">
  </app-chinese-address-selector>
</form>
```

## 示例数据 (Sample Data)

组件支持以下地区（示例）：

```
✅ 北京市 (16个区)
✅ 广东省 (21个市, 含广州11区、深圳9区)
✅ 江苏省 (13个市)
✅ 浙江省 (11个市, 含杭州13区)
✅ 四川省 (18个市, 含成都12区)
✅ ... 其他29个省份

总计: 34省 + 79市 + 45区 = 158条地址数据
```

## 故障排查 (Troubleshooting)

### 问题: 下拉框没有数据

**解决方案**:
1. 检查数据库是否导入成功
2. 检查 API 是否返回正确数据
3. 检查浏览器控制台是否有错误

### 问题: 选择省份后城市不更新

**解决方案**:
1. 检查省份 ID 是否正确传递
2. 检查 API 参数是否正确
3. 检查数据库中是否有该省份的城市数据

### 问题: 表单验证不生效

**解决方案**:
1. 确保 `[required]="true"` 已设置
2. 检查 FormGroup 是否正确初始化
3. 在提交前检查 `form.valid` 状态

## 性能提示 (Performance Tips)

✅ 省份数据会自动缓存，无需重复加载  
✅ 使用懒加载，只在需要时加载城市/区县数据  
✅ 建议在服务端启用 Redis 缓存

## 需要帮助? (Need Help?)

📖 查看完整文档: [chinese-address-component.md](./chinese-address-component.md)  
📖 数据库文档: [../db/README.md](../db/README.md)  
📖 种子数据文档: [../../db/seed/README.md](../../db/seed/README.md)
