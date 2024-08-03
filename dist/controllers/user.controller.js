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
exports.userLogout = exports.userLogin = exports.userRegistration = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const prisma = new client_1.PrismaClient();
const generateAccessAndRefreshToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new apiError_1.default("User not found", 404);
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new apiError_1.default("No AccessToken Provided", 400);
        }
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new apiError_1.default('REFRESH_TOKEN_SECRET is not defined in the environment', 500);
        }
        const accessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d'
        });
        yield prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new apiError_1.default(`Something went wrong: ${error.message}`, 500);
    }
});
const userRegistration = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json(new apiResponse_1.default("User already exists", null, 400));
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create a new user
        const newUser = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        res.status(201).json(new apiResponse_1.default("User registered successfully", {
            email: newUser.email,
            name: newUser.name,
            id: newUser.id
        }, 201));
    }
    catch (error) {
        res.status(500).json(new apiError_1.default(`Something went wrong: ${error.message}`, 500));
    }
}));
exports.userRegistration = userRegistration;
const userLogin = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new apiError_1.default('Email and password are required', 400);
    }
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new apiError_1.default('Invalid credentials', 401);
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new apiError_1.default('Invalid credentials', 401);
    }
    const { accessToken, refreshToken } = yield generateAccessAndRefreshToken(user.email);
    yield prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(200).json(new apiResponse_1.default("User logged in successfully", { accessToken, refreshToken, user: {
            name: user.name,
            email: user.email,
            id: user.id
        } }, 200));
}));
exports.userLogin = userLogin;
const userLogout = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        console.log("email:\n", email);
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (user) {
            yield prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null },
            });
        }
        res.status(200).json(new apiResponse_1.default('User logged out successfully', null, 200));
    }
    catch (error) {
        res.status(500).json(new apiError_1.default(`Something went wrong: ${error.message}`, 500));
    }
}));
exports.userLogout = userLogout;
