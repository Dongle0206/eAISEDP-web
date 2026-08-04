# 代码评审报告 — 前端代码首次审查（eaiselp-web-separate）
> 结论：**不通过**
> 审查日期：2026-08-04
> 审查范围：前端 12 个文件 + 后端 5 个 Controller / 6 个 entity / 3 个 DTO 交叉核对
> 审查方式：磁盘事实核对（直接 Read 前后端源码逐字段比对，未采信任何变更说明）

## 磁盘事实核对结论（强制第一步）

本次为前端首次审查，无 Dev 变更报告可对比。评审依据全部来自以下磁盘实际内容：
- 前端：`config.js` / `assets/js/{api,auth,menu,i18n}.js` / `login.html` / `index.html` / `pages/{case-list,case-detail,user-list,dashboard,search,audit-log}.html`
- 后端：`RuntimeController` / `CaseController` / `AuthController` / `DashboardController` / `SearchController` / `UserController` + `Case/Derivation/User/Artifact` entity + `LoginResponse/UserInfo` DTO + `CaseStatus` 枚举 + `BaseEntity` + `DerivationTaskState`

所有结论均由审查者亲自跑 Read + findstr 复核，未引用任何外部说明文字。

---

## 缺陷清单

| 编号 | 严重度 | 文件:行 | 问题 | 修复建议 |
|------|--------|---------|------|----------|
| D1 | 🔴阻断 | `pages/case-detail.html:255` vs `RuntimeController.java:44` | **前后端 API 路径不匹配（致命）**：前端派生请求调 `POST /api/v1/runtime/derive`，但后端 `RuntimeController` 类注解是 `@RequestMapping("/api/runtime")`（无 `/v1/` 前缀，后端代码注释 SE §10 D-1 明确说明"沿用现状无 /v1"）。实际请求路径应为 `/api/runtime/derive`。前端会得到 404，整个"发起派生"功能不可用。同样影响轮询：前端 `GET /api/v1/runtime/derive/{taskId}`（第 295 行）也应为 `/api/runtime/derive/{taskId}`。 | 二选一：(A) 前端改为 `/api/runtime/derive` 与 `/api/runtime/derive/{taskId}`（与后端现状对齐，推荐，改动小）；(B) 后端统一加 `/v1` 前缀（涉及全局路由，需另立项）。注意 Nginx 路由规则（config.js 注释 `/api/* → runtime`）能透传，但路径段 `/v1/` 缺失是后端 Controller 级别的硬不匹配，Nginx 无法补。 |
| D2 | 🔴阻断 | `pages/case-list.html:36-38,87-88,123-125` vs `CaseStatus.java:30-35` | **Case 状态枚举完全不匹配（致命）**：前端 `STATUS_TEXT` / `STATUS_CLASS` / 状态过滤下拉用的是 `in_progress` / `completed` / `pending`；后端 `CaseStatus` 枚举与 `t_case.status` 列存的是 `drafting` / `deriving` / `reviewing` / `testing` / `deploying` / `done`。后果：(1) 列表里所有 Case 的状态都落到 `status-unknown`（灰色"未知"）；(2) 状态过滤下拉的 3 个 option 永远查不到数据（后端按 status 精确匹配，无 in_progress/completed/pending 这些值）。dashboard 的 `STATUS_COLORS`/`STATUS_TEXT`（第 119-130 行）有同样问题，渲染出的状态条标签全是枚举原值或"未知"。 | 前端状态枚举改为后端 6 值：`drafting(草稿中)` / `deriving(派生中)` / `reviewing(审查中)` / `testing(测试中)` / `deploying(部署中)` / `done(已完成)`，并补齐 `STATUS_CLASS` 样式映射；状态过滤下拉同步改为这 6 个值。dashboard.html 同步修改。 |
| D3 | 🔴阻断 | `pages/user-list.html:199` vs `User.java:22` + `UserServiceImpl.java:54-62` | **User.roles 类型不匹配（运行时报错）**：前端 `(u.roles \|\| []).map(function(r){...})` 把 `roles` 当数组 `.map`；但后端 `User` entity 的 `roles` 字段是 `String`（逗号分隔，如 `"tenant_admin,project_manager"`），且 `UserController.page` 直接 `R.ok(userService.page(...))` 返回 `IPage<User>`——未经任何转换，序列化后 `roles` 仍是字符串。对字符串调用 `.map` 会抛 `u.roles.map is not a function`，**整个用户列表渲染失败（白屏/JS 中断）**。对比：`/api/v1/auth/current` 返回的 `UserInfo.roles` 是 `List<String>`（AuthServiceImpl.buildUserInfo 转换过），但用户管理列表接口不走那条路径。 | 二选一：(A) 前端做容错 `var roleArr = typeof u.roles === 'string' ? u.roles.split(',').filter(Boolean) : (u.roles \|\| [])`；(B) 后端 `UserController` 返回专门的 VO（roles 转 List<String>），与 UserInfo 口径统一。推荐 B（前端不该承担后端类型不一致的兜底责任），但 A 改动更小可先行。 |
| D4 | 🔴阻断 | `pages/case-detail.html:201` vs `Case.java:22` + `CaseController.java:74` | **Case 详情 description 字段取不到**：前端 `$('#caseDesc').text(c.description \|\| c.desc \|\| '-')`；但后端 `Case` entity 无 `description` / `desc` 字段，新建 Case 时 `CaseController.create` 把请求体的 `description` 落到了 `requirement` 字段（`c.setRequirement(req.getDescription())`）。后果：详情页描述永远显示"-"，用户在新建 Case 填的描述在详情页丢失（数据其实存了，只是前端取错字段）。 | 前端改为 `c.requirement \|\| c.description \|\| '-'`（与后端 entity 字段对齐）。 |
| D5 | 🟡建议 | `pages/case-list.html:127` / `case-detail.html:198` vs `Case.java` | **caseCode 字段不存在**：前端取 `c.caseCode \|\| c.code \|\| c.id`，但 `Case` entity 只有 `caseId`（无 `caseCode`/`code`）。列表"编号"列与详情"编号"都会回退显示 `id`（雪花长整型），而非人类可读的 caseId。`CaseController.create` 生成的是 `PlatformConst.CASE_ID_PREFIX + UUID`（如 `CASE-xxx`），存在 `caseId` 字段里。 | 前端改为优先取 `c.caseId`：`c.caseId \|\| c.caseCode \|\| c.id`。 |
| D6 | 🟡建议 | `pages/dashboard.html:232-234` vs `DashboardController.java:118-119` | **派生统计 token 字段不匹配**：前端 `renderDerivation` 取 `it.inputToken \|\| it.inputTokens \|\| it.input_token` 和 `outputToken...`；但后端 `derivationStats` 返回的是 `derivationService.countAndTokensByRole()`，每行 Map 的 key 是 `role` / `count` / `totalTokens`（见 overview 第 80 行 `row.get("totalTokens")` 同源）。后端**只合计了 totalTokens，没有按 input/output 拆分**。后果：表格 Input Token / Output Token 两列永远显示 0（`Number(undefined)\|\|0`），只有"派生次数"列正确。 | 二选一：(A) 后端 `countAndTokensByRole` 增加返回 `inputTokens` / `outputTokens` 分项（Derivation entity 本就有 inputTokens/outputTokens 两字段，聚合时拆开即可）；(B) 前端表格合并为单列"Token 消耗"读 `it.totalTokens`。推荐 A（信息更完整）。 |
| D7 | 🟡建议 | `pages/case-detail.html:225-229` vs `Derivation.java:18-21` | **时间线 token 字段过度兜底但缺主字段**：前端取 `d.tokens ?? d.tokenUsage`，但 `Derivation` entity 是 `inputTokens` + `outputTokens` 两个独立字段（无 `tokens` 合计）。时间线里 token 徽章永远不显示。另外 `d.output \|\| d.summary \|\| d.result`：Derivation 无 `output`/`summary`/`result` 字段，派生产物实际存在 `producedArtifacts`（JSON 串）。时间线摘要列也会空。 | 前端 token 改为 `(d.inputTokens\|\|0) + (d.outputTokens\|\|0)` 或分两个徽章；摘要字段对齐后端实际字段（需确认 Derivation 是否有承载 LLM 输出文本的字段，若无则后端需补，或前端改为展示 producedArtifacts 摘要）。 |
| D8 | 🟡建议 | `pages/case-list.html:102` / `user-list.html:175` / `search.html:94` | **分页字段过度兜底掩盖契约**：前端 `data.list \|\| data.items \|\| data.records`。后端三个分页接口（Case/User/Search）返回的都是 MyBatis-Plus `IPage`，序列化字段固定是 `records` / `total` / `current` / `size` / `pages`。多分支兜底虽能 work，但会掩盖前后端契约不一致（如后端某天返回 `list` 反而让前端误以为正常）。审查重点列表要求核对 `resp.data.records`，实际前端是兜底链的第三选择，非显式契约。 | 前端直接用 `data.records` + `data.total`（IPage 标准字段），删除 `list`/`items` 兜底分支，让契约显式化；若后端确有非 IPage 接口再单独处理。 |
| D9 | 🟡建议 | `pages/case-detail.html:301` vs `DerivationTaskState.java:25-27` | **轮询状态判断的兜底分支多余**：前端 `var status = resp.data.status \|\| (resp.data.state ? resp.data.state.status : '')`；后端 `DerivationTaskState` 直接就是顶层 `status` 字段（pending/running/success/failed/not_found），无 `state` 嵌套。兜底分支无害但属臆测契约，建议清理。另：后端有 `not_found` 状态，前端轮询未处理（会一直当作 pending 继续轮询到 3 分钟超时），体验差。 | 删除 `state.status` 兜底；增加 `status === 'not_found'` 分支，提示"任务不存在"并停止轮询。 |
| D10 | 🟡建议 | `pages/case-detail.html:200` vs `Case.java` + `BaseEntity.java:25` | **创建人字段取不到**：前端 `c.creator \|\| c.createdBy`；后端 `Case` 无 `creator` 字段，`BaseEntity` 的字段是 `createBy`（注意无 `d`，第 25 行）。前端 `createdBy` 与后端 `createBy` 差一个字母，匹配失败，"创建人"永远显示"-"。 | 前端改为 `c.createBy \|\| c.creator`。 |
| D11 | 🟢可选 | `pages/case-list.html:131` 等 | `escapeHtml(c.id)` 用于 `data-id` 属性，但 `c.id` 是雪花 Long，无需转义（无害）。整体 escapeHtml 覆盖较完整，XSS 防护到位。 | 无需修改，记录为良好实践。 |
| D12 | 🟢可选 | `assets/js/i18n.js` + 各 html | i18n.js 定义了 key-value 表，但各页面大量文案（如"Case 管理"、"加载中..."）直接硬编码中文，未走 `I18N.t(key)`。属 Q-2 裁决议定（Phase 1 只中文），但 i18n 表与实际调用脱节，未来加英文时改造量大。 | 如确认 M3 才做英文，本次可不动；建议至少在新增页面时开始用 t()，避免技术债扩大。 |
| D13 | 🟢可选 | `config.js:19` | 直连模式注释里硬编码内网 IP `172.16.180.166`（非生产地址，注释态，未启用）。 | 注释保留无大碍，但建议改为环境变量占位说明，避免误启用。 |
| D14 | 🟡建议 | `pages/user-list.html:349` vs `UserController.java:112`（DELETE） | **禁用用户走错 HTTP 方法/路径**：前端 `toggleStatus` 用 `PUT /api/v1/users/{id}` body `{status:'disabled'}` 来禁用；后端确实有 `PUT /{id}` 接受 status（UserController.update 第 100 行），能通。但后端同时有专门的 `DELETE /api/v1/users/{id}`（disable，第 112-120 行）语义更明确且单独审计 `user_disable`。前端走 PUT 路径审计日志记的是 `user_update` 而非 `user_disable`，**审计口径与 GRC 治理预期不符**。 | 推荐：禁用操作改调 `DELETE /api/v1/users/{id}`（与后端 disable 端点 + 审计码对齐）；或后端统一禁用入口，删除二义性。 |

