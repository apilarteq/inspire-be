import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { AppError } from "../errors/app-error";
import { UserModel } from "../types/user";
import { LoginDto, RegisterDto } from "../types/user";

export const authService = {
  async login(args: LoginDto): Promise<UserModel> {
    const user = await User.findOne({ username: args.username });

    if (!user) throw new AppError("User not found", 404);

    const isPasswordValid = await bcrypt.compare(args.password, user.password);

    if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

    return user;
  },

  async register(args: RegisterDto): Promise<UserModel> {
    const user = await User.findOne({ username: args.username });

    if (user) throw new AppError("User already exists", 409);

    const newUser = new User({
      uuid: uuidv4(),
      username: args.username,
      password: await bcrypt.hash(args.password, 10),
    });

    return await newUser.save();
  },
};
