import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb, getAllUsers } from "../db";
import { users } from "../../drizzle/schema";

const updateUserRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
});

const deleteUserSchema = z.object({
  userId: z.number(),
});

/**
 * @openapi
 * tags:
 *   name: User
 *   description: User management
 */

export const userRouter = router({
  /**
   * @openapi
   * /user.getAllUsers:
   *   get:
   *     summary: Get all users (admin only)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  getAllUsers: adminProcedure.query(async () => {
    try {
      const allUsers = await getAllUsers();
      return {
        success: true,
        users: allUsers.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isEmailVerified: u.isEmailVerified,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
      };
    } catch (error) {
      console.error("[User] Failed to get all users:", error);
      return { success: false, message: "Failed to fetch users" };
    }
  }),

  /**
   * @openapi
   * /user.updateUserRole:
   *   post:
   *     summary: Update user role (admin only)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  updateUserRole: adminProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, message: "Database connection failed" };
        }

        // Prevent changing own role
        if (input.userId === ctx.user?.id) {
          return { success: false, message: "Cannot change your own role" };
        }

        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

        return { success: true, message: "User role updated successfully" };
      } catch (error) {
        console.error("[User] Failed to update user role:", error);
        return { success: false, message: "Failed to update user role" };
      }
    }),

  /**
   * @openapi
   * /user.deleteUser:
   *   post:
   *     summary: Delete user (admin only)
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  deleteUser: adminProcedure
    .input(deleteUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: false, message: "Database connection failed" };
        }

        // Prevent deleting own account
        if (input.userId === ctx.user?.id) {
          return { success: false, message: "Cannot delete your own account" };
        }

        await db.delete(users).where(eq(users.id, input.userId));

        return { success: true, message: "User deleted successfully" };
      } catch (error) {
        console.error("[User] Failed to delete user:", error);
        return { success: false, message: "Failed to delete user" };
      }
    }),

  /**
   * @openapi
   * /user.getProfile:
   *   get:
   *     summary: Get user profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   */
  getProfile: protectedProcedure.query(({ ctx }) => {
    if (!ctx.user) {
        return { success: false, message: "User not found" };
    }
    return {
      success: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
        isEmailVerified: ctx.user.isEmailVerified,
        createdAt: ctx.user.createdAt,
      },
    };
  }),
});
