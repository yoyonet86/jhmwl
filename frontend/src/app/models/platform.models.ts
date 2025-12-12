// Platform Models for Core Modules

// Driver Module Models
export interface Driver {
  id: number;
  employeeId: string;
  userId: number;
  organizationId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiryDate: string;
  status: DriverStatus;
  avatar?: string;
  hireDate: string;
  emergencyContact?: EmergencyContact;
  performance: DriverPerformance;
  certifications: DriverCertification[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface DriverPerformance {
  totalDeliveries: number;
  completedDeliveries: number;
  onTimeDeliveries: number;
  averageRating: number;
  safetyScore: number;
  totalMiles: number;
  fuelEfficiency: number;
  lastPerformanceReview?: string;
}

export interface DriverCertification {
  id: number;
  name: string;
  type: CertificationType;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  status: CertificationStatus;
  documentUrl?: string;
}

export enum LicenseType {
  CLASS_A = 'CLASS_A',
  CLASS_B = 'CLASS_B', 
  CLASS_C = 'CLASS_C',
  MOTORCYCLE = 'MOTORCYCLE',
  COMMERCIAL = 'COMMERCIAL'
}

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export enum CertificationType {
  SAFETY_TRAINING = 'SAFETY_TRAINING',
  HAZMAT = 'HAZMAT',
  FIRST_AID = 'FIRST_AID',
  DEFENSIVE_DRIVING = 'DEFENSIVE_DRIVING',
  COMPANY_SPECIFIC = 'COMPANY_SPECIFIC'
}

export enum CertificationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  EXPIRING_SOON = 'EXPIRING_SOON',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED'
}

// Vehicle Module Models
export interface Vehicle {
  id: number;
  plateNumber: string;
  organizationId: number;
  make: string;
  model: string;
  year: number;
  vin?: string;
  type: VehicleType;
  status: VehicleStatus;
  capacity: VehicleCapacity;
  fuel: FuelType;
  currentDriverId?: number;
  currentDriver?: Driver;
  location: VehicleLocation;
  specifications: VehicleSpecifications;
  maintenance: VehicleMaintenance;
  inspections: VehicleInspection[];
  documents: VehicleDocument[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface VehicleCapacity {
  maxWeight: number;
  volume: number;
  dimensions: Dimensions;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'M' | 'CM' | 'IN' | 'FT';
}

export interface VehicleLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  lastUpdated: string;
}

export interface VehicleSpecifications {
  engine: string;
  transmission: string;
  drivetrain: string;
  seating: number;
  color?: string;
  features: string[];
}

export interface VehicleMaintenance {
  lastServiceDate: string;
  nextServiceDate: string;
  nextServiceMileage: number;
  currentMileage: number;
  serviceHistory: ServiceRecord[];
  upcomingServices: UpcomingService[];
  issues: MaintenanceIssue[];
}

export interface ServiceRecord {
  id: number;
  serviceType: string;
  description: string;
  serviceDate: string;
  mileage: number;
  cost: number;
  serviceProvider: string;
  partsUsed: PartUsed[];
  status: ServiceStatus;
}

export interface PartUsed {
  partNumber: string;
  partName: string;
  quantity: number;
  cost: number;
}

export interface UpcomingService {
  serviceType: string;
  description: string;
  dueDate: string;
  dueMileage: number;
  priority: Priority;
  estimatedCost: number;
}

export interface MaintenanceIssue {
  id: number;
  description: string;
  severity: Severity;
  reportedBy: string;
  reportedDate: string;
  status: IssueStatus;
  assignedTo?: string;
  resolvedDate?: string;
}

export interface VehicleInspection {
  id: number;
  inspectorId: number;
  inspectorName: string;
  inspectionDate: string;
  type: InspectionType;
  result: InspectionResult;
  score: number;
  items: InspectionItem[];
  notes?: string;
  photos: string[];
  status: InspectionStatus;
}

export interface InspectionItem {
  category: string;
  item: string;
  status: ItemStatus;
  notes?: string;
  severity?: Severity;
}

export interface VehicleDocument {
  id: number;
  name: string;
  type: DocumentType;
  url: string;
  expiryDate?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRAILER = 'TRAILER',
  SPECIALIZED = 'SPECIALIZED'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RESERVED = 'RESERVED'
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  CNG = 'CNG',
  LPG = 'LPG'
}

export enum ServiceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum InspectionType {
  PRE_TRIP = 'PRE_TRIP',
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY',
  POST_ACCIDENT = 'POST_ACCIDENT'
}

export enum InspectionResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL_PASS = 'CONDITIONAL_PASS'
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ItemStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  REQUIRES_ATTENTION = 'REQUIRES_ATTENTION'
}

export enum DocumentType {
  REGISTRATION = 'REGISTRATION',
  INSURANCE = 'INSURANCE',
  PERMIT = 'PERMIT',
  CERTIFICATE = 'CERTIFICATE',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER'
}

export enum DocumentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING_RENEWAL = 'PENDING_RENEWAL',
  CANCELLED = 'CANCELLED'
}