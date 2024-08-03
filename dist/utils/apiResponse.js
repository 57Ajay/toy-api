"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(message = "successful", data, statuscode) {
        this.message = message;
        this.data = data;
        this.statuscode = statuscode;
        this.success = statuscode < 400;
    }
}
;
exports.default = ApiResponse;
