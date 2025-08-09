# 执行计划：集成 hooks 配置到 init 命令

## 任务描述
将 macOS 用户确认脚本配置集成到现有的 `init` 命令流程中，在 API 配置完成后添加 hooks 配置步骤。

## 上下文
- 项目：ZCF CLI工具
- 目标：在 `npx zcf init` 过程中添加 hooks 配置选项
- 集成点：init 命令的 API 配置完成后
- 平台：macOS 专用功能，其他平台自动跳过

## 详细计划

### 1. 创建 hooks 配置工具函数
**文件**: `src/utils/hooks.ts`
**功能**: 
- 检测 macOS 平台兼容性
- 复制 scripts 目录到当前项目
- 更新 settings.json 中的 hooks 配置
- 错误处理和用户反馈

### 2. 修改 init 命令流程
**文件**: `src/commands/init.ts`
**修改点**:
- 在 API 配置完成后添加 hooks 配置步骤
- 添加用户交互逻辑询问是否配置 hooks
- 调用 hooks 配置工具函数

### 3. 更新类型定义
**文件**: `src/types.ts` 或 `src/types/config.ts`
**修改点**:
- 添加 hooks 相关的类型定义
- 扩展现有的配置类型

### 4. 更新常量定义
**文件**: `src/constants.ts`
**修改点**:
- 添加 hooks 相关的常量和消息
- 更新国际化文本

### 5. 更新错误处理
**文件**: `src/utils/error-handler.ts`
**修改点**:
- 添加 hooks 配置相关的错误处理逻辑

## 原子操作详情

**文件创建**:
- `src/utils/hooks.ts` - hooks 配置核心逻辑

**文件修改**:
- `src/commands/init.ts` - 集成 hooks 配置步骤
- `src/types.ts` - 添加类型定义
- `src/constants.ts` - 添加常量
- `src/utils/error-handler.ts` - 添加错误处理

**函数设计**:
- `configureHooks()` - 主要的 hooks 配置函数
- `isMacOSPlatform()` - 平台检测函数
- `copyHooksScripts()` - 脚本复制函数
- `updateHooksConfig()` - 配置更新函数

**逻辑概述**:
1. 在 init 命令完成 API 配置后
2. 检测当前平台是否为 macOS
3. 询问用户是否要配置 hooks
4. 如果确认，复制 scripts 目录并更新配置
5. 提供配置结果反馈

## 预期结果
- 用户可以在 `npx zcf init` 过程中完成 hooks 配置
- 配置后的 hooks 可以被 Claude Code 正确加载和使用
- 保持向后兼容性，不影响现有功能

## 执行状态
- [ ] 创建 hooks 配置工具函数
- [ ] 修改 init 命令流程
- [ ] 更新类型定义
- [ ] 更新常量定义
- [ ] 更新错误处理
- [ ] 测试和验证

## 风险评估
- **兼容性**: 仅支持 macOS，其他平台跳过配置
- **错误处理**: 需要完善的错误处理机制
- **用户体验**: 需要清晰的用户提示和反馈