---

## 重点维度结论

### 1. 前后端 API 路径对齐（最重要）
| 前端调用 | 后端实际 | 是否匹配 |
|----------|----------|----------|
| `POST /api/v1/auth/login` | `/api/v1/auth/login` | ✅ |
| `GET /api/v1/auth/current` | `/api/v1/auth/current` | ✅ |
| `POST /api/v1/auth/logout` | `/api/v1/auth/logout` | ✅ |
| `GET /api/v1/cases` | `/api/v1/cases` | ✅ |
| `GET /api/v1/cases/{caseId}` | `/api/v1/cases/{caseId}` | ✅ |
| `POST /api/v1/cases` | `/api/v1/cases` | ✅ |
| `GET /api/v1/cases/{caseId}/derivations` | `/api/v1/cases/{caseId}/derivations` | ✅ |
| `GET /api/v1/users` | `/api/v1/users` | ✅ |
| `POST/PUT /api/v1/users[/{id}]` | `/api/v1/users[/{id}]` | ✅ |
| `GET /api/v1/dashboard/{overview,case-stats,derivation-stats}` | 同 | ✅ |
| `GET /api/v1/search` | `/api/v1/search` | ✅ |
| **`POST /api/v1/runtime/derive`** | **`/api/runtime/derive`** | ❌ **D1 阻断** |
| **`GET /api/v1/runtime/derive/{taskId}`** | **`/api/runtime/derive/{taskId}`** | ❌ **D1 阻断** |

