import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

const prisma = new PrismaClient();

const addToy = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError('User not authenticated', 401);
    }

    if (!name || !price) {
        throw new ApiError('Name and price are required', 400);
    }

    try {
        const newToy = await prisma.toy.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                userId
            }
        });

        res.status(201).json(new ApiResponse("Toy added successfully", newToy, 201));
    } catch (error: any) {
        throw new ApiError(`Failed to add toy: ${error.message}`, 500);
    }
});

const getToyByName = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;

    try {
        const toys = await prisma.toy.findMany({
            where: {
                name: {
                    contains: name.toLowerCase()
                }
            }
        });

        if (toys.length === 0) {
            throw new ApiError('Toy not found', 404);
        }

        const toy = toys.find(t => t.name.toLowerCase() === name.toLowerCase());

        if (!toy) {
            throw new ApiError('Toy not found', 404);
        }

        res.status(200).json(new ApiResponse("Toy found", toy, 200));
    } catch (error: any) {
        throw new ApiError(`Failed to get toy: ${error.message}`, 500);
    }
});

const modifyToy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError('User not authenticated', 401);
    }

    try {
        const toy = await prisma.toy.findUnique({ where: { id: parseInt(id) } });

        if (!toy) {
            throw new ApiError('Toy not found', 404);
        }

        if (toy.userId !== userId) {
            throw new ApiError('Not authorized to modify this toy', 403);
        }

        const updatedToy = await prisma.toy.update({
            where: { id: parseInt(id) },
            data: {
                name: name || toy.name,
                description: description || toy.description,
                price: price ? parseFloat(price) : toy.price
            }
        });

        res.status(200).json(new ApiResponse("Toy updated successfully", updatedToy, 200));
    } catch (error: any) {
        throw new ApiError(`Failed to update toy: ${error.message}`, 500);
    }
});


const deleteToy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError('User not authenticated', 401);
    }

    try {
        const toy = await prisma.toy.findUnique({ where: { id: parseInt(id) } });

        if (!toy) {
            throw new ApiError('Toy not found', 404);
        }

        if (toy.userId !== userId) {
            throw new ApiError('Not authorized to delete this toy', 403);
        }

        await prisma.toy.delete({ where: { id: parseInt(id) } });

        res.status(200).json(new ApiResponse("Toy deleted successfully", null, 200));
    } catch (error: any) {
        throw new ApiError(`Failed to delete toy: ${error.message}`, 500);
    }
});

export {
    addToy,
    getToyByName,
    modifyToy,
    deleteToy
};