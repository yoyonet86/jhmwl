-- ============================================================================
-- Chinese Address Data - Provinces, Cities, and Districts
-- ============================================================================
-- Purpose: Seed data for Chinese administrative divisions (省市区三级联动)
-- Usage: This data is used by the address component for cascading selection
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. Create Address Dictionary Category
-- ============================================================================

-- Insert dictionary for Chinese administrative divisions
INSERT INTO dictionaries (organization_id, code, name, description, is_system_dictionary, allow_custom_values, created_at)
VALUES (NULL, 'CN_ADMIN_DIVISIONS', '中国行政区划', 'Chinese administrative divisions for address selection', TRUE, FALSE, NOW());

SET @dict_id = LAST_INSERT_ID();

-- ============================================================================
-- 2. Insert Province-Level Divisions (省级行政区)
-- ============================================================================

-- Provinces (省)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, NULL, 'CN-11', '北京市', 'Beijing', 'PROVINCE', TRUE, 1, NOW()),
(NULL, NULL, 'CN-12', '天津市', 'Tianjin', 'PROVINCE', TRUE, 2, NOW()),
(NULL, NULL, 'CN-13', '河北省', 'Hebei', 'PROVINCE', TRUE, 3, NOW()),
(NULL, NULL, 'CN-14', '山西省', 'Shanxi', 'PROVINCE', TRUE, 4, NOW()),
(NULL, NULL, 'CN-15', '内蒙古自治区', 'Inner Mongolia', 'PROVINCE', TRUE, 5, NOW()),
(NULL, NULL, 'CN-21', '辽宁省', 'Liaoning', 'PROVINCE', TRUE, 6, NOW()),
(NULL, NULL, 'CN-22', '吉林省', 'Jilin', 'PROVINCE', TRUE, 7, NOW()),
(NULL, NULL, 'CN-23', '黑龙江省', 'Heilongjiang', 'PROVINCE', TRUE, 8, NOW()),
(NULL, NULL, 'CN-31', '上海市', 'Shanghai', 'PROVINCE', TRUE, 9, NOW()),
(NULL, NULL, 'CN-32', '江苏省', 'Jiangsu', 'PROVINCE', TRUE, 10, NOW()),
(NULL, NULL, 'CN-33', '浙江省', 'Zhejiang', 'PROVINCE', TRUE, 11, NOW()),
(NULL, NULL, 'CN-34', '安徽省', 'Anhui', 'PROVINCE', TRUE, 12, NOW()),
(NULL, NULL, 'CN-35', '福建省', 'Fujian', 'PROVINCE', TRUE, 13, NOW()),
(NULL, NULL, 'CN-36', '江西省', 'Jiangxi', 'PROVINCE', TRUE, 14, NOW()),
(NULL, NULL, 'CN-37', '山东省', 'Shandong', 'PROVINCE', TRUE, 15, NOW()),
(NULL, NULL, 'CN-41', '河南省', 'Henan', 'PROVINCE', TRUE, 16, NOW()),
(NULL, NULL, 'CN-42', '湖北省', 'Hubei', 'PROVINCE', TRUE, 17, NOW()),
(NULL, NULL, 'CN-43', '湖南省', 'Hunan', 'PROVINCE', TRUE, 18, NOW()),
(NULL, NULL, 'CN-44', '广东省', 'Guangdong', 'PROVINCE', TRUE, 19, NOW()),
(NULL, NULL, 'CN-45', '广西壮族自治区', 'Guangxi', 'PROVINCE', TRUE, 20, NOW()),
(NULL, NULL, 'CN-46', '海南省', 'Hainan', 'PROVINCE', TRUE, 21, NOW()),
(NULL, NULL, 'CN-50', '重庆市', 'Chongqing', 'PROVINCE', TRUE, 22, NOW()),
(NULL, NULL, 'CN-51', '四川省', 'Sichuan', 'PROVINCE', TRUE, 23, NOW()),
(NULL, NULL, 'CN-52', '贵州省', 'Guizhou', 'PROVINCE', TRUE, 24, NOW()),
(NULL, NULL, 'CN-53', '云南省', 'Yunnan', 'PROVINCE', TRUE, 25, NOW()),
(NULL, NULL, 'CN-54', '西藏自治区', 'Tibet', 'PROVINCE', TRUE, 26, NOW()),
(NULL, NULL, 'CN-61', '陕西省', 'Shaanxi', 'PROVINCE', TRUE, 27, NOW()),
(NULL, NULL, 'CN-62', '甘肃省', 'Gansu', 'PROVINCE', TRUE, 28, NOW()),
(NULL, NULL, 'CN-63', '青海省', 'Qinghai', 'PROVINCE', TRUE, 29, NOW()),
(NULL, NULL, 'CN-64', '宁夏回族自治区', 'Ningxia', 'PROVINCE', TRUE, 30, NOW()),
(NULL, NULL, 'CN-65', '新疆维吾尔自治区', 'Xinjiang', 'PROVINCE', TRUE, 31, NOW()),
(NULL, NULL, 'CN-71', '台湾省', 'Taiwan', 'PROVINCE', TRUE, 32, NOW()),
(NULL, NULL, 'CN-81', '香港特别行政区', 'Hong Kong', 'PROVINCE', TRUE, 33, NOW()),
(NULL, NULL, 'CN-82', '澳门特别行政区', 'Macao', 'PROVINCE', TRUE, 34, NOW());

