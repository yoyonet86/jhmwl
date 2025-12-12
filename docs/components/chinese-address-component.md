# 中国地址组件设计文档 (Chinese Address Component)

## 概述 (Overview)

本文档描述用于物流平台的中国地址三级联动组件的设计和实现方案。该组件支持省市区三级联动选择，并提供详细地址输入功能。

This document describes the design and implementation of the cascading Chinese address selector component for the logistics platform, supporting Province-City-District three-level cascading selection with detailed address input.

---

## 组件功能 (Component Features)

### 1. 核心功能 (Core Features)

- **省市区三级联动选择** - Three-level cascading selector (Province → City → District)
- **详细地址输入** - Detailed address input field
- **数据字典管理** - Dictionary-based data management
- **国际化支持** - i18n support (Chinese/English)
- **表单验证** - Form validation
- **自动完成** - Auto-complete suggestions
- **地址格式化** - Address formatting and parsing

### 2. 组件结构 (Component Structure)

```
┌─────────────────────────────────────────────────────────────────┐
│  Chinese Address Selector Component                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [省份/Province ▼]  [城市/City ▼]  [区县/District ▼]           │
│                                                                 │
│  [详细地址 / Detailed Address_________________________]         │
│   (街道、门牌号等 / Street, building number, etc.)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 数据模型 (Data Model)

### 1. 数据库表结构 (Database Tables)

#### regions 表
用于存储中国行政区划的完整层级结构。

```sql
-- 省级 (Province Level)
SELECT * FROM regions 
WHERE parent_region_id IS NULL 
  AND region_type = 'PROVINCE'
  AND is_active = TRUE
ORDER BY display_order;

-- 市级 (City Level)
SELECT * FROM regions 
WHERE parent_region_id = :province_id
  AND region_type = 'CITY'
  AND is_active = TRUE
ORDER BY display_order;

-- 区县级 (District Level)
SELECT * FROM regions 
WHERE parent_region_id = :city_id
  AND region_type = 'DISTRICT'
  AND is_active = TRUE
ORDER BY display_order;
```

#### dictionaries & dictionary_items 表
用于快速查找和缓存的字典引用。

```sql
-- 获取字典定义
SELECT * FROM dictionaries 
WHERE code = 'CN_ADMIN_DIVISIONS';

-- 获取字典项（包含地区元数据）
SELECT * FROM dictionary_items 
WHERE dictionary_id = :dict_id
  AND is_active = TRUE
ORDER BY display_order;
```

### 2. 数据结构示例 (Data Structure Examples)

#### API 响应格式

```json
{
  "provinces": [
    {
      "id": 1,
      "code": "CN-44",
      "name": "广东省",
      "nameEn": "Guangdong",
      "displayOrder": 19
    }
  ],
  "cities": [
    {
      "id": 35,
      "code": "CN-44-01",
      "name": "广州市",
      "nameEn": "Guangzhou",
      "provinceId": 1,
      "displayOrder": 1
    }
  ],
  "districts": [
    {
      "id": 156,
      "code": "CN-44-01-06",
      "name": "天河区",
      "nameEn": "Tianhe District",
      "cityId": 35,
      "displayOrder": 4
    }
  ]
}
```

#### 表单数据格式

```json
{
  "provinceId": 1,
  "provinceName": "广东省",
  "provinceCode": "CN-44",
  "cityId": 35,
  "cityName": "广州市",
  "cityCode": "CN-44-01",
  "districtId": 156,
  "districtName": "天河区",
  "districtCode": "CN-44-01-06",
  "detailedAddress": "天河路123号A座1001室",
  "fullAddress": "广东省广州市天河区天河路123号A座1001室",
  "postalCode": "510000"
}
```

---

## API 接口设计 (API Design)

### 1. 获取省份列表 (Get Provinces)

```http
GET /api/v1/regions/provinces
```

**响应 (Response):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CN-44",
      "name": "广东省",
      "nameEn": "Guangdong"
    }
  ]
}
```

