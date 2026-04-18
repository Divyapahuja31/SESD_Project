import { IUserRepository } from "../../core/interfaces/IUserRepository";
import { User } from "../../core/entities/User";
import { AppError } from "../../middleware/error.middleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(
    email: string,
    password: string
  ): Promise<{ id: string; email: string; token: string }> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(uuidv4(), email, hashedPassword);
    const savedUser = await this.userRepository.create(newUser);

    const token = this.generateToken(savedUser.id);

    return { id: savedUser.id, email: savedUser.email, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; id: string; email: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = this.generateToken(user.id);
    return { token, id: user.id, email: user.email };
  }

  async getProfile(userId: string): Promise<{ id: string; email: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "Artist identity not found in database archive");
    }
    return { id: user.id, email: user.email };
  }

  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign({ userId }, secret, { expiresIn: "7d" });
  }
}