-- ============================================================================
-- 3. Insert City-Level Divisions (市级行政区) - Sample Data
-- ============================================================================

-- Get province IDs for reference
SET @beijing_id = (SELECT id FROM regions WHERE code = 'CN-11');
SET @guangdong_id = (SELECT id FROM regions WHERE code = 'CN-44');
SET @jiangsu_id = (SELECT id FROM regions WHERE code = 'CN-32');
SET @zhejiang_id = (SELECT id FROM regions WHERE code = 'CN-33');
SET @sichuan_id = (SELECT id FROM regions WHERE code = 'CN-51');

-- Beijing Cities (北京市辖区)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(@beijing_id, @beijing_id, 'CN-11-01', '东城区', 'Dongcheng District', 'CITY', TRUE, 1, NOW()),
(@beijing_id, @beijing_id, 'CN-11-02', '西城区', 'Xicheng District', 'CITY', TRUE, 2, NOW()),
(@beijing_id, @beijing_id, 'CN-11-05', '朝阳区', 'Chaoyang District', 'CITY', TRUE, 3, NOW()),
(@beijing_id, @beijing_id, 'CN-11-06', '丰台区', 'Fengtai District', 'CITY', TRUE, 4, NOW()),
(@beijing_id, @beijing_id, 'CN-11-07', '石景山区', 'Shijingshan District', 'CITY', TRUE, 5, NOW()),
(@beijing_id, @beijing_id, 'CN-11-08', '海淀区', 'Haidian District', 'CITY', TRUE, 6, NOW()),
(@beijing_id, @beijing_id, 'CN-11-09', '门头沟区', 'Mentougou District', 'CITY', TRUE, 7, NOW()),
(@beijing_id, @beijing_id, 'CN-11-11', '房山区', 'Fangshan District', 'CITY', TRUE, 8, NOW()),
(@beijing_id, @beijing_id, 'CN-11-12', '通州区', 'Tongzhou District', 'CITY', TRUE, 9, NOW()),
(@beijing_id, @beijing_id, 'CN-11-13', '顺义区', 'Shunyi District', 'CITY', TRUE, 10, NOW()),
(@beijing_id, @beijing_id, 'CN-11-14', '昌平区', 'Changping District', 'CITY', TRUE, 11, NOW()),
(@beijing_id, @beijing_id, 'CN-11-15', '大兴区', 'Daxing District', 'CITY', TRUE, 12, NOW()),
(@beijing_id, @beijing_id, 'CN-11-16', '怀柔区', 'Huairou District', 'CITY', TRUE, 13, NOW()),
(@beijing_id, @beijing_id, 'CN-11-17', '平谷区', 'Pinggu District', 'CITY', TRUE, 14, NOW()),
(@beijing_id, @beijing_id, 'CN-11-28', '密云区', 'Miyun District', 'CITY', TRUE, 15, NOW()),
(@beijing_id, @beijing_id, 'CN-11-29', '延庆区', 'Yanqing District', 'CITY', TRUE, 16, NOW());

