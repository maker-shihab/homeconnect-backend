import { AppError } from "../../shared/utils/AppError";
import { IUser, IUserCreate, IUserUpdate } from "./user.interface";
import { User } from "./user.models";


export class UserService {
  async createUser(userData: IUserCreate): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    const user = new User(userData);
    return await user.save();
  }

  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(userId: string, updateData: IUserUpdate): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const userService = new UserService();