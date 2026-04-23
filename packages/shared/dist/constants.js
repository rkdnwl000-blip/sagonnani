"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMISSION_MAX = exports.COMMISSION_MIN = exports.QUOTE_EXPIRY_MINUTES = exports.REQUEST_STATUS_LABELS = exports.ACCIDENT_TYPE_LABELS = exports.VEHICLE_CATEGORY_LABELS = void 0;
exports.VEHICLE_CATEGORY_LABELS = {
    UNDER_2000CC: '2000cc 미만 (국산 준중형/중형)',
    CC_2000_3000: '2000~3000cc (국산 대형/수입 중형)',
    CC_3000_4000: '3000~4000cc (고배기량 수입/SUV)',
    OVER_4000CC_OR_EV: '4000cc 이상 / 전기차 (럭셔리/EV)',
};
exports.ACCIDENT_TYPE_LABELS = {
    REAR_END: '추돌 사고',
    SIDE_COLLISION: '측면 충돌',
    FRONT_COLLISION: '정면 충돌',
    SINGLE: '단독 사고',
    OTHER: '기타',
};
exports.REQUEST_STATUS_LABELS = {
    PENDING: '대기 중',
    MATCHING: '업체 매칭 중',
    CONFIRMED: '업체 확정',
    IN_USE: '대차 이용 중',
    RETURNED: '반납 완료',
    CANCELLED: '취소됨',
};
// 견적 응답 만료 시간 (분)
exports.QUOTE_EXPIRY_MINUTES = 30;
// 업체 이용 수수료
exports.COMMISSION_MIN = 15000;
exports.COMMISSION_MAX = 25000;