### 2. 字段名对齐（最重要）
| 接口 | 前端取值 | 后端实际字段 | 是否匹配 |
|------|----------|--------------|----------|
| login | `resp.data.token` / `resp.data.user` | `LoginResponse.token` / `.user` | ✅ |
| current | `user.roleCodes` / `user.displayName` | `UserInfo.roleCodes` / `.displayName` | ✅ |
| case-list 分页 | `data.records`(兜底第3) / `data.total` | `IPage.records` / `.total` | ⚠️ D8（兜底掩盖契约，能 work） |
| case-list 状态 | `in_progress/completed/pending` | `drafting/deriving/.../done` | ❌ **D2 阻断** |
| case-list 编号 | `c.caseCode\|\|c.code\|\|c.id` | `Case.caseId` | ⚠️ D5（取不到 caseId，显示 id） |
| case-detail 描述 | `c.description\|\|c.desc` | `Case.requirement` | ❌ **D4 阻断** |
| case-detail 创建人 | `c.creator\|\|c.createdBy` | `BaseEntity.createBy` | ⚠️ D10（差一字） |
| case-detail 时间线 token | `d.tokens\|\|d.tokenUsage` | `Derivation.inputTokens/outputTokens` | ⚠️ D7 |
| user-list roles | `(u.roles\|\|[]).map` | `User.roles`(String) | ❌ **D3 阻断**（运行时报错） |
| user-list 创建时间 | `u.createdAt\|\|u.createTime` | `BaseEntity.createTime` | ✅（兜底命中 createTime） |
| dashboard overview | `firstNum(d,[caseTotal,...])` | `OverviewVo.caseTotal/...` | ✅（兜底命中） |
| dashboard derivation token | `it.inputToken/outputToken` | `totalTokens`(合计) | ⚠️ D6（无分项） |
| search | `data.records`(兜底) / `it.summary` | `IPage.records` / `ArtifactSearchVo.summary` | ✅ |
| derive POST | `resp.data.taskId` / `resp.data.status` | `Map{taskId,status}` | ✅ |
| derive 轮询 | `resp.data.status` | `DerivationTaskState.status` | ✅ |

