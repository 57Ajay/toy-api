"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const toy_controller_1 = require("../controllers/toy.controller");
const verify_middleware_1 = __importDefault(require("../middlewares/verify.middleware"));
const toyRouter = (0, express_1.Router)();
toyRouter.post('/add-toy', verify_middleware_1.default, toy_controller_1.addToy);
toyRouter.get('/:name', toy_controller_1.getToyByName);
toyRouter.put('/modify/:id', verify_middleware_1.default, toy_controller_1.modifyToy);
toyRouter.delete('/delete/:id', verify_middleware_1.default, toy_controller_1.deleteToy);
exports.default = toyRouter;
