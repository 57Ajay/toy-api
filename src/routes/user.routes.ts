import { Router } from "express";
import { userRegistration, userLogin, userLogout } from "../controllers/user.controller"
import verifyToken from "../middlewares/verify.middleware";

const userRouter = Router();

userRouter.post("/register", userRegistration);
userRouter.post("/login", userLogin);
userRouter.post("/logout", verifyToken, userLogout);


export default userRouter;
