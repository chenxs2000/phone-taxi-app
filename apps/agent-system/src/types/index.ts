// 通用类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
  };
}

// 订单类型
export interface Order {
  _id: string;
  orderNo: string;
  userId: string;
  driverId?: string;
  orderType: number; // 1-即时 2-预约 3-紧急
  carType?: number; // 1-普通 2-舒适 3-无障碍
  passengerCount: number;
  pickup: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  orderStatus: number; // 1-待派单 2-待接单 3-已接单 4-已到达 5-行程中 6-已完成 7-已取消 8-超时
  fare: {
    estimated: number;
    actual?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 司机类型
export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licensePlate: string;
  carModel: string;
  driverStatus: number; // 1-空闲 2-接单中 3-载客 4-下线
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  totalOrders?: number;
  completedOrders?: number;
}

// 统计数据类型
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayRevenue: number;
  monthRevenue: number;
  activeDrivers: number;
  totalDrivers: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  status?: number;
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
