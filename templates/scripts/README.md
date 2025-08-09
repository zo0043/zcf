# macOS 用户确认脚本系统

本系统为Claude Code提供了macOS原生的用户确认机制，包括语音播报、桌面通知和用户确认功能。

## 文件结构

```
templates/
├── scripts/
│   ├── hooks_stops.sh          # 专用的停止确认脚本
│   └── user_confirmation.sh     # 通用的用户确认脚本
└── settings.json                # 已更新的hooks配置
```

## 脚本功能

### hooks_stops.sh
专用于Claude Code停止操作的用户确认脚本。

**功能特性：**
- macOS原生语音播报
- 桌面通知提醒
- 用户确认机制
- 错误处理和日志记录

**使用场景：**
- stop: 停止操作
- compact: 压缩操作
- task_complete: 任务完成
- custom: 自定义场景

### user_confirmation.sh
通用的用户确认脚本，支持多种场景和自定义选项。

**功能特性：**
- 多种确认方式（命令行、对话框）
- 自定义语音选择
- 丰富的配置选项
- 完整的错误处理
- 日志记录功能

**支持选项：**
- `--subtitle`: 设置通知副标题
- `--voice`: 选择语音类型
- `--dialog`: 使用对话框确认
- `--timeout`: 设置超时时间
- `--log`: 启用日志记录
- `--voices`: 显示可用语音列表

## 配置集成

### settings.json配置
已在settings.json中集成了以下hooks：

1. **stop hook**: 在停止Claude Code会话时调用hooks_stops.sh
2. **preCompact hook**: 在压缩操作前调用user_confirmation.sh
3. **postToolUse hook**: 在Write工具使用后调用user_confirmation.sh

### 配置示例
```json
{
  "hooks": {
    "stop": {
      "command": "bash \"$(dirname \"$(dirname \"$(realpath \"$0\")\")\")/templates/scripts/hooks_stops.sh\" stop \"Claude Code 会话即将结束，请确认是否继续\"",
      "reason": "User confirmation required before stopping session"
    },
    "preCompact": {
      "command": "bash \"$(dirname \"$(dirname \"$(realpath \"$0\")\")\")/templates/scripts/user_confirmation.sh\" --dialog compact \"Claude Code 压缩操作\" \"即将进行压缩操作，请确认是否继续\"",
      "trigger": "manual"
    },
    "postToolUse": {
      "Write": "bash \"$(dirname \"$(dirname \"$(realpath \"$0\")\")\")/templates/scripts/user_confirmation.sh\" --subtitle \"文件修改\" custom \"文件修改提醒\" \"文件已修改，请确认更改是否正确\""
    }
  }
}
```

## 使用方法

### 直接调用脚本

1. **使用hooks_stops.sh**:
```bash
./templates/scripts/hooks_stops.sh stop
./templates/scripts/hooks_stops.sh compact "即将进行压缩操作"
```

2. **使用user_confirmation.sh**:
```bash
./templates/scripts/user_confirmation.sh stop "Claude Code" "会话即将结束"
./templates/scripts/user_confirmation.sh --dialog --voice "Samantha" task_complete "任务完成" "所有操作已完成"
```

3. **查看可用语音**:
```bash
./templates/scripts/user_confirmation.sh --voices
```

### 环境变量配置

```bash
# 启用日志记录
export LOG_ENABLED=true

# 设置自定义日志文件路径
export LOG_FILE=/path/to/custom.log
```

## 系统要求

- **操作系统**: macOS
- **必要命令**: say, osascript
- **权限**: 脚本需要可执行权限

## 注意事项

1. **仅支持macOS**: 这些脚本使用了macOS特有的命令
2. **权限要求**: 确保脚本有执行权限
3. **声音设置**: 确保系统声音已开启
4. **通知权限**: 确保Claude Code有发送通知的权限

## 故障排除

### 常见问题

1. **脚本无法执行**:
   ```bash
   chmod +x templates/scripts/*.sh
   ```

2. **语音播报失败**:
   - 检查系统声音设置
   - 尝试使用不同的语音

3. **通知无法显示**:
   - 检查系统通知设置
   - 确保应用程序有通知权限

4. **路径问题**:
   - 使用绝对路径调用脚本
   - 检查脚本位置是否正确

### 调试方法

1. **启用日志记录**:
   ```bash
   LOG_ENABLED=true ./templates/scripts/user_confirmation.sh stop "Test" "Test message"
   ```

2. **手动测试**:
   ```bash
   say "测试语音播报"
   osascript -e 'display notification "测试通知" with title "测试"'
   ```

## 扩展功能

系统设计为可扩展的，您可以：

1. **添加新的场景**: 在脚本中添加新的场景处理逻辑
2. **自定义通知**: 修改通知样式和内容
3. **集成其他工具**: 与其他macOS工具集成
4. **多语言支持**: 添加多语言支持功能

## 最佳实践

1. **测试**: 在实际使用前先测试脚本功能
2. **日志**: 启用日志记录以便排查问题
3. **权限**: 确保所有相关权限都已正确设置
4. **备份**: 在修改配置前备份原始文件