# 执行计划：macOS用户确认脚本系统

## 任务描述
在templates目录中添加scripts文件夹，创建hooks_stops.sh脚本调用macOS的say和notify功能，并集成到现有hooks配置中。

## 上下文
- 项目：ZCF CLI工具
- 目标：增强用户体验，在关键操作时提供macOS原生的语音和通知提醒
- 集成点：settings.json中的hooks配置
- 平台：macOS专用功能

## 详细计划

### 1. 创建目录结构
- 创建 `templates/scripts/` 目录
- 设置适当的目录权限

### 2. 创建hooks_stops.sh脚本
- 位置：`templates/scripts/hooks_stops.sh`
- 功能：macOS语音提醒 + 通知 + 用户确认
- 包含：错误处理、参数支持、日志记录

### 3. 创建通用调用脚本
- 位置：`templates/scripts/user_confirmation.sh`
- 功能：通用的用户确认提醒脚本
- 支持多种场景和自定义消息

### 4. 更新settings.json配置
- 修改stop hook调用新脚本
- 为preCompact hook添加可选的脚本调用
- 保持向后兼容性

### 5. 设置脚本权限
- 为脚本添加可执行权限
- 在README中添加使用说明

### 6. 创建集成文档
- 在CLAUDE.md中添加脚本使用说明
- 提供调用示例和最佳实践

## 原子操作详情

**文件创建：**
- `templates/scripts/hooks_stops.sh` - 主要的停止提醒脚本
- `templates/scripts/user_confirmation.sh` - 通用确认脚本
- 更新 `templates/settings.json` - 集成新脚本

**函数/类设计：**
- `hooks_stops.sh`：主函数 `main()`，支持自定义消息参数
- `user_confirmation.sh`：通用函数 `notify_user()` 支持多种场景

**逻辑概述：**
1. 脚本接收场景和消息参数
2. 调用macOS `say` 命令进行语音提醒
3. 调用macOS通知系统显示桌面通知
4. 等待用户确认（键盘输入或对话框）
5. 返回确认状态给调用者

## 预期结果
- 在Claude Code停止或压缩操作时，用户收到语音和桌面提醒
- 用户必须确认才能继续操作
- 脚本可复用，支持多种场景

## 执行状态
- [x] 创建目录结构
- [x] 创建hooks_stops.sh脚本
- [x] 创建通用调用脚本
- [x] 更新settings.json配置
- [x] 设置脚本权限
- [x] 创建集成文档

## 风险评估
- **兼容性**：仅支持macOS系统
- **权限**：需要确保脚本有执行权限
- **依赖**：依赖macOS的say和通知功能