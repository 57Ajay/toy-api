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
exports.deleteToy = exports.modifyToy = exports.getToyByName = exports.addToy = void 0;
const client_1 = require("@prisma/client");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const prisma = new client_1.PrismaClient();
const addToy = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description, price } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new apiError_1.default('User not authenticated', 401);
    }
    if (!name || !price) {
        throw new apiError_1.default('Name and price are required', 400);
    }
    try {
        const existingToy = yield prisma.toy.findFirst({
            where: {
                name: name,
                userId: userId
            }
        });
        if (existingToy) {
            return res.status(400).json(new apiResponse_1.default("A toy with the same name already exists", null, 400));
        }
        const newToy = yield prisma.toy.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                userId
            }
        });
        res.status(201).json(new apiResponse_1.default("Toy added successfully", newToy, 201));
    }
    catch (error) {
        throw new apiError_1.default(`Failed to add toy: ${error.message}`, 500);
    }
}));
exports.addToy = addToy;
const getToyByName = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const toys = yield prisma.toy.findMany({
            where: {
                name: {
                    contains: name.toLowerCase()
                }
            }
        });
        if (toys.length === 0) {
            throw new apiError_1.default('Toy not found', 404);
        }
        const toy = toys.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (!toy) {
            throw new apiError_1.default('Toy not found', 404);
        }
        res.status(200).json(new apiResponse_1.default("Toy found", toy, 200));
    }
    catch (error) {
        throw new apiError_1.default(`Failed to get toy: ${error.message}`, 500);
    }
}));
exports.getToyByName = getToyByName;
const modifyToy = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, description, price } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new apiError_1.default('User not authenticated', 401);
    }
    try {
        const toy = yield prisma.toy.findUnique({ where: { id: parseInt(id) } });
        if (!toy) {
            throw new apiError_1.default('Toy not found', 404);
        }
        if (toy.userId !== userId) {
            throw new apiError_1.default('Not authorized to modify this toy', 403);
        }
        const updatedToy = yield prisma.toy.update({
            where: { id: parseInt(id) },
            data: {
                name: name || toy.name,
                description: description || toy.description,
                price: price ? parseFloat(price) : toy.price
            }
        });
        res.status(200).json(new apiResponse_1.default("Toy updated successfully", updatedToy, 200));
    }
    catch (error) {
        throw new apiError_1.default(`Failed to update toy: ${error.message}`, 500);
    }
}));
exports.modifyToy = modifyToy;
const deleteToy = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new apiError_1.default('User not authenticated', 401);
    }
    try {
        const toy = yield prisma.toy.findUnique({ where: { id: parseInt(id) } });
        if (!toy) {
            throw new apiError_1.default('Toy not found', 404);
        }
        if (toy.userId !== userId) {
            throw new apiError_1.default('Not authorized to delete this toy', 403);
        }
        yield prisma.toy.delete({ where: { id: parseInt(id) } });
        res.status(200).json(new apiResponse_1.default("Toy deleted successfully", null, 200));
    }
    catch (error) {
        throw new apiError_1.default(`Failed to delete toy: ${error.message}`, 500);
    }
}));
exports.deleteToy = deleteToy;
