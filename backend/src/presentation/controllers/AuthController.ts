import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../application/services/AuthService";
import { registerSchema, loginSchema } from "../../utils/validation";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
      }

      const { email, password } = parsed.data;
      const result = await this.authService.register(email, password);
      res.status(201).json({ message: "User registered successfully", token: result.token, user: { id: result.id, email: result.email } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "User with this email already exists") {
        res.status(409).json({ error: message });
      } else {
        next(error);
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
      }

      const { email, password } = parsed.data;
      const result = await this.authService.login(email, password);
      res.status(200).json({ message: "Login successful", token: result.token, user: { id: result.id, email: result.email } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Invalid email or password") {
        res.status(401).json({ error: message });
      } else {
        next(error);
      }
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        res.status(401).json({ error: "No valid artist session detected" });
        return;
      }
      const profile = await this.authService.getProfile(user.userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }
}