### 2. 获取城市列表 (Get Cities)

```http
GET /api/v1/regions/cities?provinceId={provinceId}
```

**参数 (Parameters):**
- `provinceId` (required): 省份ID

**响应 (Response):**

```json
{
  "success": true,
  "data": [
    {
      "id": 35,
      "code": "CN-44-01",
      "name": "广州市",
      "nameEn": "Guangzhou",
      "provinceId": 1
    }
  ]
}
```

### 3. 获取区县列表 (Get Districts)

```http
GET /api/v1/regions/districts?cityId={cityId}
```

**参数 (Parameters):**
- `cityId` (required): 城市ID

**响应 (Response):**

```json
{
  "success": true,
  "data": [
    {
      "id": 156,
      "code": "CN-44-01-06",
      "name": "天河区",
      "nameEn": "Tianhe District",
      "cityId": 35
    }
  ]
}
```

### 4. 地址验证与解析 (Address Validation & Parsing)

```http
POST /api/v1/regions/validate-address
```

**请求体 (Request Body):**

```json
{
  "provinceId": 1,
  "cityId": 35,
  "districtId": 156,
  "detailedAddress": "天河路123号"
}
```

**响应 (Response):**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "fullAddress": "广东省广州市天河区天河路123号",
    "latitude": 23.1325,
    "longitude": 113.3234,
    "postalCode": "510000"
  }
}
```

---

## 前端组件实现 (Frontend Implementation)

### 1. Angular Component 结构

```typescript
// chinese-address-selector.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegionService } from '@shared/services/region.service';

export interface ChineseAddress {
  provinceId?: number;
  provinceName?: string;
  provinceCode?: string;
  cityId?: number;
  cityName?: string;
  cityCode?: string;
  districtId?: number;
  districtName?: string;
  districtCode?: string;
  detailedAddress?: string;
  fullAddress?: string;
  postalCode?: string;
}

