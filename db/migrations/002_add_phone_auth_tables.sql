-- ============================================================================
-- Migration: Add Phone-based Authentication Tables
-- Version: 002
-- Database: MySQL 8.0+
-- Purpose: Add support for phone-based login with verification codes and CAPTCHA
-- ============================================================================

-- 1. Add new columns to users table for phone-based auth
ALTER TABLE users
ADD COLUMN phone VARCHAR(20) NULL COMMENT 'User phone number (unique identifier)',
ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether phone is verified',
ADD COLUMN last_login_method VARCHAR(20) NULL COMMENT 'Last login method (PASSWORD, SMS)',
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS mfa_enabled,
DROP COLUMN IF EXISTS mfa_secret;

-- 2. Add unique constraint for phone
CREATE UNIQUE INDEX uk_phone ON users(phone, deleted_at);

-- 3. Create verification_codes table for SMS-based login
CREATE TABLE IF NOT EXISTS verification_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    code VARCHAR(10) NOT NULL COMMENT '6-digit verification code',
    code_type VARCHAR(50) NOT NULL DEFAULT 'LOGIN' COMMENT 'Type of code: LOGIN, RESET_PASSWORD, etc.',
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone_type (phone, code_type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_verified_at (verified_at),
    CONSTRAINT fk_vc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SMS verification codes for phone-based authentication';

-- 4. Create captcha_challenges table for password login security
CREATE TABLE IF NOT EXISTS captcha_challenges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    challenge_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique challenge identifier',
    challenge_answer VARCHAR(100) NOT NULL COMMENT 'Correct answer to the challenge',
    challenge_type VARCHAR(50) NOT NULL DEFAULT 'IMAGE' COMMENT 'Type of challenge: IMAGE, MATH, etc.',
    challenge_image_url TEXT NULL COMMENT 'Image URL or challenge question',
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    phone VARCHAR(20) NULL COMMENT 'Associated phone number if available',
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CAPTCHA challenges for password-based login';

-- 5. Verify migrations
SELECT 'Migration completed successfully' as Status;
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'phone';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('verification_codes', 'captcha_challenges');
