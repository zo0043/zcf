import inquirer from 'inquirer';
import ansis from 'ansis';
import { join, dirname } from 'pathe';
import { fileURLToPath } from 'node:url';
import type { SupportedLang } from '../constants';
import { I18N } from '../constants';
import { exists, ensureDir, copyDir } from './fs-operations';
import { readJsonConfig, writeJsonConfig } from './json-config';
import { deepMerge } from './object-utils';
import { isMacOS } from './platform';
import type { ClaudeSettings } from '../types/config';

/**
 * Error types for hooks configuration
 */
export enum HooksErrorType {
  PLATFORM_NOT_SUPPORTED = 'PLATFORM_NOT_SUPPORTED',
  SCRIPT_COPY_FAILED = 'SCRIPT_COPY_FAILED',
  CONFIG_UPDATE_FAILED = 'CONFIG_UPDATE_FAILED',
  PERMISSION_FAILED = 'PERMISSION_FAILED',
  INVALID_PATH = 'INVALID_PATH'
}

/**
 * Custom error class for hooks operations
 */
export class HooksError extends Error {
  public readonly type: HooksErrorType;
  public readonly cause?: Error;

  constructor(type: HooksErrorType, message: string, cause?: Error) {
    super(message);
    this.name = 'HooksError';
    this.type = type;
    this.cause = cause;
  }
}

/**
 * Handle hooks errors with proper formatting
 */
export function handleHooksError(error: unknown, lang: SupportedLang): void {
  const i18n = I18N[lang];
  
  if (error instanceof HooksError) {
    switch (error.type) {
      case HooksErrorType.PLATFORM_NOT_SUPPORTED:
        console.error(ansis.red(i18n.hooksNotSupported || 'Hooks configuration is only supported on macOS'));
        break;
      case HooksErrorType.SCRIPT_COPY_FAILED:
        console.error(ansis.red(i18n.hooksCopyFailed || 'Failed to copy hooks scripts'));
        break;
      case HooksErrorType.CONFIG_UPDATE_FAILED:
        console.error(ansis.red(i18n.hooksConfigFailed || 'Failed to update hooks configuration'));
        break;
      case HooksErrorType.PERMISSION_FAILED:
        console.error(ansis.red(i18n.hooksPermissionFailed || 'Failed to set executable permissions for hooks scripts'));
        break;
      case HooksErrorType.INVALID_PATH:
        console.error(ansis.red(i18n.hooksInvalidPath || 'Invalid path specified for hooks configuration'));
        break;
      default:
        console.error(ansis.red(i18n.error || 'An error occurred during hooks configuration'));
    }
    
    if (error.cause) {
      console.error(ansis.gray(`Cause: ${error.cause.message}`));
    }
  } else {
    console.error(ansis.red(i18n.error || 'An unknown error occurred'));
    if (error instanceof Error) {
      console.error(ansis.gray(`Details: ${error.message}`));
    }
  }
}

export interface HooksConfigOptions {
  lang: SupportedLang;
  force?: boolean;
  scriptsPath?: string;
  settingsPath?: string;
}

export interface HooksConfig {
  hooks?: {
    stop?: {
      command: string;
      reason: string;
    };
    preCompact?: {
      command: string;
      trigger: 'manual' | 'auto';
    };
    postToolUse?: {
      Write?: string;
    };
  };
}


/**
 * Copy hooks scripts from templates to current project
 */
export async function copyHooksScripts(targetDir: string = process.cwd()): Promise<boolean> {
  try {
    // Validate target directory
    if (!targetDir || typeof targetDir !== 'string') {
      throw new HooksError(HooksErrorType.INVALID_PATH, 'Invalid target directory specified');
    }

    // Get template directory path
    const currentFilePath = fileURLToPath(import.meta.url);
    const distDir = dirname(dirname(currentFilePath));
    const rootDir = dirname(distDir);
    const sourceScriptsDir = join(rootDir, 'templates', 'scripts');
    const targetScriptsDir = join(targetDir, 'templates', 'scripts');

    // Check if source scripts directory exists
    if (!exists(sourceScriptsDir)) {
      throw new HooksError(HooksErrorType.SCRIPT_COPY_FAILED, 'Hooks scripts not found in templates directory');
    }

    // Create target directory structure
    ensureDir(targetScriptsDir);

    // Copy all scripts files
    const filter = (path: string, stats: any) => {
      return stats.isDirectory() || path.endsWith('.sh') || path.endsWith('.md');
    };

    await copyDir(sourceScriptsDir, targetScriptsDir, { filter });

    // Set executable permissions for shell scripts
    const shellScripts = ['hooks_stops.sh', 'user_confirmation.sh'];
    for (const script of shellScripts) {
      const scriptPath = join(targetScriptsDir, script);
      if (exists(scriptPath)) {
        // Make script executable
        const { chmodSync } = await import('node:fs');
        try {
          chmodSync(scriptPath, '755');
        } catch (error) {
          throw new HooksError(HooksErrorType.PERMISSION_FAILED, `Failed to set executable permission for ${script}`, error as Error);
        }
      }
    }

    return true;
  } catch (error) {
    if (error instanceof HooksError) {
      throw error;
    }
    throw new HooksError(HooksErrorType.SCRIPT_COPY_FAILED, 'Failed to copy hooks scripts', error as Error);
  }
}

