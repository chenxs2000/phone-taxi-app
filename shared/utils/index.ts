// 工具函数

import { ObjectId } from '../types';

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 生成订单号
 */
export function generateOrderNo(): string {
  const prefix = 'TAXI';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * 生成支付订单号
 */
export function generatePaymentNo(): string {
  const prefix = 'PAY';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * 生成充值订单号
 */
export function generateRechargeNo(): string {
  const prefix = 'RCH';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * 生成提现订单号
 */
export function generateWithdrawNo(): string {
  const prefix = 'WTH';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * 计算两点间距离（米）
 * 使用 Haversine 公式
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // 地球半径（米）
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 角度转弧度
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 计算预估费用
 */
export function calculateEstimatedFare(
  distance: number, // 米
  duration: number, // 秒
  baseFare: number = 13,
  distanceFare: number = 2.3, // 每公里
  timeFare: number = 0.5, // 每分钟
): number {
  const distanceKm = distance / 1000;
  const timeMinutes = duration / 60;

  const fare = baseFare + (distanceKm * distanceFare) + (timeMinutes * timeFare);
  return Math.round(fare * 100) / 100;
}

/**
 * 加密手机号（脱敏）
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 加密身份证号（脱敏）
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 15) return idCard;
  const len = idCard.length;
  const showStart = 3;
  const showEnd = 4;
  return idCard.substring(0, showStart) + '*'.repeat(len - showStart - showEnd) + idCard.substring(len - showEnd);
}

/**
 * 生成验证码
 */
export function generateVerifyCode(length: number = 6): string {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 格式化金额
 */
export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

/**
 * 格式化时间
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * 计算司机得分
 */
export function calculateDriverScore(params: {
  distance: number;
  level: number;
  rating: number;
  completionRate: number;
  idleMinutes: number;
  isElderlyUser?: boolean;
  isUrgentOrder?: boolean;
}): number {
  let score = 0;

  // 距离因素 (权重: 40%)
  const distanceScore = Math.max(0, 100 - params.distance / 30);
  score += distanceScore * 0.4;

  // 司机等级因素 (权重: 20%)
  const levelScore = params.level * 10;
  score += levelScore * 0.2;

  // 完单率因素 (权重: 15%)
  score += params.completionRate * 0.15;

  // 评价因素 (权重: 15%)
  const ratingScore = params.rating * 10;
  score += ratingScore * 0.15;

  // 长期未接单惩罚 (权重: 10%)
  const idleScore = Math.min(params.idleMinutes, 60);
  score += idleScore * 0.1;

  // 老年用户订单加权
  if (params.isElderlyUser) {
    score *= 1.2;
  }

  // 紧急订单加权
  if (params.isUrgentOrder) {
    score *= 1.5;
  }

  return Math.round(score * 100) / 100;
}

/**
 * 判断是否在服务时间内
 */
export function isWithinServiceTime(): boolean {
  const now = new Date();
  const hour = now.getHours();
  // 服务时间：6:00 - 23:00
  return hour >= 6 && hour < 23;
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await delay(delayMs);
      }
    }
  }

  throw lastError!;
}

/**
 * 分页参数处理
 */
export function getPaginationParams(
  page?: number,
  pageSize?: number,
) {
  const p = Math.max(page || 1, 1);
  const ps = Math.min(Math.max(pageSize || 20, 1), 100);
  return {
    page: p,
    pageSize: ps,
    skip: (p - 1) * ps,
  };
}

/**
 * 构建成功响应
 */
export function successResponse<T>(data: T, message?: string) {
  return {
    code: 200,
    message: message || '操作成功',
    data,
    timestamp: Date.now(),
  };
}

/**
 * 构建错误响应
 */
export function errorResponse(
  code: number,
  message: string,
  errors?: Array<{ field: string; message: string }>,
) {
  return {
    code,
    message,
    errors,
    timestamp: Date.now(),
  };
}