@Component({
  selector: 'app-chinese-address-selector',
  templateUrl: './chinese-address-selector.component.html',
  styleUrls: ['./chinese-address-selector.component.scss']
})
export class ChineseAddressSelectorComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() required: boolean = true;
  @Input() disabled: boolean = false;
  @Input() initialValue?: ChineseAddress;
  @Output() addressChange = new EventEmitter<ChineseAddress>();

  provinces: any[] = [];
  cities: any[] = [];
  districts: any[] = [];
  loading = {
    provinces: false,
    cities: false,
    districts: false
  };

  constructor(private regionService: RegionService) {}

  ngOnInit() {
    this.initializeFormControls();
    this.loadProvinces();
    if (this.initialValue) {
      this.setInitialValue(this.initialValue);
    }
  }

  private initializeFormControls() {
    const validators = this.required ? [Validators.required] : [];
    
    this.formGroup.addControl('provinceId', new FormControl(null, validators));
    this.formGroup.addControl('provinceName', new FormControl(''));
    this.formGroup.addControl('cityId', new FormControl(null, validators));
    this.formGroup.addControl('cityName', new FormControl(''));
    this.formGroup.addControl('districtId', new FormControl(null, validators));
    this.formGroup.addControl('districtName', new FormControl(''));
    this.formGroup.addControl('detailedAddress', new FormControl('', validators));
    this.formGroup.addControl('fullAddress', new FormControl(''));
  }

  async loadProvinces() {
    this.loading.provinces = true;
    try {
      this.provinces = await this.regionService.getProvinces().toPromise();
    } finally {
      this.loading.provinces = false;
    }
  }

  async onProvinceChange(provinceId: number) {
    const province = this.provinces.find(p => p.id === provinceId);
    this.formGroup.patchValue({
      provinceId: provinceId,
      provinceName: province?.name || '',
      cityId: null,
      cityName: '',
      districtId: null,
      districtName: ''
    });
    
    this.cities = [];
    this.districts = [];
    
    if (provinceId) {
      this.loading.cities = true;
      try {
        this.cities = await this.regionService.getCities(provinceId).toPromise();
      } finally {
        this.loading.cities = false;
      }
    }
    
    this.updateFullAddress();
  }

  async onCityChange(cityId: number) {
    const city = this.cities.find(c => c.id === cityId);
    this.formGroup.patchValue({
      cityId: cityId,
      cityName: city?.name || '',
      districtId: null,
      districtName: ''
    });
    
    this.districts = [];
    
    if (cityId) {
      this.loading.districts = true;
      try {
        this.districts = await this.regionService.getDistricts(cityId).toPromise();
      } finally {
        this.loading.districts = false;
      }
    }
    
    this.updateFullAddress();
  }

  onDistrictChange(districtId: number) {
    const district = this.districts.find(d => d.id === districtId);
    this.formGroup.patchValue({
      districtId: districtId,
      districtName: district?.name || ''
    });
    
    this.updateFullAddress();
  }

  onDetailedAddressChange() {
    this.updateFullAddress();
  }

  private updateFullAddress() {
    const { provinceName, cityName, districtName, detailedAddress } = this.formGroup.value;
    const parts = [provinceName, cityName, districtName, detailedAddress].filter(p => p);
    const fullAddress = parts.join('');
    
    this.formGroup.patchValue({ fullAddress });
    this.addressChange.emit(this.formGroup.value);
  }

  private async setInitialValue(value: ChineseAddress) {
    if (value.provinceId) {
      await this.loadProvinces();
      this.formGroup.patchValue({ provinceId: value.provinceId });
      await this.onProvinceChange(value.provinceId);
    }
    
    if (value.cityId) {
      this.formGroup.patchValue({ cityId: value.cityId });
      await this.onCityChange(value.cityId);
    }
    
    if (value.districtId) {
      this.formGroup.patchValue({ districtId: value.districtId });
      this.onDistrictChange(value.districtId);
    }
    
    if (value.detailedAddress) {
      this.formGroup.patchValue({ detailedAddress: value.detailedAddress });
      this.updateFullAddress();
    }
  }
}
```

### 2. HTML 模板

```html
<!-- chinese-address-selector.component.html -->
<div class="chinese-address-selector" [formGroup]="formGroup">
  <div class="address-cascading">
    <ion-row>
      <!-- 省份选择 -->
      <ion-col size="12" size-md="4">
        <ion-item>
          <ion-label position="floating">
            {{ 'address.province' | translate }}
            <span *ngIf="required" class="required">*</span>
          </ion-label>
          <ion-select
            formControlName="provinceId"
            [disabled]="disabled || loading.provinces"
            (ionChange)="onProvinceChange($event.detail.value)"
            interface="action-sheet"
            [placeholder]="'address.selectProvince' | translate">
            <ion-select-option 
              *ngFor="let province of provinces" 
              [value]="province.id">
              {{ province.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <div class="error-message" 
             *ngIf="formGroup.get('provinceId')?.invalid && formGroup.get('provinceId')?.touched">
          {{ 'address.provinceRequired' | translate }}
        </div>
      </ion-col>

      <!-- 城市选择 -->
      <ion-col size="12" size-md="4">
        <ion-item>
          <ion-label position="floating">
            {{ 'address.city' | translate }}
            <span *ngIf="required" class="required">*</span>
          </ion-label>
          <ion-select
            formControlName="cityId"
            [disabled]="disabled || !formGroup.get('provinceId')?.value || loading.cities"
            (ionChange)="onCityChange($event.detail.value)"
            interface="action-sheet"
            [placeholder]="'address.selectCity' | translate">
            <ion-select-option 
              *ngFor="let city of cities" 
              [value]="city.id">
              {{ city.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <div class="error-message" 
             *ngIf="formGroup.get('cityId')?.invalid && formGroup.get('cityId')?.touched">
          {{ 'address.cityRequired' | translate }}
        </div>
      </ion-col>

      <!-- 区县选择 -->
      <ion-col size="12" size-md="4">
        <ion-item>
          <ion-label position="floating">
            {{ 'address.district' | translate }}
            <span *ngIf="required" class="required">*</span>
          </ion-label>
          <ion-select
            formControlName="districtId"
            [disabled]="disabled || !formGroup.get('cityId')?.value || loading.districts"
            (ionChange)="onDistrictChange($event.detail.value)"
            interface="action-sheet"
            [placeholder]="'address.selectDistrict' | translate">
            <ion-select-option 
              *ngFor="let district of districts" 
              [value]="district.id">
              {{ district.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <div class="error-message" 
             *ngIf="formGroup.get('districtId')?.invalid && formGroup.get('districtId')?.touched">
          {{ 'address.districtRequired' | translate }}
        </div>
      </ion-col>
    </ion-row>
  </div>

  <!-- 详细地址 -->
  <div class="detailed-address">
    <ion-item>
      <ion-label position="floating">
        {{ 'address.detailedAddress' | translate }}
        <span *ngIf="required" class="required">*</span>
      </ion-label>
      <ion-input
        formControlName="detailedAddress"
        [disabled]="disabled"
        (ionChange)="onDetailedAddressChange()"
        [placeholder]="'address.detailedAddressPlaceholder' | translate">
      </ion-input>
    </ion-item>
    <div class="error-message" 
         *ngIf="formGroup.get('detailedAddress')?.invalid && formGroup.get('detailedAddress')?.touched">
      {{ 'address.detailedAddressRequired' | translate }}
    </div>
  </div>

  <!-- 完整地址显示（只读） -->
  <div class="full-address" *ngIf="formGroup.get('fullAddress')?.value">
    <ion-item>
      <ion-label position="stacked">
        {{ 'address.fullAddress' | translate }}
      </ion-label>
      <ion-text color="medium">
        {{ formGroup.get('fullAddress')?.value }}
      </ion-text>
    </ion-item>
  </div>
</div>
```

### 3. SCSS 样式

```scss
// chinese-address-selector.component.scss
.chinese-address-selector {
  .address-cascading {
    margin-bottom: 1rem;

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
    }

    ion-select {
      width: 100%;
      max-width: 100%;
    }
  }

  .detailed-address {
    margin-bottom: 1rem;
  }

  .full-address {
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: var(--ion-color-light);
    border-radius: 4px;

    ion-label {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    ion-text {
      display: block;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }
  }

  .required {
    color: var(--ion-color-danger);
    margin-left: 2px;
  }

  .error-message {
    color: var(--ion-color-danger);
    font-size: 0.75rem;
    padding: 0.25rem 1rem;
  }

  @media (max-width: 768px) {
    ion-col {
      padding-bottom: 0.5rem;
    }
  }
}
```

### 4. Region Service

```typescript
// region.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface Region {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  parentRegionId?: number;
  regionType: string;
  displayOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private readonly API_BASE = `${environment.apiUrl}/api/v1/regions`;
  private provincesCache$?: Observable<Region[]>;

  constructor(private http: HttpClient) {}

  getProvinces(): Observable<Region[]> {
    if (!this.provincesCache$) {
      this.provincesCache$ = this.http
        .get<{ success: boolean; data: Region[] }>(`${this.API_BASE}/provinces`)
        .pipe(
          map(response => response.data),
          shareReplay(1),
          catchError(error => {
            console.error('Error loading provinces:', error);
            return of([]);
          })
        );
    }
    return this.provincesCache$;
  }

  getCities(provinceId: number): Observable<Region[]> {
    return this.http
      .get<{ success: boolean; data: Region[] }>(
        `${this.API_BASE}/cities`,
        { params: { provinceId: provinceId.toString() } }
      )
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error loading cities:', error);
          return of([]);
        })
      );
  }

  getDistricts(cityId: number): Observable<Region[]> {
    return this.http
      .get<{ success: boolean; data: Region[] }>(
        `${this.API_BASE}/districts`,
        { params: { cityId: cityId.toString() } }
      )
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error loading districts:', error);
          return of([]);
        })
      );
  }

  validateAddress(address: any): Observable<any> {
    return this.http
      .post<{ success: boolean; data: any }>(
        `${this.API_BASE}/validate-address`,
        address
      )
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error validating address:', error);
          return of({ isValid: false });
        })
      );
  }
}
```

---

## 使用示例 (Usage Examples)

### 1. 在表单中使用 (Using in Forms)

```typescript
// customer-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-form',
  template: `
    <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
      <ion-item>
        <ion-label position="floating">客户名称</ion-label>
        <ion-input formControlName="name"></ion-input>
      </ion-item>

      <app-chinese-address-selector
        [formGroup]="addressForm"
        [required]="true"
        (addressChange)="onAddressChange($event)">
      </app-chinese-address-selector>

      <ion-button type="submit" [disabled]="!customerForm.valid">
        提交
      </ion-button>
    </form>
  `
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  addressForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.addressForm = this.fb.group({});
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      address: this.addressForm
    });
  }

  onAddressChange(address: any) {
    console.log('Address changed:', address);
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const formData = {
        name: this.customerForm.value.name,
        ...this.addressForm.value
      };
      console.log('Submitting:', formData);
    }
  }
}
```

### 2. 编辑现有地址 (Edit Existing Address)

```typescript
// edit-customer.component.ts
@Component({
  selector: 'app-edit-customer',
  template: `
    <app-chinese-address-selector
      [formGroup]="addressForm"
      [initialValue]="existingAddress">
    </app-chinese-address-selector>
  `
})
export class EditCustomerComponent implements OnInit {
  addressForm!: FormGroup;
  existingAddress = {
    provinceId: 1,
    provinceName: '广东省',
    cityId: 35,
    cityName: '广州市',
    districtId: 156,
    districtName: '天河区',
    detailedAddress: '天河路123号',
    fullAddress: '广东省广州市天河区天河路123号'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.addressForm = this.fb.group({});
  }
}
```

---

## 国际化配置 (i18n Configuration)

### 中文 (Chinese)

```json
{
  "address": {
    "province": "省份",
    "city": "城市",
    "district": "区县",
    "detailedAddress": "详细地址",
    "fullAddress": "完整地址",
    "selectProvince": "请选择省份",
    "selectCity": "请选择城市",
    "selectDistrict": "请选择区县",
    "detailedAddressPlaceholder": "请输入街道、门牌号等详细地址",
    "provinceRequired": "请选择省份",
    "cityRequired": "请选择城市",
    "districtRequired": "请选择区县",
    "detailedAddressRequired": "请输入详细地址"
  }
}
```

### 英文 (English)

```json
{
  "address": {
    "province": "Province",
    "city": "City",
    "district": "District",
    "detailedAddress": "Detailed Address",
    "fullAddress": "Full Address",
    "selectProvince": "Select Province",
    "selectCity": "Select City",
    "selectDistrict": "Select District",
    "detailedAddressPlaceholder": "Enter street, building number, etc.",
    "provinceRequired": "Province is required",
    "cityRequired": "City is required",
    "districtRequired": "District is required",
    "detailedAddressRequired": "Detailed address is required"
  }
}
```

---

## 后端 API 实现参考 (Backend API Reference)

### ASP.NET Core Controller

```csharp
// RegionsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/v1/[controller]")]
public class RegionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public RegionsController(ApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
    {
        var cacheKey = "provinces_list";
        
        if (!_cache.TryGetValue(cacheKey, out List<RegionDto> provinces))
        {
            provinces = await _context.Regions
                .Where(r => r.ParentRegionId == null 
                       && r.RegionType == "PROVINCE" 
                       && r.IsActive 
                       && r.DeletedAt == null)
                .OrderBy(r => r.DisplayOrder)
                .Select(r => new RegionDto
                {
                    Id = r.Id,
                    Code = r.Code,
                    Name = r.Name,
                    NameEn = r.NameEn,
                    DisplayOrder = r.DisplayOrder
                })
                .ToListAsync();

            _cache.Set(cacheKey, provinces, TimeSpan.FromHours(24));
        }

        return Ok(new { success = true, data = provinces });
    }

    [HttpGet("cities")]
    public async Task<IActionResult> GetCities([FromQuery] long provinceId)
    {
        var cacheKey = $"cities_{provinceId}";
        
        if (!_cache.TryGetValue(cacheKey, out List<RegionDto> cities))
        {
            cities = await _context.Regions
                .Where(r => r.ParentRegionId == provinceId 
                       && r.RegionType == "CITY" 
                       && r.IsActive 
                       && r.DeletedAt == null)
                .OrderBy(r => r.DisplayOrder)
                .Select(r => new RegionDto
                {
                    Id = r.Id,
                    Code = r.Code,
                    Name = r.Name,
                    NameEn = r.NameEn,
                    ProvinceId = r.ParentRegionId,
                    DisplayOrder = r.DisplayOrder
                })
                .ToListAsync();

            _cache.Set(cacheKey, cities, TimeSpan.FromHours(24));
        }

        return Ok(new { success = true, data = cities });
    }

    [HttpGet("districts")]
    public async Task<IActionResult> GetDistricts([FromQuery] long cityId)
    {
        var cacheKey = $"districts_{cityId}";
        
        if (!_cache.TryGetValue(cacheKey, out List<RegionDto> districts))
        {
            districts = await _context.Regions
                .Where(r => r.ParentRegionId == cityId 
                       && r.RegionType == "DISTRICT" 
                       && r.IsActive 
                       && r.DeletedAt == null)
                .OrderBy(r => r.DisplayOrder)
                .Select(r => new RegionDto
                {
                    Id = r.Id,
                    Code = r.Code,
                    Name = r.Name,
                    NameEn = r.NameEn,
                    CityId = r.ParentRegionId,
                    DisplayOrder = r.DisplayOrder
                })
                .ToListAsync();

            _cache.Set(cacheKey, districts, TimeSpan.FromHours(24));
        }

        return Ok(new { success = true, data = districts });
    }

    [HttpPost("validate-address")]
    public async Task<IActionResult> ValidateAddress([FromBody] AddressValidationRequest request)
    {
        // Validate that the region hierarchy is correct
        var district = await _context.Regions.FindAsync(request.DistrictId);
        if (district == null || district.ParentRegionId != request.CityId)
        {
            return BadRequest(new { success = false, message = "Invalid district" });
        }

        var city = await _context.Regions.FindAsync(request.CityId);
        if (city == null || city.ParentRegionId != request.ProvinceId)
        {
            return BadRequest(new { success = false, message = "Invalid city" });
        }

        var province = await _context.Regions.FindAsync(request.ProvinceId);
        if (province == null)
        {
            return BadRequest(new { success = false, message = "Invalid province" });
        }

        var fullAddress = $"{province.Name}{city.Name}{district.Name}{request.DetailedAddress}";

        return Ok(new
        {
            success = true,
            data = new
            {
                isValid = true,
                fullAddress = fullAddress,
                // Add geocoding service integration here if needed
                latitude = (decimal?)null,
                longitude = (decimal?)null,
                postalCode = (string?)null
            }
        });
    }
}