/**
 * Update settings.json with hooks configuration
 */
export async function updateHooksConfig(settingsPath: string, hooksConfig: HooksConfig): Promise<boolean> {
  try {
    // Validate settings path
    if (!settingsPath || typeof settingsPath !== 'string') {
      throw new HooksError(HooksErrorType.INVALID_PATH, 'Invalid settings path specified');
    }

    let existingSettings: ClaudeSettings = {};
    
    // Read existing settings if file exists
    if (exists(settingsPath)) {
      existingSettings = await readJsonConfig<ClaudeSettings>(settingsPath) || {};
    }

    // Merge hooks configuration
    const updatedSettings = deepMerge(existingSettings, hooksConfig);

    // Write updated settings
    await writeJsonConfig(settingsPath, updatedSettings);

    return true;
  } catch (error) {
    if (error instanceof HooksError) {
      throw error;
    }
    throw new HooksError(HooksErrorType.CONFIG_UPDATE_FAILED, 'Failed to update hooks configuration', error as Error);
  }
}

/**
 * Generate hooks configuration based on current project directory
 */
export function generateHooksConfig(_projectDir: string = process.cwd(), scriptsPath?: string): HooksConfig {
  const relativePath = scriptsPath || './templates/scripts';
  
  return {
    hooks: {
      stop: {
        command: `bash "${relativePath}/hooks_stops.sh" stop "Claude Code 会话即将结束，请确认是否继续"`,
        reason: 'User confirmation required before stopping session'
      },
      preCompact: {
        command: `bash "${relativePath}/user_confirmation.sh" --dialog compact "Claude Code 压缩操作" "即将进行压缩操作，请确认是否继续"`,
        trigger: 'manual'
      },
      postToolUse: {
        Write: `bash "${relativePath}/user_confirmation.sh" --subtitle "文件修改" custom "文件修改提醒" "文件已修改，请确认更改是否正确"`
      }
    }
  };
}

/**
 * Main function to configure hooks
 */
export async function configureHooks(options: HooksConfigOptions): Promise<boolean> {
  const { lang, force = false, scriptsPath, settingsPath: customSettingsPath } = options;

  try {
    // Check if platform is macOS
    if (!isMacOS()) {
      console.log(ansis.yellow(I18N[lang].hooksNotSupported || 'Hooks configuration is only supported on macOS'));
      return false;
    }

    // Use custom paths or defaults
    const settingsPath = customSettingsPath || join(process.cwd(), '.claude', 'settings.json');
    const targetScriptsDir = scriptsPath || join(process.cwd(), 'templates', 'scripts');
    
    // Check if hooks are already configured
    if (exists(settingsPath) && exists(targetScriptsDir) && !force) {
      const { shouldConfigure } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldConfigure',
          message: I18N[lang].hooksAlreadyConfigured || 'Hooks scripts are already configured. Do you want to reconfigure?',
          default: false
        }
      ]);

      if (!shouldConfigure) {
        console.log(ansis.blue(I18N[lang].hooksConfigurationSkipped || 'Hooks configuration skipped'));
        return false;
      }
    }

    // Ask user if they want to configure hooks
    const { configureHooks } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureHooks',
        message: I18N[lang].configureHooksPrompt || 'Do you want to configure macOS user confirmation hooks?',
        default: true
      }
    ]);

    if (!configureHooks) {
      console.log(ansis.blue(I18N[lang].hooksConfigurationSkipped || 'Hooks configuration skipped'));
      return false;
    }

    console.log(ansis.cyan(I18N[lang].configuringHooks || 'Configuring hooks...'));

    // Copy hooks scripts to target directory
    await copyHooksScripts(scriptsPath ? dirname(scriptsPath) : undefined);

    // Generate and update hooks configuration
    const hooksConfig = generateHooksConfig(undefined, scriptsPath);
    await updateHooksConfig(settingsPath, hooksConfig);

    console.log(ansis.green(I18N[lang].hooksConfigurationSuccess || 'Hooks configuration completed successfully'));
    console.log(ansis.cyan(I18N[lang].hooksUsageInfo || 'Hooks will be activated when Claude Code loads the configuration'));
    
    return true;
  } catch (error) {
    handleHooksError(error, lang);
    return false;
  }
}

/**
 * Check if hooks are properly configured
 */
export function checkHooksConfiguration(projectDir: string = process.cwd()): boolean {
  const scriptsDir = join(projectDir, 'templates', 'scripts');
  const settingsPath = join(projectDir, '.claude', 'settings.json');
  
  return exists(scriptsDir) && exists(settingsPath);
}