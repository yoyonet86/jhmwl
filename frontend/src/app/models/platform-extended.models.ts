// Safety and Logistics Module Models

// Safety Module Models
export interface SafetyIncident {
  id: number;
  incidentNumber: string;
  organizationId: number;
  title: string;
  description: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  location: IncidentLocation;
  reportedBy: number;
  reportedAt: string;
  occurredAt: string;
  vehicles: number[];
  drivers: number[];
  witnesses: Witness[];
  photos: string[];
  documents: IncidentDocument[];
  actions: IncidentAction[];
  investigation: IncidentInvestigation;
  followUp: FollowUpAction[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentLocation {
  address: string;
  latitude?: number;
  longitude?: number;
  jurisdiction?: string;
  weatherConditions?: string;
  roadConditions?: string;
  trafficConditions?: string;
}

export interface Witness {
  name: string;
  contactInfo: string;
  statement: string;
  interviewedAt?: string;
  interviewedBy?: string;
}

export interface IncidentDocument {
  id: number;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface IncidentAction {
  id: number;
  description: string;
  type: ActionType;
  priority: Priority;
  assignedTo: number;
  assignedBy: number;
  dueDate?: string;
  completedAt?: string;
  status: ActionStatus;
  notes?: string;
}

export interface IncidentInvestigation {
  investigatorId: number;
  investigatorName: string;
  startDate: string;
  completionDate?: string;
  findings: string[];
  rootCause?: string;
  contributingFactors: string[];
  conclusions: string;
  recommendations: string[];
  reportUrl?: string;
}

export interface FollowUpAction {
  id: number;
  description: string;
  type: FollowUpType;
  assignedTo: number;
  dueDate: string;
  completedAt?: string;
  status: ActionStatus;
  reminderSent?: boolean;
}

export interface SafetyMetrics {
  totalIncidents: number;
  incidentsByType: { [key in IncidentType]: number };
  incidentsBySeverity: { [key in Severity]: number };
  incidentsByMonth: { month: string; count: number }[];
  averageResponseTime: number;
  incidentRate: number; // incidents per 100k miles
  nearMisses: number;
  safetyScore: number;
  trend: SafetyTrend;
}

export interface SafetyAlert {
  id: number;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  affectedEntities: AlertEntity[];
  acknowledgedBy?: number;
  acknowledgedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AlertEntity {
  type: EntityType;
  id: number;
  name: string;
}

// Logistics Module Models
export interface Order {
  id: number;
  orderNumber: string;
  organizationId: number;
  customerId: number;
  customer: Customer;
  type: OrderType;
  status: OrderStatus;
  priority: Priority;
  pickupLocation: Location;
  deliveryLocation: Location;
  scheduledPickupAt: string;
  scheduledDeliveryAt: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  items: OrderItem[];
  vehicleId?: number;
  vehicle?: Vehicle;
  driverId?: number;
  driver?: Driver;
  route?: Route;
  totalWeight: number;
  totalVolume: number;
  totalValue: number;
  specialInstructions?: string;
  documents: OrderDocument[];
  trackingEvents: TrackingEvent[];
  costBreakdown: CostBreakdown;
  notes: OrderNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  organizationId: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: Address;
  shippingAddress?: Address;
  taxId?: string;
  paymentTerms: PaymentTerms;
  creditLimit: number;
  status: CustomerStatus;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  name: string;
  address: Address;
  contact: ContactInfo;
  coordinates?: Coordinates;
  accessRequirements?: string[];
  operatingHours?: OperatingHours;
  specialInstructions?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formatted?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  position?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface OrderItem {
  id: number;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  weight: number;
  volume: number;
  unitValue: number;
  totalValue: number;
  fragile: boolean;
  hazardous: boolean;
  specialHandling?: string[];
}

export interface OrderDocument {
  id: number;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TrackingEvent {
  id: number;
  timestamp: string;
  event: TrackingEventType;
  location: Location;
  status: string;
  description: string;
  driverId?: number;
  driverName?: string;
  photos?: string[];
  signature?: string;
}

export interface CostBreakdown {
  baseRate: number;
  fuelSurcharge: number;
  distanceCharge: number;
  weightCharge: number;
  additionalServices: AdditionalServiceCost[];
  taxes: TaxCharge[];
  totalCost: number;
}

export interface AdditionalServiceCost {
  service: string;
  description: string;
  cost: number;
}

export interface TaxCharge {
  type: string;
  rate: number;
  amount: number;
}

export interface OrderNote {
  id: number;
  content: string;
  type: NoteType;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  internal: boolean;
}

export interface Route {
  id: number;
  name: string;
  organizationId: number;
  waypoints: Waypoint[];
  totalDistance: number;
  estimatedDuration: number;
  actualDistance?: number;
  actualDuration?: number;
  optimizationScore?: number;
  trafficConditions?: TrafficCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface Waypoint {
  id: number;
  orderId: number;
  sequence: number;
  location: Location;
  scheduledArrival: string;
  actualArrival?: string;
  duration: number; // minutes
  status: WaypointStatus;
  notes?: string;
}

export interface TrafficCondition {
  location: string;
  severity: Severity;
  description: string;
  estimatedDelay: number;
  startTime: string;
  endTime?: string;
}

// Dictionary Module Models
export interface DictionaryItem {
  id: number;
  organizationId?: number;
  category: string;
  code: string;
  name: string;
  description?: string;
  value: string;
  sortOrder?: number;
  isActive: boolean;
  isSystemItem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DictionaryCategory {
  code: string;
  name: string;
  description?: string;
  items: DictionaryItem[];
  isSystem: boolean;
}

// Employee Module Models
export interface Employee {
  id: number;
  employeeId: string;
  organizationId: number;
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  status: EmployeeStatus;
  type: EmployeeType;
  address: Address;
  emergencyContact: EmergencyContact;
  salary?: SalaryInfo;
  benefits: BenefitInfo[];
  performance: PerformanceRecord[];
  attendance: AttendanceRecord[];
  documents: EmployeeDocument[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryInfo {
  amount: number;
  currency: string;
  frequency: SalaryFrequency;
  effectiveDate: string;
}

export interface BenefitInfo {
  type: BenefitType;
  provider: string;
  coverage: string;
  startDate: string;
  endDate?: string;
  status: BenefitStatus;
}

export interface PerformanceRecord {
  id: number;
  reviewDate: string;
  period: string;
  reviewerId: number;
  reviewerName: string;
  goals: PerformanceGoal[];
  overallRating: number;
  comments: string;
  improvementAreas: string[];
  createdAt: string;
}

export interface PerformanceGoal {
  goal: string;
  target: string;
  actual?: string;
  status: GoalStatus;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  overtime: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface EmployeeDocument {
  id: number;
  name: string;
  type: DocumentType;
  url: string;
  expiryDate?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
}

// Enums for remaining models
export enum IncidentType {
  ACCIDENT = 'ACCIDENT',
  NEAR_MISS = 'NEAR_MISS',
  VIOLATION = 'VIOLATION',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  INJURY = 'INJURY',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  SECURITY_BREACH = 'SECURITY_BREACH',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  OTHER = 'OTHER'
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  PENDING_REVIEW = 'PENDING_REVIEW',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum ActionType {
  INVESTIGATION = 'INVESTIGATION',
  DISCIPLINARY = 'DISCIPLINARY',
  TRAINING = 'TRAINING',
  EQUIPMENT_REPAIR = 'EQUIPMENT_REPAIR',
  PROCESS_IMPROVEMENT = 'PROCESS_IMPROVEMENT',
  POLICY_UPDATE = 'POLICY_UPDATE'
}

export enum ActionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum FollowUpType {
  TRAINING_REQUIRED = 'TRAINING_REQUIRED',
  EQUIPMENT_INSPECTION = 'EQUIPMENT_INSPECTION',
  PROCESS_REVIEW = 'PROCESS_REVIEW',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  FOLLOW_UP_INCIDENT = 'FOLLOW_UP_INCIDENT'
}

export enum SafetyTrend {
  IMPROVING = 'IMPROVING',
  STABLE = 'STABLE',
  DECLINING = 'DECLINING'
}

export enum AlertType {
  SAFETY_INCIDENT = 'SAFETY_INCIDENT',
  EQUIPMENT_ALERT = 'EQUIPMENT_ALERT',
  DRIVER_ALERT = 'DRIVER_ALERT',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
  CERTIFICATION_EXPIRY = 'CERTIFICATION_EXPIRY',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum EntityType {
  VEHICLE = 'VEHICLE',
  DRIVER = 'DRIVER',
  ORDER = 'ORDER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum OrderType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
  INTERNATIONAL = 'INTERNATIONAL',
  HAZMAT = 'HAZMAT',
  TEMPERATURE_CONTROLLED = 'TEMPERATURE_CONTROLLED'
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentTerms {
  NET_30 = 'NET_30',
  NET_15 = 'NET_15',
  NET_60 = 'NET_60',
  COD = 'COD',
  PREPAID = 'PREPAID'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED'
}

export enum TrackingEventType {
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_LOCATION = 'ARRIVED_AT_LOCATION',
  DEPARTED_FROM_LOCATION = 'DEPARTED_FROM_LOCATION',
  DELIVERED = 'DELIVERED',
  FAILED_DELIVERY = 'FAILED_DELIVERY',
  RETURNED = 'RETURNED'
}

export enum NoteType {
  GENERAL = 'GENERAL',
  INTERNAL = 'INTERNAL',
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER'
}

export enum WaypointStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED'
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED'
}

export enum EmployeeType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY'
}

export enum SalaryFrequency {
  HOURLY = 'HOURLY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY'
}

export enum BenefitType {
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  DENTAL = 'DENTAL',
  VISION = 'VISION',
  RETIREMENT_401K = 'RETIREMENT_401K',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  DISABILITY = 'DISABILITY',
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE'
}

export enum BenefitStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum GoalStatus {
  ACHIEVED = 'ACHIEVED',
  PARTIAL = 'PARTIAL',
  MISSED = 'MISSED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  HOLIDAY = 'HOLIDAY',
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE'
}