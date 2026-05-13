import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const { sign, verify } = jwt;
import { eq } from "drizzle-orm";
import { getDb, getUserByEmail } from "../db";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service";
import { ENV } from "../_core/env";
import { users, refreshTokens } from "../../drizzle/schema";

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId: number, role: string): string {
  return sign(
    { userId, role },
    ENV.jwtSecret || "your-secret-key",
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: number): string {
  return sign(
    { userId },
    ENV.jwtSecret || "your-secret-key",
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    return verify(token, ENV.jwtSecret || "your-secret-key");
  } catch (error) {
    return null;
  }
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(): string {
  return nanoid(32);
}

/**
 * Generate password reset token
 */
export function generateResetToken(): string {
  return nanoid(32);
}

/**
 * Register new user
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; message: string; userId?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database connection failed" };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);

    // Create user
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      verificationToken,
      verificationTokenExpiresAt,
      isEmailVerified: false,
      role: "USER",
      loginMethod: "email",
      openId: `email-${nanoid()}`,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return {
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    return { success: false, message: "Registration failed" };
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}> {
  try {
    const user = await getUserByEmail(email);

    if (!user || !user.password) {
      return { success: false, message: "Invalid credentials" };
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return { success: false, message: "Please verify your email first" };
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials" };
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role || "USER");
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    const db = await getDb();
    if (db) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await db.insert(refreshTokens).values({
        token: refreshToken,
        userId: user.id,
        expiresAt,
      });

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
    }

    return {
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return { success: false, message: "Login failed" };
  }
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database connection failed" };
    }

    // Find user with verification token
    const result = await db.select().from(users).where(eq(users.verificationToken, token));
    const user = result[0];

    if (!user) {
      return { success: false, message: "Invalid verification token" };
    }

    // Check if token is expired
    if (user.verificationTokenExpiresAt && new Date() > user.verificationTokenExpiresAt) {
      return { success: false, message: "Verification token expired" };
    }

    // Mark email as verified
    await db.update(users).set({
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    }).where(eq(users.id, user.id));

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    console.error("[Auth] Email verification error:", error);
    return { success: false, message: "Email verification failed" };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return { success: true, message: "If email exists, reset link will be sent" };
    }

    const resetToken = generateResetToken();
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    const db = await getDb();
    if (db) {
      await db.update(users).set({
        resetToken,
        resetTokenExpiresAt,
      }).where(eq(users.id, user.id));

      // Send reset email
      await sendPasswordResetEmail(email, resetToken);
    }

    return { success: true, message: "If email exists, reset link will be sent" };
  } catch (error) {
    console.error("[Auth] Password reset request error:", error);
    return { success: true, message: "If email exists, reset link will be sent" };
  }
}

/**
 * Reset password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database connection failed" };
    }

    // Find user with reset token
    const result = await db.select().from(users).where(eq(users.resetToken, token));
    const user = result[0];

    if (!user) {
      return { success: false, message: "Invalid reset token" };
    }

    // Check if token is expired
    if (user.resetTokenExpiresAt && new Date() > user.resetTokenExpiresAt) {
      return { success: false, message: "Reset token expired" };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.update(users).set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    }).where(eq(users.id, user.id));

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("[Auth] Password reset error:", error);
    return { success: false, message: "Password reset failed" };
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: boolean; message: string; accessToken?: string }> {
  try {
    const decoded = verifyToken(refreshToken);
    if (!decoded || !decoded.userId) {
      return { success: false, message: "Invalid refresh token" };
    }

    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database connection failed" };
    }

    // Check if refresh token exists in database
    const tokenResult = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    const tokenRecord = tokenResult[0];

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      return { success: false, message: "Refresh token expired" };
    }

    // Get user
    const userResult = await db.select().from(users).where(eq(users.id, decoded.userId));
    const user = userResult[0];

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.role || "USER");

    return { success: true, message: "Token refreshed", accessToken };
  } catch (error) {
    console.error("[Auth] Token refresh error:", error);
    return { success: false, message: "Token refresh failed" };
  }
}

/**
 * Logout user
 */
export async function logoutUser(refreshToken: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database connection failed" };
    }

    // Delete refresh token
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));

    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return { success: false, message: "Logout failed" };
  }
}
