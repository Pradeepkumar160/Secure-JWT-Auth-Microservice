import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  logoutUser,
} from "../services/auth.service";
import { bruteForceMiddleware } from "../middlewares/security.middleware";
import { TRPCError } from "@trpc/server";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const logoutSchema = z.object({
  refreshToken: z.string(),
});

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

export const authRouter = router({
  /**
   * @openapi
   * /auth.register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email: { type: string }
   *               password: { type: string }
   *               name: { type: string }
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      return registerUser(input.email, input.password, input.name);
    }),

  /**
   * @openapi
   * /auth.login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email: { type: string }
   *               password: { type: string }
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await new Promise<void>((resolve, reject) => {
          bruteForceMiddleware(ctx.req, ctx.res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many login attempts, please try again later.",
        });
      }
      
      return loginUser(input.email, input.password);
    }),

  /**
   * @openapi
   * /auth.verifyEmail:
   *   post:
   *     summary: Verify email
   *     tags: [Auth]
   */
  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }) => {
      return verifyEmail(input.token);
    }),

  /**
   * @openapi
   * /auth.requestPasswordReset:
   *   post:
   *     summary: Request password reset
   *     tags: [Auth]
   */
  requestPasswordReset: publicProcedure
    .input(requestPasswordResetSchema)
    .mutation(async ({ input }) => {
      return requestPasswordReset(input.email);
    }),

  /**
   * @openapi
   * /auth.resetPassword:
   *   post:
   *     summary: Reset password
   *     tags: [Auth]
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      return resetPassword(input.token, input.newPassword);
    }),

  /**
   * @openapi
   * /auth.refreshToken:
   *   post:
   *     summary: Refresh access token
   *     tags: [Auth]
   */
  refreshToken: publicProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input }) => {
      return refreshAccessToken(input.refreshToken);
    }),

  /**
   * @openapi
   * /auth.logout:
   *   post:
   *     summary: Logout user
   *     tags: [Auth]
   */
  logout: publicProcedure
    .input(logoutSchema)
    .mutation(async ({ input }) => {
      return logoutUser(input.refreshToken);
    }),

  /**
   * @openapi
   * /auth.getCurrentUser:
   *   get:
   *     summary: Get current user
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   */
  getCurrentUser: protectedProcedure
    .query(({ ctx }) => {
      return {
        success: true,
        user: ctx.user,
      };
    }),
});
