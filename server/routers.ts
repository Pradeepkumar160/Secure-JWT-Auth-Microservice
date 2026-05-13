import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth.router";
import { userRouter } from "./routers/user.router";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
