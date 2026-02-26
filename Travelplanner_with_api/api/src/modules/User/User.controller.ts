import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import UserModel from "./User.model";

const login = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;

  res.json({
    token: user.generateToken(),
  });
};

const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as AuthRequest;
  res.json(user);
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, first_name, last_name, avatar } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const newUser = new UserModel({
      email,
      password,
      first_name,
      last_name,
      avatar,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    next(error);  
  }
};


export { login, getCurrentUser, register };