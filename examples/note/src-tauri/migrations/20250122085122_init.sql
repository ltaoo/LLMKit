
    DROP TABLE IF EXISTS LLM_AGENT;
    CREATE TABLE LLM_AGENT(
    
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, --id
        name TEXT(255) NOT NULL, --名称
        desc TEXT(255), --描述信息
        avatar_uri TEXT(255) NOT NULL, --头像地址
        prompt TEXT(255) NOT NULL, --提示词
        tags TEXT(255), --标签
        agent_type INTEGER NOT NULL, --类型
        llm_config TEXT(1000) NOT NULL DEFAULT '{}', --LLM 配置
        llm_provider_id TEXT(255) NOT NULL, --使用厂商ID
        llm_model_id TEXT(255) NOT NULL, --使用厂商下指定模型id
        builtin INTEGER NOT NULL --是否系统内置，不能删除
    
    ); --Agent
    
  
    DROP TABLE IF EXISTS LLM_AGENT_PROFILE;
    CREATE TABLE LLM_AGENT_PROFILE(
    
        owner_id INTEGER NOT NULL, --关联 agent id
        desc TEXT(255), --模型描述
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
    
    ); --Agent详情信息
    
  
    DROP TABLE IF EXISTS LLM_PROVIDER_MODEL;
    CREATE TABLE LLM_PROVIDER_MODEL(
    
        id TEXT(255) NOT NULL PRIMARY KEY, --id
        name TEXT(255) NOT NULL, --模型名称
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
    
