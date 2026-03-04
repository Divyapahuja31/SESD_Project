import { prisma } from "../database/prisma";
import { IUserRepository } from "../../core/interfaces/IUserRepository";
import { User } from "../../core/entities/User";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(user.id, user.email, user.password);
  }

  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
      },
    });

    return new User(created.id, created.email, created.password);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User(user.id, user.email, user.password);
  }
}