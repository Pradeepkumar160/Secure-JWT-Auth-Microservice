ALTER TABLE `refreshTokens` MODIFY COLUMN `createdAt` datetime DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` datetime DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `updatedAt` datetime DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` datetime DEFAULT NULL;