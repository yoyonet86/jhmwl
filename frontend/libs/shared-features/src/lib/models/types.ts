/**
 * 通用类型定义
 * 为组件库提供常用的类型助手
 */

// 基础类型别名
export type ID = number;
export type DateString = string;
export type PhoneNumber = string;
export type Email = string;
export type URL = string;

// 状态类型
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// 操作结果类型
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// 表格列配置类型
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: T) => string;
  template?: string;
}

// 表格配置类型
export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  pagination?: {
    pageSize: number;
    pageSizeOptions: number[];
  };
  sorting?: {
    defaultSort: { key: keyof T; direction: 'asc' | 'desc' };
  };
  selection?: {
    enabled: boolean;
    mode: 'single' | 'multiple';
  };
}

// 表单字段配置类型
export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
  defaultValue?: any;
  disabled?: boolean;
  readonly?: boolean;
}

// 表单配置类型
export interface FormConfig {
  fields: FormField[];
  layout?: 'vertical' | 'horizontal';
  labelWidth?: string;
  submitText?: string;
  cancelText?: string;
  showReset?: boolean;
}

// 操作按钮配置类型
export interface ActionButton {
  key: string;
  label: string;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon?: string;
  disabled?: boolean;
  visible?: (row?: any) => boolean;
  handler: (row?: any) => void | Promise<void>;
}

// 搜索条件配置类型
export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'daterange';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  defaultValue?: any;
}

// 响应式断点类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 主题类型
export type ThemeType = 'light' | 'dark';

// 通知类型
export type NotificationType = 'success' | 'warning' | 'error' | 'info';

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 模态框配置类型
export interface ModalConfig {
  title: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  closable?: boolean;
  maskClosable?: boolean;
  showFooter?: boolean;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger' | 'default';
  onOk?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
  visible?: boolean;
  divider?: boolean;
}

// 导航配置类型
export interface NavigationConfig {
  mode: 'horizontal' | 'vertical' | 'inline';
  theme: 'light' | 'dark';
  collapsible?: boolean;
  collapsed?: boolean;
  items: MenuItem[];
}

// 文件上传配置类型
export interface UploadConfig {
  action: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  onProgress?: (file: File, progress: number) => void;
  onSuccess?: (file: File, response: any) => void;
  onError?: (file: File, error: any) => void;
}

// 图表配置类型
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: any;
  options?: any;
  height?: number;
}

// 统计数据类型
export interface StatItem {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: string;
  color?: string;
}

// 时间范围类型
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// 地理位置类型
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

// 文件信息类型
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  uploadDate: Date;
  uploadedBy: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    size?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

// 权限类型
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';
  condition?: any;
}

// 角色权限类型
export interface RolePermission {
  role: string;
  permissions: Permission[];
}

// 用户偏好设置类型
export interface UserPreferences {
  theme: ThemeType;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  pageSize: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// 系统配置类型
export interface SystemConfig {
  organization: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    [key: string]: number;
  };
}

// 审计日志类型
export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  userId: number;
  userName: string;
  changes?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// 导出配置类型
export interface ExportConfig {
  format: 'xlsx' | 'csv' | 'pdf';
  filename?: string;
  sheetName?: string;
  columns?: string[];
  filters?: any;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// 导入配置类型
export interface ImportConfig {
  template?: string;
  maxRows?: number;
  skipHeader?: boolean;
  validation?: {
    requiredColumns: string[];
    dataTypes: { [key: string]: string };
    constraints: { [key: string]: any };
  };
}
