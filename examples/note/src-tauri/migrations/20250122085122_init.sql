DROP TABLE IF EXISTS LLM_AGENT;
CREATE TABLE LLM_AGENT(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    name TEXT(255) NOT NULL, --名称
    desc TEXT(255), --描述信息
    avatar_uri TEXT(255), --头像地址
    prompt TEXT(255) NOT NULL, --提示词
    tags TEXT(255), --标签
    agent_type INTEGER NOT NULL, --类型
    llm_config TEXT(1000) NOT NULL DEFAULT '{}', --LLM 配置
    llm_provider_id TEXT(255) NOT NULL, --使用厂商ID
    llm_model_id TEXT(255) NOT NULL, --使用厂商指定模型id
    builtin INTEGER NOT NULL, --是否系统内置，不能删除
    config TEXT(1000) NOT NULL DEFAULT '{}', --agent 的配置
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP --

); --Agent


DROP TABLE IF EXISTS LLM_PROVIDER_MODEL_PROFILE;
CREATE TABLE LLM_PROVIDER_MODEL_PROFILE(

    llm_provider_model_id TEXT(255) NOT NULL, --关联 model id
    desc TEXT(255), --描述
    tags TEXT(255), --标签
    model_type INTEGER, --模型类型
    version TEXT(255), --模型版本，也算一个额外标签吧
    architecture_type TEXT(255), --架构类型
    parameter_count TEXT(255), --参数量
    training_data TEXT(255), --训练数据
    training_method TEXT(255), --训练方式
    evaluation_metrics TEXT(255), --评估指标
    usage_restrictions TEXT(255), --使用限制
    cost_information TEXT(255) --费用信息

); --Model详情信息


DROP TABLE IF EXISTS LLM_PROVIDER_MODEL;
CREATE TABLE LLM_PROVIDER_MODEL(

    id TEXT(255) NOT NULL PRIMARY KEY, --id
    name TEXT(255) NOT NULL, --模型名称
    enabled INTEGER NOT NULL, --是否启用
    llm_provider_id TEXT(255) NOT NULL, --所属厂商id
    builtin INTEGER NOT NULL --是否厂商自带

); --LLM厂商模型


DROP TABLE IF EXISTS LLM_PROVIDER;
CREATE TABLE LLM_PROVIDER(

    id TEXT(255) NOT NULL PRIMARY KEY, --id
    name TEXT(90) NOT NULL, --厂商名称
    logo_uri TEXT(255) NOT NULL, --厂商logo
    api_address TEXT(255) NOT NULL, --请求地址
    configure TEXT(1000) NOT NULL DEFAULT '{}', --允许的配置项
    api_proxy_address TEXT(255), --用户输入的配置项
    api_key TEXT(255), --用户输入的api key
    enabled INTEGER NOT NULL DEFAULT 0 --该厂商是否启用

); --LLM厂商


DROP TABLE IF EXISTS LLM_RESPONSE;
CREATE TABLE LLM_RESPONSE(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    llm_provider_id TEXT(255) NOT NULL, --该次调用使用的厂商id
    llm_provider_model_id TEXT(255) NOT NULL, --该次调用使用的厂商模型id
    llm_agent_id INTEGER NOT NULL, --该次调用的发起者
    body TEXT(1000) NOT NULL DEFAULT '{}', --该次调用的请求体
    response TEXT(1000), --该次调用的响应体
    error TEXT(1000), --该次调用是否发生错误
    prompt_tokens INTEGER NOT NULL, --输入提示所消耗的 token
    completion_tokens INTEGER NOT NULL, --生成回复内容所消耗的 token
    total_tokens INTEGER NOT NULL, --次对话请求和响应总共消耗
    response_id TEXT(255), --厂商返回的对话完成的唯一标识符
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP --响应时间

); --调用LLM记录


DROP TABLE IF EXISTS NOTE;
CREATE TABLE NOTE(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    name TEXT(255) NOT NULL, --标题
    content TEXT(255), --笔记内容
    tags TEXT(255), --标签
    filepath TEXT(255) NOT NULL, --markdown 文件完整路径
    parent_filepath TEXT(255) NOT NULL, --笔记所在目录
    updated_at TEXT, --更新时间
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP --创建时间

); --笔记


DROP TABLE IF EXISTS CONFIG;
CREATE TABLE CONFIG(

    file_rootpath TEXT(255) --笔记保存根路径

); --应用全局配置


DROP TABLE IF EXISTS FOLDER;
CREATE TABLE FOLDER(

    name INTEGER, --文件夹名称
    filepath TEXT(255), --文件夹完整路径
    parent_filepath TEXT(255) --所在目录路径

); --文件夹


DROP TABLE IF EXISTS CHAT_BOX;
CREATE TABLE CHAT_BOX(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    sender_id INTEGER NOT NULL, --所属 agent id
    chat_session_id INTEGER NOT NULL, --所属对话 id
    payload TEXT(1000) NOT NULL DEFAULT '{}', --具体内容
    box_type INTEGER NOT NULL, --类型
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP --创建时间

); --对话内容


DROP TABLE IF EXISTS CHAT_SESSION;
CREATE TABLE CHAT_SESSION(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    title TEXT(255) NOT NULL, --对话概述
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP --创建时间

); --对话


DROP TABLE IF EXISTS CHAT_MEMBER;
CREATE TABLE CHAT_MEMBER(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    llm_agent_id INTEGER NOT NULL, --对应 agent
    chat_session_id INTEGER NOT NULL --所属 session

); --对话成员


