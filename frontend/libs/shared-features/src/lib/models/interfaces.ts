/**
 * 通用接口定义
 * 为所有功能模块提供统一的数据结构
 */

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  version: number;
}

/**
 * 带组织ID的基础实体（多租户支持）
 */
export interface TenantEntity extends BaseEntity {
  organizationId: number;
}

/**
 * 用户信息接口
 */
export interface User extends TenantEntity {
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DISPATCHER = 'DISPATCHER',
  DRIVER = 'DRIVER',
  EMPLOYEE = 'EMPLOYEE'
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * 搜索参数接口
 */
export interface SearchParams extends PaginationParams {
  keyword?: string;
  status?: string;
  filters?: { [key: string]: any };
}

/**
 * 司机信息接口
 */
export interface Driver extends TenantEntity {
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  idCard: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  licenseInfo: {
    licenseNumber: string;
    licenseType: string;
    issueDate: Date;
    expiryDate: Date;
    issuingAuthority: string;
  };
  status: DriverStatus;
  hireDate: Date;
  terminationDate?: Date;
  notes?: string;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 司机状态枚举
 */
export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * 车辆信息接口
 */
export interface Vehicle extends TenantEntity {
  plateNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string; // 车辆识别号
  engineNumber: string;
  purchaseDate: Date;
  purchasePrice: number;
  status: VehicleStatus;
  insuranceInfo: {
    insuranceCompany: string;
    policyNumber: string;
    issueDate: Date;
    expiryDate: Date;
    coverage: string;
  };
  maintenanceInfo: {
    lastMaintenanceDate: Date;
    nextMaintenanceDate: Date;
    mileage: number;
    maintenanceNotes: string;
  };
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 车辆类型枚举
 */
export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  MOTORCYCLE = 'MOTORCYCLE',
  OTHER = 'OTHER'
}

/**
 * 车辆状态枚举
 */
export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RESERVED = 'RESERVED'
}

/**
 * 订单信息接口
 */
export interface Order extends TenantEntity {
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  pickupInfo: {
    address: string;
    contactName: string;
    contactPhone: string;
    preferredDate: Date;
    actualDate?: Date;
    notes?: string;
  };
  deliveryInfo: {
    address: string;
    contactName: string;
    contactPhone: string;
    preferredDate: Date;
    actualDate?: Date;
    notes?: string;
  };
  cargoInfo: {
    name: string;
    description: string;
    weight: number;
    volume: number;
    quantity: number;
    value: number;
    specialRequirements?: string;
  };
  driverId?: number;
  vehicleId?: number;
  status: OrderStatus;
  price: number;
  currency: string;
  estimatedDistance: number;
  estimatedDuration: number;
  actualDistance?: number;
  actualDuration?: number;
  notes?: string;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

/**
 * 安全记录接口
 */
export interface SafetyRecord extends TenantEntity {
  recordNumber: string;
  type: SafetyRecordType;
  severity: SafetySeverity;
  title: string;
  description: string;
  location: string;
  incidentDate: Date;
  reportedDate: Date;
  reportedBy: number; // 用户ID
  assignedTo?: number; // 用户ID
  status: SafetyRecordStatus;
  attachments: SafetyAttachment[];
  investigation: {
    findings: string;
    rootCause: string;
    correctiveActions: string;
    preventiveActions: string;
  };
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 安全记录类型枚举
 */
export enum SafetyRecordType {
  ACCIDENT = 'ACCIDENT',
  NEAR_MISS = 'NEAR_MISS',
  VEHICLE_INCIDENT = 'VEHICLE_INCIDENT',
  DRIVING_VIOLATION = 'DRIVING_VIOLATION',
  SAFETY_VIOLATION = 'SAFETY_VIOLATION',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE'
}

/**
 * 安全严重程度枚举
 */
export enum SafetySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 安全记录状态枚举
 */
export enum SafetyRecordStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

/**
 * 安全附件接口
 */
export interface SafetyAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: number;
  filePath: string;
}

/**
 * 司机证件接口
 */
export interface DriverLicense extends TenantEntity {
  driverId: number;
  licenseType: LicenseType;
  licenseNumber: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  status: LicenseStatus;
  attachments: LicenseAttachment[];
  notes?: string;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 证件类型枚举
 */
export enum LicenseType {
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  TRANSPORT_CERTIFICATE = 'TRANSPORT_CERTIFICATE',
  HEALTH_CERTIFICATE = 'HEALTH_CERTIFICATE',
  ROAD_TRANSPORT_CERTIFICATE = 'ROAD_TRANSPORT_CERTIFICATE'
}

/**
 * 证件状态枚举
 */
export enum LicenseStatus {
  VALID = 'VALID',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED'
}

/**
 * 证件附件接口
 */
export interface LicenseAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: number;
  filePath: string;
}

/**
 * 车辆保险接口
 */
export interface VehicleInsurance extends TenantEntity {
  vehicleId: number;
  insuranceType: InsuranceType;
  policyNumber: string;
  insuranceCompany: string;
  issueDate: Date;
  expiryDate: Date;
  premiumAmount: number;
  currency: string;
  coverage: string;
  status: InsuranceStatus;
  attachments: InsuranceAttachment[];
  claims: InsuranceClaim[];
  notes?: string;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 保险类型枚举
 */
export enum InsuranceType {
  COMPULSORY = 'COMPULSORY', // 交强险
  COMMERCIAL = 'COMMERCIAL', // 商业险
  CARGO = 'CARGO' // 货物险
}

/**
 * 保险状态枚举
 */
export enum InsuranceStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

/**
 * 保险附件接口
 */
export interface InsuranceAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: number;
  filePath: string;
}

/**
 * 保险理赔接口
 */
export interface InsuranceClaim {
  id: number;
  claimNumber: string;
  claimDate: Date;
  incidentDate: Date;
  claimAmount: number;
  status: InsuranceClaimStatus;
  description: string;
  settlementDate?: Date;
  settlementAmount?: number;
}

/**
 * 理赔状态枚举
 */
export enum InsuranceClaimStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED'
}

/**
 * 财务记录接口
 */
export interface FinanceRecord extends TenantEntity {
  type: FinanceRecordType;
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  referenceNumber?: string;
  orderId?: number;
  vehicleId?: number;
  driverId?: number;
  attachments: FinanceAttachment[];
  status: FinanceRecordStatus;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 财务记录类型枚举
 */
export enum FinanceRecordType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

/**
 * 财务记录状态枚举
 */
export enum FinanceRecordStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

/**
 * 财务附件接口
 */
export interface FinanceAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: number;
  filePath: string;
}

/**
 * 字典项接口
 */
export interface DictionaryItem extends TenantEntity {
  category: string;
  code: string;
  name: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 审批流程接口
 */
export interface ApprovalWorkflow extends TenantEntity {
  workflowType: ApprovalWorkflowType;
  entityType: string;
  entityId: number;
  applicantId: number;
  approverId: number;
  status: ApprovalStatus;
  requestData: any;
  approvalData?: any;
  comments?: string;
  submittedAt: Date;
  approvedAt?: Date;
  createdByUserId: number;
  updatedByUserId: number;
}

/**
 * 审批流程类型枚举
 */
export enum ApprovalWorkflowType {
  LICENSE_RENEWAL = 'LICENSE_RENEWAL',
  INSURANCE_RENEWAL = 'INSURANCE_RENEWAL',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  EXPENSE_CLAIM = 'EXPENSE_CLAIM'
}

/**
 * 审批状态枚举
 */
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