-- Guangdong Cities (广东省地级市)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @guangdong_id, 'CN-44-01', '广州市', 'Guangzhou', 'CITY', TRUE, 1, NOW()),
(NULL, @guangdong_id, 'CN-44-02', '韶关市', 'Shaoguan', 'CITY', TRUE, 2, NOW()),
(NULL, @guangdong_id, 'CN-44-03', '深圳市', 'Shenzhen', 'CITY', TRUE, 3, NOW()),
(NULL, @guangdong_id, 'CN-44-04', '珠海市', 'Zhuhai', 'CITY', TRUE, 4, NOW()),
(NULL, @guangdong_id, 'CN-44-05', '汕头市', 'Shantou', 'CITY', TRUE, 5, NOW()),
(NULL, @guangdong_id, 'CN-44-06', '佛山市', 'Foshan', 'CITY', TRUE, 6, NOW()),
(NULL, @guangdong_id, 'CN-44-07', '江门市', 'Jiangmen', 'CITY', TRUE, 7, NOW()),
(NULL, @guangdong_id, 'CN-44-08', '湛江市', 'Zhanjiang', 'CITY', TRUE, 8, NOW()),
(NULL, @guangdong_id, 'CN-44-09', '茂名市', 'Maoming', 'CITY', TRUE, 9, NOW()),
(NULL, @guangdong_id, 'CN-44-12', '肇庆市', 'Zhaoqing', 'CITY', TRUE, 10, NOW()),
(NULL, @guangdong_id, 'CN-44-13', '惠州市', 'Huizhou', 'CITY', TRUE, 11, NOW()),
(NULL, @guangdong_id, 'CN-44-14', '梅州市', 'Meizhou', 'CITY', TRUE, 12, NOW()),
(NULL, @guangdong_id, 'CN-44-15', '汕尾市', 'Shanwei', 'CITY', TRUE, 13, NOW()),
(NULL, @guangdong_id, 'CN-44-16', '河源市', 'Heyuan', 'CITY', TRUE, 14, NOW()),
(NULL, @guangdong_id, 'CN-44-17', '阳江市', 'Yangjiang', 'CITY', TRUE, 15, NOW()),
(NULL, @guangdong_id, 'CN-44-18', '清远市', 'Qingyuan', 'CITY', TRUE, 16, NOW()),
(NULL, @guangdong_id, 'CN-44-19', '东莞市', 'Dongguan', 'CITY', TRUE, 17, NOW()),
(NULL, @guangdong_id, 'CN-44-20', '中山市', 'Zhongshan', 'CITY', TRUE, 18, NOW()),
(NULL, @guangdong_id, 'CN-44-51', '潮州市', 'Chaozhou', 'CITY', TRUE, 19, NOW()),
(NULL, @guangdong_id, 'CN-44-52', '揭阳市', 'Jieyang', 'CITY', TRUE, 20, NOW()),
(NULL, @guangdong_id, 'CN-44-53', '云浮市', 'Yunfu', 'CITY', TRUE, 21, NOW());

