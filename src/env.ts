/**
 * Environment Variable Validation
 *
 * This module provides runtime validation for environment variables used throughout the application.
 * It ensures that required variables are present and correctly typed, failing fast on misconfiguration.
 */

interface EnvironmentVariables {
    PUBLIC_POSTHOG_KEY?: string;
    PUBLIC_DISABLE_UPLOADS?: string;
    CONTEXT?: string;
}

/**
 * Validates that an environment variable is a string if it exists
 */
function validateOptionalString(value: unknown, name: string): string | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (typeof value !== 'string') {
        throw new Error(`Environment variable ${name} must be a string, got ${typeof value}`);
    }

    return value;
}

/**
 * Validates all environment variables at build time
 *
 * @throws {Error} If any required environment variables are missing or invalid
 */
export function validateEnv(): void {
    const errors: string[] = [];

    try {
        // Validate PUBLIC_POSTHOG_KEY as optional string
        if (import.meta.env.PUBLIC_POSTHOG_KEY !== undefined) {
            validateOptionalString(import.meta.env.PUBLIC_POSTHOG_KEY, 'PUBLIC_POSTHOG_KEY');
        }
    } catch (error) {
        if (error instanceof Error) {
            errors.push(error.message);
        }
    }

    try {
        // Validate PUBLIC_DISABLE_UPLOADS as optional string
        if (import.meta.env.PUBLIC_DISABLE_UPLOADS !== undefined) {
            validateOptionalString(import.meta.env.PUBLIC_DISABLE_UPLOADS, 'PUBLIC_DISABLE_UPLOADS');
        }
    } catch (error) {
        if (error instanceof Error) {
            errors.push(error.message);
        }
    }

    try {
        // Validate CONTEXT as optional string (server-side only)
        if (typeof process !== 'undefined' && process.env.CONTEXT !== undefined) {
            validateOptionalString(process.env.CONTEXT, 'CONTEXT');
        }
    } catch (error) {
        if (error instanceof Error) {
            errors.push(error.message);
        }
    }

    // If there are validation errors, throw with all error messages
    if (errors.length > 0) {
        throw new Error(
            `Environment variable validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
        );
    }
}

/**
 * Type-safe environment variable accessors
 *
 * These functions provide typed access to environment variables with proper validation.
 */

/**
 * Get the PostHog API key for analytics (optional)
 * Only available in production builds when configured
 */
export function getPostHogKey(): string | undefined {
    return validateOptionalString(import.meta.env.PUBLIC_POSTHOG_KEY, 'PUBLIC_POSTHOG_KEY');
}

/**
 * Get the Netlify deploy context (production, deploy-preview, branch-deploy, dev)
 * Only available on the server side
 */
export function getNetlifyContext(): string | undefined {
    if (typeof process === 'undefined') {
        return undefined;
    }
    return validateOptionalString(process.env.CONTEXT, 'CONTEXT');
}

/**
 * Check if uploads are disabled via environment variable
 */
export function isUploadDisabled(): boolean {
    const value = validateOptionalString(
        import.meta.env.PUBLIC_DISABLE_UPLOADS,
        'PUBLIC_DISABLE_UPLOADS'
    );
    return value?.toLowerCase() === 'true';
}

/**
 * Typed environment variables for use throughout the application
 */
export const env = {
    /**
     * PostHog API key for analytics (optional)
     */
    PUBLIC_POSTHOG_KEY: getPostHogKey(),

    /**
     * Whether uploads should be disabled (defaults to false)
     */
    PUBLIC_DISABLE_UPLOADS: isUploadDisabled(),

    /**
     * Netlify deploy context (server-side only)
     */
    CONTEXT: getNetlifyContext(),
} as const;
