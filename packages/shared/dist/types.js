"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccidentType = exports.PhotoAngle = exports.QuoteStatus = exports.RequestStatus = exports.VehicleCategory = exports.UserStatus = exports.UserRole = void 0;
// ===== 사용자 =====
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["COMPANY"] = "COMPANY";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["PENDING"] = "PENDING";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// ===== 차량 배기량 카테고리 =====
var VehicleCategory;
(function (VehicleCategory) {
    VehicleCategory["UNDER_2000CC"] = "UNDER_2000CC";
    VehicleCategory["CC_2000_3000"] = "CC_2000_3000";
    VehicleCategory["CC_3000_4000"] = "CC_3000_4000";
    VehicleCategory["OVER_4000CC_OR_EV"] = "OVER_4000CC_OR_EV";
})(VehicleCategory || (exports.VehicleCategory = VehicleCategory = {}));
// ===== 대차 요청 =====
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "PENDING";
    RequestStatus["MATCHING"] = "MATCHING";
    RequestStatus["CONFIRMED"] = "CONFIRMED";
    RequestStatus["IN_USE"] = "IN_USE";
    RequestStatus["RETURNED"] = "RETURNED";
    RequestStatus["CANCELLED"] = "CANCELLED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
// ===== 업체 견적 응답 =====
var QuoteStatus;
(function (QuoteStatus) {
    QuoteStatus["PENDING"] = "PENDING";
    QuoteStatus["ACCEPTED"] = "ACCEPTED";
    QuoteStatus["REJECTED"] = "REJECTED";
    QuoteStatus["EXPIRED"] = "EXPIRED";
})(QuoteStatus || (exports.QuoteStatus = QuoteStatus = {}));
// ===== 차량 사진 부위 =====
var PhotoAngle;
(function (PhotoAngle) {
    PhotoAngle["FRONT"] = "FRONT";
    PhotoAngle["REAR"] = "REAR";
    PhotoAngle["LEFT"] = "LEFT";
    PhotoAngle["RIGHT"] = "RIGHT";
    PhotoAngle["FRONT_LEFT"] = "FRONT_LEFT";
    PhotoAngle["FRONT_RIGHT"] = "FRONT_RIGHT";
    PhotoAngle["REAR_LEFT"] = "REAR_LEFT";
    PhotoAngle["REAR_RIGHT"] = "REAR_RIGHT";
    PhotoAngle["DASHBOARD"] = "DASHBOARD";
    PhotoAngle["WHEEL_FRONT_LEFT"] = "WHEEL_FRONT_LEFT";
    PhotoAngle["WHEEL_FRONT_RIGHT"] = "WHEEL_FRONT_RIGHT";
    PhotoAngle["WHEEL_REAR_LEFT"] = "WHEEL_REAR_LEFT";
    PhotoAngle["WHEEL_REAR_RIGHT"] = "WHEEL_REAR_RIGHT";
})(PhotoAngle || (exports.PhotoAngle = PhotoAngle = {}));
// ===== 사고 유형 =====
var AccidentType;
(function (AccidentType) {
    AccidentType["REAR_END"] = "REAR_END";
    AccidentType["SIDE_COLLISION"] = "SIDE_COLLISION";
    AccidentType["FRONT_COLLISION"] = "FRONT_COLLISION";
    AccidentType["SINGLE"] = "SINGLE";
    AccidentType["OTHER"] = "OTHER";
})(AccidentType || (exports.AccidentType = AccidentType = {}));
