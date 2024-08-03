import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';

const prisma = new PrismaClient();

const generateAccessAndRefreshToken = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError("No AccessToken Provided", 400);
        }
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new ApiError('REFRESH_TOKEN_SECRET is not defined in the environment', 500);
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
            }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d'
            }
        );
          
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return { accessToken, refreshToken };

    } catch (error: any) {
        throw new ApiError(`Something went wrong: ${error.message}`, 500);
    }
};

const userRegistration = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json(new ApiResponse("User already exists", null, 400));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        res.status(201).json(new ApiResponse("User registered successfully", {
            email: newUser.email,
            name: newUser.name,
            id: newUser.id
        }, 201));

    } catch (error: any) {
        res.status(500).json(
            new ApiError(`Something went wrong: ${error.message}`, 500)
        );
    }
});

const userLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        throw new ApiError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.email);

    await prisma.user.update({
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

    res.status(200).json(new ApiResponse("User logged in successfully", { accessToken, refreshToken, user: {
        name: user.name,
        email: user.email,
        id: user.id
    } }, 200));
});

const userLogout = asyncHandler(async (req: Request, res: Response) => {
    try {
        
        const email = req.user?.email;
        console.log("email:\n", email);

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });



        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null },
            });
        }

        res.status(200).json(new ApiResponse('User logged out successfully', null, 200));
    } catch (error: any) {
        res.status(500).json(new ApiError(`Something went wrong: ${error.message}`, 500));
    }
});

export {
    userRegistration,
    userLogin,
    userLogout
};