### 3. 安全审查结论
- **token 存 localStorage**：XSS 风险存在（JS 可读），但 M2 阶段可接受；生产建议改 httpOnly cookie。非阻断。
- **escapeHtml 覆盖**：基本完整。case-detail 的 `renderMarkdown(summary)` 用 marked.parse 渲染后端返回的 Markdown，**未对 Markdown 源码做 sanitize**——若派生产物含恶意脚本（如 `<img onerror>`），marked 默认不剥离 HTML 标签，存在存储型 XSS 风险。建议加 DOMPurify 或配置 marked `sanitize`。记为建议（因产物来自平台内部 LLM 输出，威胁模型有限，但纵深防御应补）。
- **密码字段**：后端 `User.password` 有 `@JsonIgnore` 且 UserServiceImpl 返回前 `setPassword(null)` 双保险，前端无密码残留。✅
- **CORS**：config.js 默认同源模式（base-url 空），由 Nginx 统一入口，无跨域问题。✅ 直连模式注释里有内网 IP（D13）。
- **HTTP 明文**：login.html footer 已提示"开发期 HTTP，生产请启用 HTTPS"。✅

### 4. 逻辑审查结论
- **登录跳转链**：login.html → setToken → index.html → AUTH.restore → current → renderFrame。链路清晰，未登录/token 失效均跳 login。✅
- **角色菜单映射**：menu.js PLATFORM_ROLES 5 值与 user-list ROLE_OPTIONS、UserInfo.roleCodes 一致；体系 AI 角色（ea/pgm/orchestrator）不在白名单不映射（Q-3 裁决）。✅
- **派生轮询**：3 分钟超时（60 次 × 3 秒），pending/running 继续轮询，success/failed 终止。逻辑正确，但未处理 `not_found`（D9）。
- **分页**：page/size 参数传递正确，但后端 size 默认 20（CaseController/UserController 第 46/57 行 `defaultValue="20"`），前端默认 10——不一致但前端每次都显式传 size，无害。