DROP TABLE IF EXISTS DAILY;
CREATE TABLE DAILY(

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
    content TEXT(255) NOT NULL, --内容
    date TEXT(255) NOT NULL, --日记时间
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP --创建时间

); --日记


DROP TABLE IF EXISTS CHAT_SESSION_AND_LLM_AGENT;
CREATE TABLE CHAT_SESSION_AND_LLM_AGENT(

    chat_session_id TEXT(32) NOT NULL, --关联chat_session
    llm_agent_id TEXT(255) NOT NULL --管理 llm_agent

); --

INSERT INTO LLM_AGENT (
    name,
    desc,
    prompt,
    tags,
    agent_type,
    llm_config,
    llm_provider_id,
    llm_model_id,
    builtin,
    config
) VALUES 
(
    '纠错',
    '可以对中文进行纠错',
    '你是一个中文纠错专家，请对以下中文进行纠错，并给出纠错后的结果。',
    'chinese,correction',
    1,
    '{}',
    'deepseek',
    'deepseek-chat',
    1,
    '{}'
),
(
    '润色',
    '可以对中文进行润色',
    '你是一个中文润色专家，请对以下中文进行润色，并给出润色后的结果。请不要考虑语句是否合理，只需要润色即可。',
    'chinese,polish',
    1,
    '{}',
    'deepseek',
    'deepseek-chat',
    1,
    '{}'
),
(
    '翻译成英文',
    '可以对中文进行翻译成英文',
    '你是一个中文翻译成英文专家，请对以下中文进行翻译成英文，并给出翻译后的结果。',
    'translation,english',
    1,
    '{}',
    'deepseek',
    'deepseek-chat',
    1,
    '{}'
),
(
    '查询',
    '可以对中文进行查询',
    '你是一个中文字典，请对以下中文进行查询，并给出查询后的结果。',
    'chinese,dictionary',
    1,
    '{}',
    'deepseek',
    'deepseek-chat',
    1,
    '{}'
);

INSERT INTO LLM_PROVIDER (
    id,
    name,
    logo_uri,
    api_address,
    configure,
    api_proxy_address,
    enabled
) VALUES 
(
    'deepseek',
    'DeepSeek',
    '/provider_light_deepseek.png',
    'https://api.deepseek.com/chat/completions',
    '{"type":"object","label":"配置","name":"configure","fields":{"stream":{"type":"single","label":"流式输出","name":"stream","input":{"type":"checkbox","defaultValue":false}},"temperature":{"type":"single","label":"温度","name":"temperature","input":{"type":"input","defaultValue":0.5}}}}',
    '',
    1
),
(
    'openai',
    'OpenAI',
    '/provider_light_openai.png',
    'https://api.openai.com/v1/chat/completions',
    '{"type":"object","label":"配置","name":"configure","fields":{"stream":{"type":"single","label":"流式输出","name":"stream","input":{"type":"checkbox","defaultValue":false}}}}',
    '',
    0
),
(
    'volcengine',
    '火山引擎',
    '/provider_light_doubao.png',
    'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    '{"type":"object","label":"配置","name":"configure","fields":{"stream":{"type":"single","label":"流式输出","name":"stream","input":{"type":"checkbox","defaultValue":false}}}}',
    '',
    0
),
(
    'siliconflow',
    '硅基流动',
    '/provider_light_siliconcloud.png',
    'https://api.siliconflow.cn/v1/chat/completions',
    '{"type":"object","label":"配置","name":"configure","fields":{"stream":{"type":"single","label":"流式输出","name":"stream","input":{"type":"checkbox","defaultValue":false}}}}',
    '',
    0
);

INSERT INTO LLM_PROVIDER_MODEL (
    id,
    name,
    enabled,
    llm_provider_id,
    builtin
) VALUES
-- https://api-docs.deepseek.com/zh-cn/
(
    'deepseek-chat',
    'DeepSeek-V3',
    1,
    'deepseek',
    1
),
(
    'deepseek-reasoner',
    'DeepSeek-R1',
    0,
    'deepseek',
    1
),
-- https://platform.openai.com/docs/models/gpt-4o
(
    'gpt-3.5-turbo',
    'GPT-3.5 Turbo',
    0,
    'openai',
    1
),
(
    'gpt-4o',
    'GPT-4o',
    0,
    'openai', 
    1
),
-- https://www.volcengine.com/docs/82379/1330310
(
    'doubao-1-5-pro-32k-250115',
    'doubao-1.5-pro',
    0,
    'volcengine',
    1
),
(
    'doubao-1-5-lite-32k-250115',
    'doubao-1.5-lite',
    0,
    'volcengine',
    1
),
(
    'deepseek-v3-241226',
    'deepseek-v3',
    0,
    'volcengine',
    1
),
(
    'Pro/deepseek-ai/DeepSeek-R1',
    'Pro/deepseek-ai/DeepSeek-R1',
    0,
    'siliconflow',
    1
),
(
    'Pro/deepseek-ai/DeepSeek-V3',
    'Pro/deepseek-ai/DeepSeek-V3',
    0,
    'siliconflow',
    1
),
(
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/DeepSeek-R1',
    0,
    'siliconflow',
    1
),
(
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-V3',
    0,
    'siliconflow',
    1
); 

INSERT INTO NOTE (
    id,
    name,
    content,
    filepath,
    parent_filepath
) VALUES
(
    1,
    '示例笔记',
    '这是一个示例笔记，可以选中文本，然后点击“润色”按钮，即可调用 Agent 润色文本。',
    'example.md',
    '/'
)
