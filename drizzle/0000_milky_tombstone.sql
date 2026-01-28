CREATE TABLE `amenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`category` enum('utilities','facilities','recreation','accessibility','other') NOT NULL,
	`icon` varchar(64),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `amenities_id` PRIMARY KEY(`id`),
	CONSTRAINT `amenities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`availableDate` timestamp NOT NULL,
	`status` enum('available','reserved','unavailable','unknown') NOT NULL,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_date_unique` UNIQUE(`siteId`,`availableDate`)
);
--> statement-breakpoint
CREATE TABLE `campgroundAmenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campgroundId` int NOT NULL,
	`amenityId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campgroundAmenities_id` PRIMARY KEY(`id`),
	CONSTRAINT `campground_amenity_unique` UNIQUE(`campgroundId`,`amenityId`)
);
--> statement-breakpoint
CREATE TABLE `campgrounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(128),
	`name` varchar(255) NOT NULL,
	`description` text,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`address` text,
	`city` varchar(128),
	`state` varchar(2),
	`zipCode` varchar(10),
	`campgroundType` enum('tent','rv','cabin','dispersed','group','mixed') NOT NULL,
	`managingOrganization` varchar(255),
	`bookingUrl` text,
	`phoneNumber` varchar(20),
	`reservable` boolean DEFAULT true,
	`dataSource` varchar(64) NOT NULL,
	`dataSourceUrl` text,
	`photos` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSyncedAt` timestamp,
	CONSTRAINT `campgrounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`type` enum('api','scraper','manual') NOT NULL,
	`baseUrl` text,
	`apiKey` text,
	`rateLimit` int,
	`rateLimitWindow` int DEFAULT 60,
	`isActive` boolean DEFAULT true,
	`lastSyncedAt` timestamp,
	`lastErrorAt` timestamp,
	`lastErrorMessage` text,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataSources_id` PRIMARY KEY(`id`),
	CONSTRAINT `dataSources_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campgroundId` int NOT NULL,
	`externalId` varchar(128),
	`siteName` varchar(128) NOT NULL,
	`siteNumber` varchar(64),
	`siteType` enum('tent','rv','cabin','group','equestrian','boat') NOT NULL,
	`maxOccupancy` int,
	`maxVehicles` int,
	`rvMaxLength` int,
	`pricePerNight` decimal(8,2),
	`currency` varchar(3) DEFAULT 'USD',
	`hasWater` boolean DEFAULT false,
	`hasElectric` boolean DEFAULT false,
	`hasSewer` boolean DEFAULT false,
	`hasFireRing` boolean DEFAULT false,
	`hasPicnicTable` boolean DEFAULT false,
	`isPetFriendly` boolean DEFAULT false,
	`isAccessible` boolean DEFAULT false,
	`amenitiesJson` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `availability` ADD CONSTRAINT `availability_siteId_sites_id_fk` FOREIGN KEY (`siteId`) REFERENCES `sites`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campgroundAmenities` ADD CONSTRAINT `campgroundAmenities_campgroundId_campgrounds_id_fk` FOREIGN KEY (`campgroundId`) REFERENCES `campgrounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campgroundAmenities` ADD CONSTRAINT `campgroundAmenities_amenityId_amenities_id_fk` FOREIGN KEY (`amenityId`) REFERENCES `amenities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sites` ADD CONSTRAINT `sites_campgroundId_campgrounds_id_fk` FOREIGN KEY (`campgroundId`) REFERENCES `campgrounds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `site_idx` ON `availability` (`siteId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `availability` (`availableDate`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `availability` (`status`);--> statement-breakpoint
CREATE INDEX `externalId_idx` ON `campgrounds` (`externalId`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `campgrounds` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `state_idx` ON `campgrounds` (`state`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `campgrounds` (`campgroundType`);--> statement-breakpoint
CREATE INDEX `campground_idx` ON `sites` (`campgroundId`);--> statement-breakpoint
CREATE INDEX `site_type_idx` ON `sites` (`siteType`);