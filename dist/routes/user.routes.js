"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const verify_middleware_1 = __importDefault(require("../middlewares/verify.middleware"));
const userRouter = (0, express_1.Router)();
userRouter.post("/register", user_controller_1.userRegistration);
userRouter.post("/login", user_controller_1.userLogin);
userRouter.post("/logout", verify_middleware_1.default, user_controller_1.userLogout);
exports.default = userRouter;
