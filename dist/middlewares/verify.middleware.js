"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const apiError_1 = __importDefault(require("../utils/apiError"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
(0, dotenv_1.config)({ path: ".env" });
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        console.log("token:\n", token);
        if (!token) {
            throw new apiError_1.default("Unauthorized - No token provided", 401);
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new apiError_1.default("Internal Server Error - Token secret is not defined", 500);
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("decoded token: \n", decodedToken);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new apiError_1.default("Unauthorized - Invalid token", 401));
        }
        else if (error instanceof apiError_1.default) {
            next(error);
        }
        else {
            next(new apiError_1.default(error.message || "Internal Server Error", error.status || 500));
        }
    }
});
exports.default = verifyToken;