public class RegionDto
{
    public long Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string NameEn { get; set; }
    public long? ProvinceId { get; set; }
    public long? CityId { get; set; }
    public int DisplayOrder { get; set; }
}

public class AddressValidationRequest
{
    public long ProvinceId { get; set; }
    public long CityId { get; set; }
    public long DistrictId { get; set; }
    public string DetailedAddress { get; set; }
}
```

---

## 数据维护 (Data Maintenance)

### 1. 初始化地址数据

```bash
# 运行种子数据脚本
mysql -u username -p database_name < db/seed/chinese_address_data.sql
```

### 2. 更新地址数据

通过管理后台的字典管理模块更新：

1. 进入系统管理 → 字典管理
2. 找到"中国行政区划"字典
3. 可以添加、编辑、删除省市区数据
4. 修改后自动清除缓存

### 3. 数据导入工具

```bash
# 批量导入完整的省市区数据
# 可从国家统计局获取最新的行政区划代码
# http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/
```

---

## 性能优化建议 (Performance Optimization)

### 1. 数据缓存策略

- **省份数据**: 缓存24小时（变化极少）
- **城市数据**: 缓存24小时
- **区县数据**: 缓存12小时
- **客户端缓存**: 使用 LocalStorage 缓存省份列表

### 2. 懒加载

- 只在需要时加载下级数据
- 避免一次性加载所有地区数据

### 3. 索引优化

```sql
-- 确保regions表有合适的索引
CREATE INDEX idx_regions_parent_type ON regions(parent_region_id, region_type, is_active);
CREATE INDEX idx_regions_code ON regions(code);
```

---

## 测试用例 (Test Cases)

### 单元测试示例

```typescript
describe('ChineseAddressSelectorComponent', () => {
  let component: ChineseAddressSelectorComponent;
  let fixture: ComponentFixture<ChineseAddressSelectorComponent>;
  let regionService: jasmine.SpyObj<RegionService>;

  beforeEach(async () => {
    const regionServiceSpy = jasmine.createSpyObj('RegionService', [
      'getProvinces',
      'getCities',
      'getDistricts'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ChineseAddressSelectorComponent],
      providers: [
        FormBuilder,
        { provide: RegionService, useValue: regionServiceSpy }
      ]
    }).compileComponents();

    regionService = TestBed.inject(RegionService) as jasmine.SpyObj<RegionService>;
  });

  it('should load provinces on init', () => {
    const mockProvinces = [
      { id: 1, code: 'CN-44', name: '广东省', nameEn: 'Guangdong' }
    ];
    regionService.getProvinces.and.returnValue(of(mockProvinces));

    component.ngOnInit();

    expect(regionService.getProvinces).toHaveBeenCalled();
    expect(component.provinces).toEqual(mockProvinces);
  });

  it('should load cities when province is selected', async () => {
    const mockCities = [
      { id: 35, code: 'CN-44-01', name: '广州市', provinceId: 1 }
    ];
    regionService.getCities.and.returnValue(of(mockCities));

    await component.onProvinceChange(1);

    expect(regionService.getCities).toHaveBeenCalledWith(1);
    expect(component.cities).toEqual(mockCities);
  });

  it('should update full address when all fields are filled', () => {
    component.formGroup = new FormBuilder().group({
      provinceName: ['广东省'],
      cityName: ['广州市'],
      districtName: ['天河区'],
      detailedAddress: ['天河路123号'],
      fullAddress: ['']
    });

    component['updateFullAddress']();

    expect(component.formGroup.value.fullAddress).toBe('广东省广州市天河区天河路123号');
  });
});
```

---

## 总结 (Summary)

本文档提供了完整的中国地址三级联动组件实现方案，包括：

✅ 数据库表结构设计和种子数据
✅ 前端 Angular/Ionic 组件实现
✅ 后端 ASP.NET Core API 实现
✅ 国际化支持
✅ 性能优化建议
✅ 测试用例

该组件可以直接集成到物流平台的订单、客户、司机等模块中使用。