-- Jiangsu Cities (江苏省地级市)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @jiangsu_id, 'CN-32-01', '南京市', 'Nanjing', 'CITY', TRUE, 1, NOW()),
(NULL, @jiangsu_id, 'CN-32-02', '无锡市', 'Wuxi', 'CITY', TRUE, 2, NOW()),
(NULL, @jiangsu_id, 'CN-32-03', '徐州市', 'Xuzhou', 'CITY', TRUE, 3, NOW()),
(NULL, @jiangsu_id, 'CN-32-04', '常州市', 'Changzhou', 'CITY', TRUE, 4, NOW()),
(NULL, @jiangsu_id, 'CN-32-05', '苏州市', 'Suzhou', 'CITY', TRUE, 5, NOW()),
(NULL, @jiangsu_id, 'CN-32-06', '南通市', 'Nantong', 'CITY', TRUE, 6, NOW()),
(NULL, @jiangsu_id, 'CN-32-07', '连云港市', 'Lianyungang', 'CITY', TRUE, 7, NOW()),
(NULL, @jiangsu_id, 'CN-32-08', '淮安市', 'Huai\'an', 'CITY', TRUE, 8, NOW()),
(NULL, @jiangsu_id, 'CN-32-09', '盐城市', 'Yancheng', 'CITY', TRUE, 9, NOW()),
(NULL, @jiangsu_id, 'CN-32-10', '扬州市', 'Yangzhou', 'CITY', TRUE, 10, NOW()),
(NULL, @jiangsu_id, 'CN-32-11', '镇江市', 'Zhenjiang', 'CITY', TRUE, 11, NOW()),
(NULL, @jiangsu_id, 'CN-32-12', '泰州市', 'Taizhou', 'CITY', TRUE, 12, NOW()),
(NULL, @jiangsu_id, 'CN-32-13', '宿迁市', 'Suqian', 'CITY', TRUE, 13, NOW());

-- Zhejiang Cities (浙江省地级市)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @zhejiang_id, 'CN-33-01', '杭州市', 'Hangzhou', 'CITY', TRUE, 1, NOW()),
(NULL, @zhejiang_id, 'CN-33-02', '宁波市', 'Ningbo', 'CITY', TRUE, 2, NOW()),
(NULL, @zhejiang_id, 'CN-33-03', '温州市', 'Wenzhou', 'CITY', TRUE, 3, NOW()),
(NULL, @zhejiang_id, 'CN-33-04', '嘉兴市', 'Jiaxing', 'CITY', TRUE, 4, NOW()),
(NULL, @zhejiang_id, 'CN-33-05', '湖州市', 'Huzhou', 'CITY', TRUE, 5, NOW()),
(NULL, @zhejiang_id, 'CN-33-06', '绍兴市', 'Shaoxing', 'CITY', TRUE, 6, NOW()),
(NULL, @zhejiang_id, 'CN-33-07', '金华市', 'Jinhua', 'CITY', TRUE, 7, NOW()),
(NULL, @zhejiang_id, 'CN-33-08', '衢州市', 'Quzhou', 'CITY', TRUE, 8, NOW()),
(NULL, @zhejiang_id, 'CN-33-09', '舟山市', 'Zhoushan', 'CITY', TRUE, 9, NOW()),
(NULL, @zhejiang_id, 'CN-33-10', '台州市', 'Taizhou', 'CITY', TRUE, 10, NOW()),
(NULL, @zhejiang_id, 'CN-33-11', '丽水市', 'Lishui', 'CITY', TRUE, 11, NOW());

-- Sichuan Cities (四川省地级市)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @sichuan_id, 'CN-51-01', '成都市', 'Chengdu', 'CITY', TRUE, 1, NOW()),
(NULL, @sichuan_id, 'CN-51-03', '自贡市', 'Zigong', 'CITY', TRUE, 2, NOW()),
(NULL, @sichuan_id, 'CN-51-04', '攀枝花市', 'Panzhihua', 'CITY', TRUE, 3, NOW()),
(NULL, @sichuan_id, 'CN-51-05', '泸州市', 'Luzhou', 'CITY', TRUE, 4, NOW()),
(NULL, @sichuan_id, 'CN-51-06', '德阳市', 'Deyang', 'CITY', TRUE, 5, NOW()),
(NULL, @sichuan_id, 'CN-51-07', '绵阳市', 'Mianyang', 'CITY', TRUE, 6, NOW()),
(NULL, @sichuan_id, 'CN-51-08', '广元市', 'Guangyuan', 'CITY', TRUE, 7, NOW()),
(NULL, @sichuan_id, 'CN-51-09', '遂宁市', 'Suining', 'CITY', TRUE, 8, NOW()),
(NULL, @sichuan_id, 'CN-51-10', '内江市', 'Neijiang', 'CITY', TRUE, 9, NOW()),
(NULL, @sichuan_id, 'CN-51-11', '乐山市', 'Leshan', 'CITY', TRUE, 10, NOW()),
(NULL, @sichuan_id, 'CN-51-13', '南充市', 'Nanchong', 'CITY', TRUE, 11, NOW()),
(NULL, @sichuan_id, 'CN-51-14', '眉山市', 'Meishan', 'CITY', TRUE, 12, NOW()),
(NULL, @sichuan_id, 'CN-51-15', '宜宾市', 'Yibin', 'CITY', TRUE, 13, NOW()),
(NULL, @sichuan_id, 'CN-51-16', '广安市', 'Guang\'an', 'CITY', TRUE, 14, NOW()),
(NULL, @sichuan_id, 'CN-51-17', '达州市', 'Dazhou', 'CITY', TRUE, 15, NOW()),
(NULL, @sichuan_id, 'CN-51-18', '雅安市', 'Ya\'an', 'CITY', TRUE, 16, NOW()),
(NULL, @sichuan_id, 'CN-51-19', '巴中市', 'Bazhong', 'CITY', TRUE, 17, NOW()),
(NULL, @sichuan_id, 'CN-51-20', '资阳市', 'Ziyang', 'CITY', TRUE, 18, NOW());

