#!/bin/bash

# macOS Hooks Stop Script
# 用于Claude Code停止操作时的用户确认提醒

set -e

# 脚本配置
SCRIPT_NAME="hooks_stops.sh"
SCRIPT_VERSION="1.0.0"
LOG_ENABLED=${LOG_ENABLED:-false}
LOG_FILE="${LOG_FILE:-$HOME/.claude/hooks_stops.log}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    if [[ "$LOG_ENABLED" == "true" ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    fi
}

# 错误处理
error_exit() {
    echo -e "${RED}错误: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# 检查macOS系统
check_macos() {
    if [[ "$(uname)" != "Darwin" ]]; then
        error_exit "此脚本仅支持macOS系统"
    fi
}

# 检查必要命令
check_commands() {
    local commands=("say" "osascript")
    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "缺少必要命令: $cmd"
        fi
    done
}

# 显示通知
show_notification() {
    local title="$1"
    local message="$2"
    local sound="${3:-default}"
    
    # 使用osascript显示macOS通知
    osascript -e "display notification \"$message\" with title \"$title\" sound name \"$sound\"" 2>/dev/null || {
        echo "显示通知失败，继续执行..."
        log "Failed to show notification: $title - $message"
    }
}

# 语音播报
speak_message() {
    local message="$1"
    local voice="${2:-}"
    
    if [[ -n "$voice" ]]; then
        say -v "$voice" "$message" 2>/dev/null || {
            say "$message" 2>/dev/null || {
                echo "语音播报失败: $message"
                log "Failed to speak message: $message"
            }
        }
    else
        say "$message" 2>/dev/null || {
            echo "语音播报失败: $message"
            log "Failed to speak message: $message"
        }
    fi
}

# 等待用户确认
wait_for_confirmation() {
    local prompt="$1"
    local timeout="${2:-0}" # 0表示无限等待
    
    echo -e "${BLUE}$prompt${NC}"
    echo -e "${YELLOW}请按 Enter 键继续，或按 Ctrl+C 取消操作...${NC}"
    
    if [[ "$timeout" -gt 0 ]]; then
        read -t "$timeout" -r response || {
            echo -e "${RED}等待超时，操作已取消${NC}"
            log "Confirmation timeout"
            exit 1
        }
    else
        read -r response
    fi
    
    log "User confirmed continuation"
}

# 主函数
main() {
    local scenario="${1:-stop}"
    local custom_message="${2:-}"
    
    log "Script started with scenario: $scenario"
    
    # 系统检查
    check_macos
    check_commands
    
    # 根据场景设置消息
    local title="Claude Code"
    local message=""
    
    case "$scenario" in
        "stop")
            message="Claude Code 会话即将结束，任务已完成"
            custom_message="${custom_message:-请确认是否结束会话}"
            ;;
        "compact")
            message="Claude Code 即将进行压缩操作"
            custom_message="${custom_message:-请确认是否继续压缩}"
            ;;
        "task_complete")
            message="任务已完成"
            custom_message="${custom_message:-请确认任务完成状态}"
            ;;
        *)
            message="Claude Code 操作提醒"
            custom_message="${custom_message:-请确认当前操作}"
            ;;
    esac
    
    echo -e "${GREEN}=== Claude Code 操作提醒 ===${NC}"
    echo -e "${BLUE}场景: $scenario${NC}"
    echo -e "${BLUE}消息: $message${NC}"
    
    # 语音播报
    speak_message "$message"
    
    # 显示通知
    show_notification "$title" "$message"
    
    # 等待用户确认
    wait_for_confirmation "$custom_message"
    
    echo -e "${GREEN}用户已确认，操作继续执行${NC}"
    log "Script completed successfully"
}

# 参数处理
if [[ $# -eq 0 ]]; then
    echo "用法: $SCRIPT_NAME [场景] [自定义消息]"
    echo ""
    echo "场景选项:"
    echo "  stop         - 停止操作 (默认)"
    echo "  compact      - 压缩操作"
    echo "  task_complete - 任务完成"
    echo "  custom       - 自定义场景"
    echo ""
    echo "示例:"
    echo "  $SCRIPT_NAME stop"
    echo "  $SCRIPT_NAME compact '即将进行压缩操作'"
    echo ""
    echo "环境变量:"
    echo "  LOG_ENABLED=true  - 启用日志记录"
    echo "  LOG_FILE=path     - 自定义日志文件路径"
    exit 0
fi

# 执行主函数
main "$@"