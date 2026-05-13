CREATE TABLE `refreshTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(500) NOT NULL,
	`userId` int NOT NULL,
	`expiresAt` datetime NOT NULL,
	`createdAt` datetime DEFAULT NULL,
	CONSTRAINT `refreshTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refreshTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'email';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('USER','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` datetime DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` datetime DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `updatedAt` datetime DEFAULT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isEmailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationTokenExpiresAt` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiresAt` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);