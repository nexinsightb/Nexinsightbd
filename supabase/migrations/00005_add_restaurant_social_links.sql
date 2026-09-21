-- Migration: Add Facebook, Instagram, and WhatsApp social links to restaurants table

ALTER TABLE restaurants
ADD COLUMN facebook_url TEXT DEFAULT NULL,
ADD COLUMN instagram_url TEXT DEFAULT NULL,
ADD COLUMN whatsapp_url TEXT DEFAULT NULL;
