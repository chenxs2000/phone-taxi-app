// 通用类型定义

export type ObjectId = string;

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginationResponse<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type GeoLocation = {
  lat: number;
  lng: number;
};

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
};

// 订单相关类型
export enum OrderType {
  INSTANT = 1, // 即时
  BOOKING = 2, // 预约
  URGENT = 3, // 紧急
}

export enum CarType {
  NORMAL = 1, // 普通
  COMFORT = 2, // 舒适
  ACCESSIBLE = 3, // 无障碍
}

export enum OrderStatus {
  PENDING_DISPATCH = 0, // 待派单
  PENDING_ACCEPT = 1, // 待接单
  ACCEPTED = 2, // 已接单
  ARRIVED = 3, // 已到达
  IN_PROGRESS = 4, // 行程中
  COMPLETED = 5, // 已完成
  CANCELLED = 6, // 已取消
  TIMEOUT = 7, // 已超时
}

// 司机相关类型
export enum DriverStatus {
  IDLE = 1, // 空闲
  ACCEPTING = 2, // 接单中
  IN_TRIP = 3, // 载客
  OFFLINE = 4, // 下线
}

// 支付相关类型
export enum PaymentType {
  CASH = 1, // 现金
  DEPUTY = 2, // 代付
  ACCOUNT = 3, // 账户
}

export enum PaymentStatus {
  PENDING = 0, // 待支付
  PAID = 1, // 已支付
  REFUNDED = 2, // 已退款
  CANCELLED = 3, // 已取消
}

// 用户相关类型
export enum UserStatus {
  DISABLED = 0, // 禁用
  NORMAL = 1, // 正常
}

// 响应类型
export type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
  timestamp: number;
};

export type ErrorResponse = {
  code: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: number;
};
