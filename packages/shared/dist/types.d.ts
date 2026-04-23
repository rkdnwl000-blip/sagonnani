export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    COMPANY = "COMPANY",
    ADMIN = "ADMIN"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    PENDING = "PENDING"
}
export declare enum VehicleCategory {
    UNDER_2000CC = "UNDER_2000CC",// 2000cc 미만 (준중형, 중형)
    CC_2000_3000 = "CC_2000_3000",// 2000~3000cc (국산 대형, 수입 중형)
    CC_3000_4000 = "CC_3000_4000",// 3000~4000cc (고배기량 수입, SUV)
    OVER_4000CC_OR_EV = "OVER_4000CC_OR_EV"
}
export declare enum RequestStatus {
    PENDING = "PENDING",// 대기 중
    MATCHING = "MATCHING",// 매칭 중
    CONFIRMED = "CONFIRMED",// 업체 확정
    IN_USE = "IN_USE",// 대차 이용 중
    RETURNED = "RETURNED",// 반납 완료
    CANCELLED = "CANCELLED"
}
export declare enum QuoteStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export declare enum PhotoAngle {
    FRONT = "FRONT",
    REAR = "REAR",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    FRONT_LEFT = "FRONT_LEFT",
    FRONT_RIGHT = "FRONT_RIGHT",
    REAR_LEFT = "REAR_LEFT",
    REAR_RIGHT = "REAR_RIGHT",
    DASHBOARD = "DASHBOARD",
    WHEEL_FRONT_LEFT = "WHEEL_FRONT_LEFT",
    WHEEL_FRONT_RIGHT = "WHEEL_FRONT_RIGHT",
    WHEEL_REAR_LEFT = "WHEEL_REAR_LEFT",
    WHEEL_REAR_RIGHT = "WHEEL_REAR_RIGHT"
}
export declare enum AccidentType {
    REAR_END = "REAR_END",// 추돌
    SIDE_COLLISION = "SIDE_COLLISION",// 측면 충돌
    FRONT_COLLISION = "FRONT_COLLISION",// 정면 충돌
    SINGLE = "SINGLE",// 단독 사고
    OTHER = "OTHER"
}
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
