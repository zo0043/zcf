#!/bin/bash

# 简化版用户确认脚本
SCRIPT_NAME="user_confirmation.sh"

show_help() {
    echo "用法: $SCRIPT_NAME [场景] [标题] [消息]"
    echo ""
    echo "场景选项:"
    echo "  stop       - 停止操作"
    echo "  compact    - 压缩操作"
    echo "  custom     - 自定义场景"
    echo ""
    echo "示例:"
    echo "  $SCRIPT_NAME stop 'Claude Code' '会话即将结束'"
}

notify_user() {
    local scenario="$1"
    local title="$2"
    local message="$3"
    
    echo "=== $title ==="
    echo "场景: $scenario"
    echo "消息: $message"
    
    # 语音播报
    say "$message" 2>/dev/null || echo "语音播报失败"
    
    # 显示通知
    osascript -e "display notification \"$message\" with title \"$title\"" 2>/dev/null || echo "通知显示失败"
    
    # 等待用户确认
    echo "请按 Enter 键继续..."
    read -r
}

main() {
    if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
        show_help
        exit 0
    fi
    
    # 处理--voices参数
    if [[ "$1" == "--voices" ]]; then
        echo "可用的语音列表："
        say -v ? | head -20
        exit 0
    fi
    
    local scenario="${1:-custom}"
    local title="${2:-Claude Code}"
    local message="${3:-操作提醒}"
    
    if [[ "$(uname)" != "Darwin" ]]; then
        echo "错误: 此脚本仅支持macOS系统"
        exit 1
    fi
    
    notify_user "$scenario" "$title" "$message"
    echo "用户已确认，操作继续执行"
}

main "$@"