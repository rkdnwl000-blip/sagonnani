// ===== 사용자 =====
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

// ===== 차량 배기량 카테고리 =====
export enum VehicleCategory {
  UNDER_2000CC = 'UNDER_2000CC',           // 2000cc 미만 (준중형, 중형)
  CC_2000_3000 = 'CC_2000_3000',           // 2000~3000cc (국산 대형, 수입 중형)
  CC_3000_4000 = 'CC_3000_4000',           // 3000~4000cc (고배기량 수입, SUV)
  OVER_4000CC_OR_EV = 'OVER_4000CC_OR_EV', // 4000cc 이상 / 전기차 (럭셔리, EV)
}

// ===== 대차 요청 =====
export enum RequestStatus {
  PENDING = 'PENDING',       // 대기 중
  MATCHING = 'MATCHING',     // 매칭 중
  CONFIRMED = 'CONFIRMED',   // 업체 확정
  IN_USE = 'IN_USE',         // 대차 이용 중
  RETURNED = 'RETURNED',     // 반납 완료
  CANCELLED = 'CANCELLED',   // 취소됨
}

// ===== 업체 견적 응답 =====
export enum QuoteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// ===== 차량 사진 부위 =====
export enum PhotoAngle {
  FRONT = 'FRONT',
  REAR = 'REAR',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  FRONT_LEFT = 'FRONT_LEFT',
  FRONT_RIGHT = 'FRONT_RIGHT',
  REAR_LEFT = 'REAR_LEFT',
  REAR_RIGHT = 'REAR_RIGHT',
  DASHBOARD = 'DASHBOARD',
  WHEEL_FRONT_LEFT = 'WHEEL_FRONT_LEFT',
  WHEEL_FRONT_RIGHT = 'WHEEL_FRONT_RIGHT',
  WHEEL_REAR_LEFT = 'WHEEL_REAR_LEFT',
  WHEEL_REAR_RIGHT = 'WHEEL_REAR_RIGHT',
}

// ===== 사고 유형 =====
export enum AccidentType {
  REAR_END = 'REAR_END',           // 추돌
  SIDE_COLLISION = 'SIDE_COLLISION', // 측면 충돌
  FRONT_COLLISION = 'FRONT_COLLISION', // 정면 충돌
  SINGLE = 'SINGLE',               // 단독 사고
  OTHER = 'OTHER',                 // 기타
}

// ===== API 응답 공통 타입 =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
