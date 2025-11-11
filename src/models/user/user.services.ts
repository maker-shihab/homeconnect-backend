/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParsedQs } from 'qs';
import { AppError } from '../../shared/utils/AppError';
import { QueryFeatures } from '../../shared/utils/queryFeatures';
import { IUser, IUserCreate, IUserUpdate } from './user.interface';
import { User } from './user.models';

export class UserService {
  public async createUser(userData: IUserCreate): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    const user = new User(userData);
    await user.save();
    user.password = '';

    return user;
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  public async updateUser(
    userId: string,
    updateData: IUserUpdate
  ): Promise<IUser | null> {
    if ((updateData as any).password) {
      delete (updateData as any).password;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  public async getUsers(queryString: ParsedQs) {
    const page = parseInt(queryString.page as string, 10) || 1;
    const limit = parseInt(queryString.limit as string, 10) || 10;

    const baseQuery = User.find().select('-password');
    const countQuery = User.find();

    const features = new QueryFeatures(baseQuery, queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const countFeatures = new QueryFeatures(countQuery, queryString).filter();

    const [users, total] = await Promise.all([
      features.query.lean(),
      countFeatures.query.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export const userService = new UserService();