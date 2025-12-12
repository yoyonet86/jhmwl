# 数据库种子数据 (Database Seed Data)

## 概述 (Overview)

本目录包含数据库初始化和种子数据脚本，用于填充系统必需的参考数据。

This directory contains database initialization and seed data scripts for populating required reference data.

---

## 文件列表 (File List)

### 1. chinese_address_data.sql

**用途**: 中国行政区划数据（省市区三级联动）

**内容**:
- 34个省级行政区（省、直辖市、自治区、特别行政区）
- 主要城市的市级数据（示例）
- 主要城市的区县数据（示例）
- 字典表关联数据

**执行方法**:

```bash
# 方式1: 使用 MySQL 命令行
mysql -u root -p logistics_platform < db/seed/chinese_address_data.sql

# 方式2: 使用 MySQL 客户端
mysql -u root -p
USE logistics_platform;
SOURCE /path/to/db/seed/chinese_address_data.sql;

# 方式3: 使用 Docker
docker exec -i mysql_container mysql -u root -ppassword logistics_platform < db/seed/chinese_address_data.sql
```

**注意事项**:
1. 必须先执行 `core_tables.sql` 创建表结构
2. 数据仅包含主要省市的示例数据
3. 完整的区县数据需要单独导入
4. 执行前确保数据库已创建

---

## 导入顺序 (Import Order)

```
1. db/schema/core_tables.sql       (创建表结构)
   ↓
2. db/seed/chinese_address_data.sql (导入地址数据)
   ↓
3. db/seed/system_dictionaries.sql  (导入系统字典 - 待创建)
   ↓
4. db/seed/default_roles.sql        (导入默认角色 - 待创建)
```

---

## 数据验证 (Data Verification)

执行以下 SQL 语句验证数据是否导入成功：

```sql
-- 检查省级行政区数量
SELECT COUNT(*) as province_count 
FROM regions 
WHERE region_type = 'PROVINCE' AND deleted_at IS NULL;
-- 期望结果: 34

-- 检查城市数量（示例数据）
SELECT COUNT(*) as city_count 
FROM regions 
WHERE region_type = 'CITY' AND deleted_at IS NULL;
-- 期望结果: 约 60+

-- 检查区县数量（示例数据）
SELECT COUNT(*) as district_count 
FROM regions 
WHERE region_type = 'DISTRICT' AND deleted_at IS NULL;
-- 期望结果: 约 40+

-- 检查省市区层级关系
SELECT 
    p.name as province,
    COUNT(DISTINCT c.id) as cities,
    COUNT(d.id) as districts
FROM regions p
LEFT JOIN regions c ON c.parent_region_id = p.id AND c.region_type = 'CITY'
LEFT JOIN regions d ON d.parent_region_id = c.id AND d.region_type = 'DISTRICT'
WHERE p.region_type = 'PROVINCE' AND p.deleted_at IS NULL
GROUP BY p.id, p.name
ORDER BY p.display_order;

-- 检查字典数据
SELECT * FROM dictionaries WHERE code = 'CN_ADMIN_DIVISIONS';

SELECT COUNT(*) as dict_item_count
FROM dictionary_items di
JOIN dictionaries d ON di.dictionary_id = d.id
WHERE d.code = 'CN_ADMIN_DIVISIONS';
```

---

## 数据更新 (Data Updates)

### 获取最新的行政区划数据

官方数据源:
- **国家统计局**: http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/
- **民政部**: http://www.mca.gov.cn/article/sj/xzqh/

### 更新方法

1. **手动更新**:
   ```sql
   -- 添加新的行政区
   INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, display_order)
   VALUES (NULL, :parent_id, 'CN-XX-XX', '新区名', 'New District', 'DISTRICT', 999);
   
   -- 更新行政区名称
   UPDATE regions 
   SET name = '新名称', name_en = 'New Name'
   WHERE code = 'CN-XX-XX';
   
   -- 停用行政区（软删除）
   UPDATE regions 
   SET is_active = FALSE, deleted_at = NOW()
   WHERE code = 'CN-XX-XX';
   ```

2. **批量导入**:
   - 准备 CSV 文件
   - 使用 `LOAD DATA INFILE` 或导入工具
   - 执行数据验证脚本

