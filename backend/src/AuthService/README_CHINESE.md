# 认证服务 (AuthService) - 中国本地化版本

基于ASP.NET Core Identity、JWT和MySQL的完整身份验证与授权服务。专为中国用户设计，支持手机号码登录、短信验证码和图形验证码。

## 功能特性

- **ASP.NET Core Identity 集成**: 基于手机号的用户身份验证
- **双重登录方式**:
  - 密码登录 + 图形验证码 (CAPTCHA)
  - 手机号 + 短信验证码
- **JWT 令牌管理**: 安全的令牌颁发和生命周期管理
- **刷新令牌机制**: 令牌轮转与撤销支持
- **基于角色的访问控制 (RBAC)**: 灵活的角色和权限系统
- **多租户支持**: 组织级用户和角色隔离
- **账户安全机制**: 登录失败次数追踪，账户锁定
- **完整的日志审计**: 认证事件的完整追踪记录

## 系统架构

```
┌──────────────────────────────────────┐
│          客户端应用                   │
└────────────┬─────────────────────────┘
             │
       ┌─────▼──────┐
       │ 1. 创建验证码│
       │ 2. 验证CAPTCHA
       │ 3. 登录      │
       └─────┬──────┘
             │
┌────────────▼──────────────────────────┐
│        认证服务 (AuthService)          │
│                                       │
│ Controllers:                          │
│  - AuthenticationController           │
│    ├── login/password (密码登录)     │
│    ├── login/code (验证码登录)       │
│    ├── request-code (请求验证码)     │
│    ├── captcha (创建验证码)          │
│    └── verify-captcha (验证CAPTCHA)  │
│                                       │
│ Services:                             │
│  - AuthenticationService              │
│  - VerificationCodeService            │
│  - CaptchaService                     │
│  - RolePermissionService              │
└────────────┬──────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│         数据库 (MySQL)                 │
│  ├── users (用户表)                   │
│  ├── verification_codes (验证码)     │
│  ├── captcha_challenges (验证码)     │
│  ├── refresh_tokens (刷新令牌)        │
│  ├── roles (角色)                     │
│  └── permissions (权限)               │
└───────────────────────────────────────┘
```

## 配置说明

### appsettings.json

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=logistics_platform;User ID=root;Password=example;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-characters-long",
    "Issuer": "AuthService",
    "Audience": "LogisticsSafetyPlatform",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### 用户密码策略

- 最少 8 个字符
- 必须包含数字
- 必须包含特殊字符
- 必须包含大写字母

## API 端点

### 1. 获取验证码 (CAPTCHA)

**请求:**
```http
POST /api/v1/auth/captcha
Content-Type: application/json

Response 200:
{
  "success": true,
  "challengeKey": "abc123def456...",
  "challenge": "5 + 3 = ?",
  "expiresIn": 300
}
```

**说明**: 
- 返回一个简单的数学题验证码
- `challengeKey` 用于后续的登录请求
- 有效期 5 分钟

### 2. 验证 CAPTCHA

**请求:**
```http
POST /api/v1/auth/verify-captcha
Content-Type: application/json

{
  "challengeKey": "abc123def456...",
  "answer": "8"
}

Response 200:
{
  "success": true,
  "message": "CAPTCHA verified"
}
```

### 3. 请求短信验证码

**请求:**
```http
POST /api/v1/auth/request-code
Content-Type: application/json

{
  "phone": "13800138000"
}

Response 200:
{
  "success": true,
  "message": "验证码已发送到您的手机",
  "expiresIn": 300
}
```

**说明**: 
- 发送 6 位数字验证码到用户手机
- 有效期 5 分钟
- 最多允许 3 次错误尝试

### 4. 密码登录 (使用 CAPTCHA)

**请求:**
```http
POST /api/v1/auth/login/password
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "YourPassword123!",
  "captchaKey": "abc123def456..."
}

Response 200:
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64-encoded-refresh-token",
  "user": {
    "id": 1,
    "phone": "13800138000",
    "firstName": "张",
    "lastName": "三",
    "organizationId": 1,
    "roles": ["Platform Administrator"],
    "permissions": []
  }
}
```

### 5. 短信验证码登录

**请求:**
```http
POST /api/v1/auth/login/code
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}

Response 200:
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "base64-encoded-refresh-token",
  "user": {
    "id": 1,
    "phone": "13800138000",
    "firstName": "张",
    "lastName": "三",
    "organizationId": 1,
    "roles": ["Platform Administrator"],
    "permissions": []
  }
}
```

### 6. 刷新令牌

**请求:**
```http
POST /api/v1/auth/refresh
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "base64-encoded-refresh-token"
}

Response 200:
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "new-base64-encoded-refresh-token"
}
```

### 7. 登出

**请求:**
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "base64-encoded-refresh-token"
}

Response 200:
{
  "success": true
}
```

### 8. 获取当前用户信息

**请求:**
```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>

Response 200:
{
  "userId": 1,
  "phone": "13800138000",
  "organizationId": 1,
  "roles": ["Platform Administrator"],
  "permissions": [],
  "claims": [...]
}
```

## JWT 令牌结构

### 令牌中包含的声明 (Claims)

```json
{
  "sub": "1",                          // 用户 ID
  "phone": "13800138000",              // 手机号
  "organization_id": "1",              // 组织 ID
  "user_type": "ADMIN",                // 用户类型
  "phone_verified": "true",            // 手机是否已验证
  "role": "Platform Administrator",    // 角色
  "permission": "...",                 // 权限
  "iat": "1234567890",                 // 颁发时间
  "exp": "1234571490",                 // 过期时间
  "iss": "AuthService",                // 颁发者
  "aud": "LogisticsSafetyPlatform"     // 受众
}
```

## 默认管理员账户

**重要**: 生产环境中请立即更改密码!

- **手机号**: 13800138000
- **密码**: AdminP@ssw0rd123
- **角色**: 平台管理员

## 登录流程示例

### 密码登录流程

```
1. 用户请求获取 CAPTCHA
   POST /api/v1/auth/captcha
   ↓