-- ============================================================================
-- 4. Insert District-Level Divisions (区县级行政区) - Sample Data
-- ============================================================================

-- Get city IDs for reference
SET @guangzhou_id = (SELECT id FROM regions WHERE code = 'CN-44-01');
SET @shenzhen_id = (SELECT id FROM regions WHERE code = 'CN-44-03');
SET @hangzhou_id = (SELECT id FROM regions WHERE code = 'CN-33-01');
SET @chengdu_id = (SELECT id FROM regions WHERE code = 'CN-51-01');

-- Guangzhou Districts (广州市辖区)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @guangzhou_id, 'CN-44-01-03', '荔湾区', 'Liwan District', 'DISTRICT', TRUE, 1, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-04', '越秀区', 'Yuexiu District', 'DISTRICT', TRUE, 2, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-05', '海珠区', 'Haizhu District', 'DISTRICT', TRUE, 3, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-06', '天河区', 'Tianhe District', 'DISTRICT', TRUE, 4, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-11', '白云区', 'Baiyun District', 'DISTRICT', TRUE, 5, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-12', '黄埔区', 'Huangpu District', 'DISTRICT', TRUE, 6, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-13', '番禺区', 'Panyu District', 'DISTRICT', TRUE, 7, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-14', '花都区', 'Huadu District', 'DISTRICT', TRUE, 8, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-15', '南沙区', 'Nansha District', 'DISTRICT', TRUE, 9, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-16', '从化区', 'Conghua District', 'DISTRICT', TRUE, 10, NOW()),
(NULL, @guangzhou_id, 'CN-44-01-17', '增城区', 'Zengcheng District', 'DISTRICT', TRUE, 11, NOW());

-- Shenzhen Districts (深圳市辖区)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @shenzhen_id, 'CN-44-03-03', '罗湖区', 'Luohu District', 'DISTRICT', TRUE, 1, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-04', '福田区', 'Futian District', 'DISTRICT', TRUE, 2, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-05', '南山区', 'Nanshan District', 'DISTRICT', TRUE, 3, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-06', '宝安区', 'Bao\'an District', 'DISTRICT', TRUE, 4, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-07', '龙岗区', 'Longgang District', 'DISTRICT', TRUE, 5, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-08', '盐田区', 'Yantian District', 'DISTRICT', TRUE, 6, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-09', '龙华区', 'Longhua District', 'DISTRICT', TRUE, 7, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-10', '坪山区', 'Pingshan District', 'DISTRICT', TRUE, 8, NOW()),
(NULL, @shenzhen_id, 'CN-44-03-11', '光明区', 'Guangming District', 'DISTRICT', TRUE, 9, NOW());

