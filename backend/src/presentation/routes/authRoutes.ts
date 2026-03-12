import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../../application/services/AuthService";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";


import { authMiddleware } from "../../middleware/auth.middleware";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post("/register", (req, res, next) => authController.register(req, res, next));

authRouter.post("/login", (req, res, next) => authController.login(req, res, next));

authRouter.get("/profile", authMiddleware, (req, res, next) => authController.getProfile(req, res, next));

export default authRouter;