2. 系统返回验证码题目和 challengeKey
   ↓
3. 用户解答并验证 CAPTCHA
   POST /api/v1/auth/verify-captcha
   ↓
4. 系统验证成功，用户可以登录
   ↓
5. 用户提交手机号、密码和 captchaKey
   POST /api/v1/auth/login/password
   ↓
6. 系统返回访问令牌和刷新令牌
```

### 短信验证码登录流程

```
1. 用户请求获取验证码
   POST /api/v1/auth/request-code
   ↓
2. 系统发送 6 位验证码到手机
   ↓
3. 用户输入验证码进行登录
   POST /api/v1/auth/login/code
   ↓
4. 系统返回访问令牌和刷新令牌
```

## 其他服务的令牌验证

### 配置 JWT 认证

```csharp
// 在 Program.cs 中
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = "AuthService",
            ValidateAudience = true,
            ValidAudience = "LogisticsSafetyPlatform",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

app.UseAuthentication();
app.UseAuthorization();
```

### 在控制器中使用

```csharp
[Authorize]
[ApiController]
[Route("api/v1/orders")]
public class OrderController : ControllerBase
{
    [Authorize(Roles = "MANAGER")]
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        // 从令牌中提取用户信息
        var userId = User.FindFirst("sub")?.Value;
        var phone = User.FindFirst("phone")?.Value;
        var organizationId = User.FindFirst("organization_id")?.Value;
        var roles = User.FindAll("role");

        // 业务逻辑...
        return Ok();
    }
}
```

## 数据库迁移

### 初始化数据库

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE logistics_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 执行基本架构
mysql -u root -p logistics_platform < db/schema/core_tables.sql

# 3. 执行认证相关迁移
mysql -u root -p logistics_platform < db/migrations/001_add_refresh_tokens_table.sql
mysql -u root -p logistics_platform < db/migrations/002_add_phone_auth_tables.sql

# 4. 加载种子数据
mysql -u root -p logistics_platform < db/seed/auth_seed_data.sql
```

### 运行测试

```bash
# 运行所有测试
dotnet test

# 运行特定测试类
dotnet test --filter "ClassName=AuthenticationServiceTests"

# 显示详细输出
dotnet test --verbosity normal
```

## 常见问题解答 (FAQ)

### Q: 如何更改默认管理员密码?

A: 使用以下步骤:
1. 使用默认账户登录
2. 调用密码重置接口 (待实现)
3. 或者直接在数据库中更新密码哈希

### Q: 验证码过期了怎么办?

A: 用户可以重新请求新的验证码。前一个验证码会被自动失效。

### Q: CAPTCHA 支持图片吗?

A: 当前版本使用简单的数学题。可以扩展为支持生成图片验证码。

### Q: 如何集成真实的 SMS 服务?

A: 修改 `VerificationCodeService.GenerateAndSendCodeAsync()` 方法，调用真实的 SMS API:

```csharp
// 示例：使用阿里云短信服务
private async Task SendSmsAsync(string phone, string code)
{
    var client = new DefaultAcsClient(config);
    var request = new SendSmsRequest
    {
        PhoneNumbers = phone,
        SignName = "应用名称",
        TemplateCode = "SMS_TEMPLATE_CODE",
        TemplateParam = JsonConvert.SerializeObject(new { code = code })
    };
    await client.GetAcsResponse(request);
}
```

## 安全最佳实践

1. **生产环境配置**:
   - 使用强随机密钥 (32 字符以上)
   - 启用 HTTPS/SSL
   - 配置合理的 CORS 策略

2. **密码策略**:
   - 最少 8 个字符
   - 包含大小写、数字、特殊字符
   - 定期强制更改

3. **令牌安全**:
   - 访问令牌有效期短 (默认 60 分钟)
   - 刷新令牌有效期长 (默认 7 天)
   - 登出时撤销刷新令牌

4. **验证码安全**:
   - 验证码 5 分钟过期
   - 错误尝试 3 次后失效
   - 防止暴力破解

5. **账户保护**:
   - 登录失败 5 次后锁定账户
   - 锁定时间 30 分钟
   - 记录所有登录尝试

## 故障排除

### 错误: "JWT secret key must be configured"

**解决方案**: 设置 JWT 密钥
```bash
cd backend/src/AuthService
dotnet user-secrets set "Jwt:SecretKey" "your-secret-key-min-32-chars"
```

### 错误: "Unable to connect to MySQL"

**检查项**:
1. MySQL 服务是否运行
2. 连接字符串是否正确
3. 数据库是否存在

### 验证码无法发送

**检查项**:
1. SMS 服务是否已配置
2. 手机号格式是否正确
3. 查看日志中的错误信息

## 后续改进

- [ ] 集成真实的 SMS 服务提供商
- [ ] 支持更高级的图形验证码
- [ ] 实现密码重置流程
- [ ] 添加二次验证 (MFA)
- [ ] 支持社交登录 (微信、支付宝)
- [ ] 活跃度监控和异地登录警告

## 支持和文档

- 主服务文档: `backend/src/AuthService/README.md`
- 集成指南: `docs/backend/AUTH_INTEGRATION_GUIDE.md`
- 迁移指南: `db/MIGRATION_GUIDE.md`
- 部署指南: `SETUP_GUIDE.md`

## 许可证

[您的许可证]