-- Hangzhou Districts (杭州市辖区)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @hangzhou_id, 'CN-33-01-02', '上城区', 'Shangcheng District', 'DISTRICT', TRUE, 1, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-05', '拱墅区', 'Gongshu District', 'DISTRICT', TRUE, 2, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-06', '西湖区', 'Xihu District', 'DISTRICT', TRUE, 3, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-08', '滨江区', 'Binjiang District', 'DISTRICT', TRUE, 4, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-09', '萧山区', 'Xiaoshan District', 'DISTRICT', TRUE, 5, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-10', '余杭区', 'Yuhang District', 'DISTRICT', TRUE, 6, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-11', '富阳区', 'Fuyang District', 'DISTRICT', TRUE, 7, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-12', '临安区', 'Lin\'an District', 'DISTRICT', TRUE, 8, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-13', '临平区', 'Linping District', 'DISTRICT', TRUE, 9, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-14', '钱塘区', 'Qiantang District', 'DISTRICT', TRUE, 10, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-22', '桐庐县', 'Tonglu County', 'DISTRICT', TRUE, 11, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-27', '淳安县', 'Chun\'an County', 'DISTRICT', TRUE, 12, NOW()),
(NULL, @hangzhou_id, 'CN-33-01-82', '建德市', 'Jiande City', 'DISTRICT', TRUE, 13, NOW());

-- Chengdu Districts (成都市辖区)
INSERT INTO regions (organization_id, parent_region_id, code, name, name_en, region_type, is_active, display_order, created_at) VALUES
(NULL, @chengdu_id, 'CN-51-01-04', '锦江区', 'Jinjiang District', 'DISTRICT', TRUE, 1, NOW()),
(NULL, @chengdu_id, 'CN-51-01-05', '青羊区', 'Qingyang District', 'DISTRICT', TRUE, 2, NOW()),
(NULL, @chengdu_id, 'CN-51-01-06', '金牛区', 'Jinniu District', 'DISTRICT', TRUE, 3, NOW()),
(NULL, @chengdu_id, 'CN-51-01-07', '武侯区', 'Wuhou District', 'DISTRICT', TRUE, 4, NOW()),
(NULL, @chengdu_id, 'CN-51-01-08', '成华区', 'Chenghua District', 'DISTRICT', TRUE, 5, NOW()),
(NULL, @chengdu_id, 'CN-51-01-12', '龙泉驿区', 'Longquanyi District', 'DISTRICT', TRUE, 6, NOW()),
(NULL, @chengdu_id, 'CN-51-01-13', '青白江区', 'Qingbaijiang District', 'DISTRICT', TRUE, 7, NOW()),
(NULL, @chengdu_id, 'CN-51-01-14', '新都区', 'Xindu District', 'DISTRICT', TRUE, 8, NOW()),
(NULL, @chengdu_id, 'CN-51-01-15', '温江区', 'Wenjiang District', 'DISTRICT', TRUE, 9, NOW()),
(NULL, @chengdu_id, 'CN-51-01-16', '双流区', 'Shuangliu District', 'DISTRICT', TRUE, 10, NOW()),
(NULL, @chengdu_id, 'CN-51-01-17', '郫都区', 'Pidu District', 'DISTRICT', TRUE, 11, NOW()),
(NULL, @chengdu_id, 'CN-51-01-18', '新津区', 'Xinjin District', 'DISTRICT', TRUE, 12, NOW());

-- ============================================================================
-- 5. Create Dictionary Items for Quick Reference (Optional)
-- ============================================================================

-- Add dictionary items linking to regions for faster lookup
INSERT INTO dictionary_items (dictionary_id, code, value, value_en, display_order, is_active, metadata, created_at)
SELECT 
    @dict_id,
    code,
    name,
    name_en,
    display_order,
    is_active,
    JSON_OBJECT(
        'region_id', id,
        'region_type', region_type,
        'parent_region_id', parent_region_id
    ),
    NOW()
FROM regions
WHERE organization_id IS NULL AND deleted_at IS NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This is sample data for major provinces and cities
-- 2. Complete district data for all cities should be imported separately
-- 3. Region codes follow GB/T 2260 standard (Chinese administrative division codes)
-- 4. For production use, import full official data from National Bureau of Statistics
-- 5. The metadata JSON in dictionary_items allows quick lookups without JOINing regions table
-- ============================================================================