### 5. 代码质量
- jQuery / Bootstrap 用法规范，事件委托（`on('click', '.selector', fn)`）正确。
- 每个 page 内部样式独立 `<style>` 块，颜色沿用 `#1677ff` 主色，未硬编码业务色值（符合"禁止硬编码颜色，用主题变量"——虽未抽 CSS 变量，但主色统一）。轻微：`#1677ff` 在多文件重复，建议抽到 app.css 变量。
- 错误处理：fail 回调统一展示 `xhr.responseJSON.msg`，有兜底文案。✅
- UTF-8 编码：所有 html 有 `<meta charset="UTF-8">`。✅

---

## 阻断级缺陷汇总（Dev 必须修复）

1. **D1**：派生 API 路径前端 `/api/v1/runtime/derive` ≠ 后端 `/api/runtime/derive` → 派生功能整体 404 不可用。
2. **D2**：Case 状态枚举前端 `in_progress/completed/pending` ≠ 后端 `drafting/deriving/reviewing/testing/deploying/done` → 列表状态显示+过滤全部失效。
3. **D3**：user-list 把 `User.roles`(String) 当数组 `.map` → 用户列表页 JS 报错白屏。
4. **D4**：case-detail 取 `c.description` ≠ 后端 `Case.requirement` → 详情页描述丢失。

以上 4 项任一不修复，前端对应功能即不可用。D1/D2/D3 影响核心业务流程（派生、Case 列表、用户管理），D4 影响数据回显完整性。

---

## 本次经验沉淀

1. **前后端字段对齐不能靠前端"兜底链"掩盖**：本前端大量使用 `a || b || c` 多字段兜底（如 `data.list || data.items || data.records`、`c.caseCode || c.code || c.id`），看似健壮，实则掩盖了前后端契约不一致——审查时要逐一核验兜底链里**是否至少有一个字段真实存在于后端返回**。本次发现多处兜底链全军覆没（description/desc 都不在 Case entity；caseCode/code 都不在）。经验：兜底链是代码异味，显式契约 + 单一字段才是健康状态。

2. **枚举值跨层一致性是高频阻断点**：状态枚举（CaseStatus）后端 6 值 vs 前端 3 值完全不匹配，且前端还另有 `running/failed/success`（用于派生轮询，与 DerivationTaskState 对齐）。同一套"状态"概念在不同实体（Case vs Derivation）有不同枚举集，前端易混淆抄串。经验：审查时必须对每个枚举/下拉选项，回后端 entity/枚举类逐一核对 dbValue，不能假设"状态就是那几个"。

3. **API 路径版本前缀（/v1/）需全局统一核对**：RuntimeController 是历史遗留无 `/v1`，新增 Controller 都有 `/v1`。前端默认按"新规范"全部写 `/api/v1/...`，对老 Controller 直接踩坑。经验：路径对齐不能只看 @RequestMapping 类注解，要确认版本前缀在类注解还是方法注解，且 Nginx 透传无法弥补 Controller 级别的路径段缺失。