3. **通过管理后台**:
   - 登录系统管理后台
   - 进入"字典管理" → "中国行政区划"
   - 使用可视化界面添加/编辑/删除

---

## 数据维护脚本 (Maintenance Scripts)

### 清理测试数据

```sql
-- 清空所有地址数据（谨慎使用！）
DELETE FROM dictionary_items 
WHERE dictionary_id IN (SELECT id FROM dictionaries WHERE code = 'CN_ADMIN_DIVISIONS');

DELETE FROM regions WHERE organization_id IS NULL;

DELETE FROM dictionaries WHERE code = 'CN_ADMIN_DIVISIONS';
```

### 重置自增ID

```sql
-- 重置regions表的自增ID
ALTER TABLE regions AUTO_INCREMENT = 1;

-- 重置dictionary_items表的自增ID
ALTER TABLE dictionary_items AUTO_INCREMENT = 1;
```

### 数据备份

```bash
# 备份地址数据
mysqldump -u root -p logistics_platform \
  regions dictionaries dictionary_items \
  --where="code='CN_ADMIN_DIVISIONS' OR organization_id IS NULL" \
  > address_data_backup_$(date +%Y%m%d).sql

# 恢复备份
mysql -u root -p logistics_platform < address_data_backup_20240101.sql
```

---

## 性能优化 (Performance Optimization)

### 索引检查

```sql
-- 查看regions表的索引
SHOW INDEX FROM regions;

-- 查看索引使用情况
EXPLAIN SELECT * FROM regions 
WHERE parent_region_id = 1 AND region_type = 'CITY' AND is_active = TRUE;
```

### 查询优化示例

```sql
-- 优化前（慢）
SELECT * FROM regions WHERE name LIKE '%广州%';

-- 优化后（快）- 使用精确匹配和索引
SELECT * FROM regions 
WHERE code = 'CN-44-01' AND deleted_at IS NULL;

-- 使用缓存查询常用数据
SELECT * FROM regions 
WHERE region_type = 'PROVINCE' 
  AND is_active = TRUE 
  AND deleted_at IS NULL
ORDER BY display_order;
```

---

## 常见问题 (FAQ)

### Q1: 导入时出现外键错误
**A**: 确保按正确顺序导入，先导入父级数据（省）再导入子级数据（市、区）

### Q2: 如何添加新的省份？
**A**: 
```sql
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, display_order)
VALUES (NULL, NULL, 'CN-XX', '新省份', 'New Province', 'PROVINCE', 35);
```

### Q3: 如何查找某个城市的所有区县？
**A**:
```sql
SELECT d.* 
FROM regions d
JOIN regions c ON d.parent_region_id = c.id
WHERE c.name = '广州市' 
  AND d.region_type = 'DISTRICT'
  AND d.deleted_at IS NULL;
```

### Q4: 数据导入后前端不显示？
**A**: 
1. 检查 `is_active` 字段是否为 TRUE
2. 检查 `deleted_at` 字段是否为 NULL
3. 清除应用缓存
4. 检查 API 返回数据

### Q5: 如何更新行政区划代码标准？
**A**: 参考 GB/T 2260 最新标准，批量更新 code 字段

---

## 扩展数据源 (Extended Data Sources)

如需完整的省市区数据，可以从以下渠道获取：

1. **开源数据库**:
   - GitHub 搜索 "china regions"
   - 阿里云、腾讯云等提供的开放数据

2. **商业数据提供商**:
   - 高德地图 API
   - 百度地图 API
   - 腾讯地图 API

3. **自建爬虫**:
   - 从国家统计局网站抓取最新数据
   - 定期更新和维护

---

## 许可证 (License)

中国行政区划数据来源于公开的官方数据，遵循国家相关规定使用。

Chinese administrative division data is sourced from publicly available official data and is used in compliance with national regulations.

---

## 更新日志 (Changelog)

### 2024-12-11
- ✅ 初始版本发布
- ✅ 包含34个省级行政区
- ✅ 包含主要城市的示例数据
- ✅ 集成字典管理系统

---

## 联系与支持 (Contact & Support)

如有数据错误或需要更新，请提交 Issue 或 Pull Request。

For data errors or update requests, please submit an Issue or Pull Request.
