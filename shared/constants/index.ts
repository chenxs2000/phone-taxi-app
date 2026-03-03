// 常量定义

export const APP = {
  NAME: 'phone-taxi-app',
  VERSION: '1.0.0',
} as const;

export const API = {
  PREFIX: '/api',
  VERSION: 'v1',
} as const;

export const HTTP = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

export const ERROR_CODES = {
  // 通用错误 1001-1999
  INVALID_PARAMS: 1001,
  USER_NOT_FOUND: 1002,
  USER_DISABLED: 1003,
  UNAUTHORIZED: 1004,

  // 订单错误 2001-2999
  ORDER_NOT_FOUND: 2001,
  ORDER_STATUS_ERROR: 2002,
  ORDER_CANCELLED: 2003,
  ORDER_ALREADY_PAID: 2004,

  // 派单错误 3001-3999
  NO_AVAILABLE_DRIVER: 3001,
  DRIVER_OFFLINE: 3002,
  DRIVER_BUSY: 3003,

  // 支付错误 4001-4999
  PAYMENT_FAILED: 4001,
  INSUFFICIENT_BALANCE: 4002,
  PAYMENT_EXPIRED: 4003,
  REFUND_FAILED: 4004,
} as const;

export const MESSAGES = {
  SUCCESS: '操作成功',
  FAILED: '操作失败',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '无权限访问',
  NOT_FOUND: '资源不存在',
  INVALID_PARAMS: '参数错误',
  SERVER_ERROR: '服务器内部错误',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const TOKEN = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
} as const;

export const REDIS = {
  PREFIX: 'phone-taxi:',
  TTL: {
    VERIFICATION_CODE: 300, // 5分钟
    TOKEN: 604800, // 7天
    LOCATION: 300, // 5分钟
    ORDER_CACHE: 3600, // 1小时
  },
} as const;

export const ORDER = {
  DISPATCH_TIMEOUT: 30, // 30秒
  CANCEL_FREE_TIMEOUT: 300, // 5分钟
  BOOKING_REMINDER_MINUTES: 30, // 提前30分钟
  DISPATCH_RADIUS: {
    NORMAL: 3000, // 3公里
    URGENT: 5000, // 5公里
  },
} as const;

export const PAYMENT = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 10000,
  WITHDRAW_MIN: 10,
  WITHDRAW_MAX: 50000,
} as const;

export const CALL = {
  HOTLINE: '400-XXX-TAXI',
  MAX_CONCURRENT: 100,
  ASR_CONFIDENCE_THRESHOLD: 0.85,
  INTENT_CONFIDENCE_THRESHOLD: 0.80,
} as const;

export const VOICE = {
  PROVIDER: 'xunfei', // 科大讯飞
  LANGUAGE: {
    MANDARIN: 'zh_cn',
    CANTONESE: 'zh_cn_gd',
    SICHUAN: 'zh_sc',
  },
} as const;

export const MAP = {
  PROVIDER: 'amap', // 高德地图
  API_KEY: process.env.AMAP_API_KEY || '',
} as const;
