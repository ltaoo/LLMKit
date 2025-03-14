import { useEffect } from "react";

import { base, Handler } from "@/libs/base";
import { ChatBoxPayloadType } from "@/libs/chatbox";

import {
  storage,
  agent_store,
  llm_store,
  chatroom,
  ChatBoxPayloadCustomType,
} from "./store";
import { useViewModel } from "./hooks";

function AppViewModel() {
  const _state = {
    get providers() {
      return llm_store.state.providers;
    },
    get enabledProviders() {
      return llm_store.state.enabledProviders;
    },
    get pendingProviders() {
      return llm_store.state.pendingProviders;
    },
    get agents() {
      return agent_store.state.agents;
    },
    get agentsInRoom() {
      return chatroom.state.agents;
    },
    get inputting() {
      return chatroom.state.inputting;
    },
    get boxes() {
      return chatroom.state.boxes;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    ui: {
      $llm: llm_store,
      $agent: agent_store,
      $editor: agent_store.$editor,
      $chatroom: chatroom,
    },
    ready() {
      const { llm_configs, agent_configs } = storage.values;
      llm_store.patch(llm_configs);
      agent_store.patch(agent_configs);
      llm_store.onProviderChange((payload) => {
        storage.set("llm_configs", {
          ...storage.get("llm_configs"),
          [payload.id]: payload,
        });
      });
      agent_store.onAgentChange((payload) => {
        storage.set("agent_configs", {
          ...storage.get("agent_configs"),
          [payload.id]: payload,
        });
      });
      llm_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      agent_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      chatroom.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
    },
    startChat(agent: { id: string }) {
      const matched = agent_store.findAgentById(agent.id);
      if (!matched) {
        return;
      }
      chatroom.startChat([matched]);
    },
    addAgentToChat(agent: { id: string }) {
      const matched = agent_store.findAgentById(agent.id);
      if (!matched) {
        return;
      }
      chatroom.addAgentToChat(matched);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function App() {
  const [state, model] = useViewModel(AppViewModel);

  useEffect(() => {
    model.ready();
  }, []);

  return (
    <div className="w-screen h-screen">
      <div className="flex w-full">
        {/* 第一列 - 固定宽度 */}
        <div className="w-84 h-screen overflow-y-auto bg-gray-100 p-4 border-r">
          <h2 className="text-lg font-bold h-8 mb-4">LLM 提供商</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="llm_list w-full space-y-4">
              {state.providers &&
                state.providers.map((provider) => (
                  <div className="" key={provider.id}>
                    <div className="llm_header flex items-center justify-between">
                      <div className="llm_title flex items-center">
                        <img
                          className="w-5 h-5"
                          src={provider.logo_uri}
                          alt={provider.name}
                        />
                        <h2 className="text-lg font-medium text-gray-900">
                          {provider.name}
                        </h2>
                      </div>
                      <input
                        className="border"
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={(e) => {
                          model.ui.$llm.toggleProviderEnabled({
                            provider_id: provider.id,
                            enabled: e.target.checked,
                          });
                        }}
                      />
                    </div>
                    <div>
                      {provider.enabled && (
                        <>
                          <div>
                            <div>
                              <div>API代理地址</div>
                              <input
                                className="w-full border"
                                placeholder={provider.placeholder}
                                value={provider.apiProxyAddress}
                                onChange={(event) => {
                                  model.ui.$llm.updateProviderApiProxyAddress({
                                    provider_id: provider.id,
                                    apiProxyAddress: event.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <div>API密钥</div>
                              <input
                                className="w-full border"
                                value={provider.apiKey}
                                onChange={(event) => {
                                  model.ui.$llm.updateProviderApiKey({
                                    provider_id: provider.id,
                                    apiKey: event.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                          {provider.models &&
                            provider.models.map((m) => (
                              <div
                                className="flex items-center justify-between gap-4"
                                key={m.id}
                              >
                                <div className="text-gray-900">{m.name}</div>
                                <div className="flex items-center">
                                  {!m.buildin && (
                                    <div
                                      className="text-sm mr-2 cursor-pointer whitespace-nowrap"
                                      onClick={() => {
                                        model.ui.$llm.deleteProviderModel({
                                          provider_id: provider.id,
                                          model_id: m.id,
                                        });
                                      }}
                                    >
                                      删除
                                    </div>
                                  )}
                                  <input
                                    className="w-full border"
                                    type="checkbox"
                                    checked={m.enabled}
                                    onChange={(e) => {
                                      model.ui.$llm.toggleModelEnabled({
                                        provider_id: provider.id,
                                        model_id: m.id,
                                        enabled: e.target.checked,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          <div className="flex items-center gap-4">
                            <input
                              className="flex-1 border"
                              autoComplete="off"
                              autoCapitalize="off"
                              value={
                                state.pendingProviders[provider.id]?.model_id ??
                                ""
                              }
                              onChange={(event) => {
                                model.ui.$llm.updatePendingModel({
                                  provider_id: provider.id,
                                  id: event.target.value,
                                });
                              }}
                            />
                            <button
                              onClick={() => {
                                model.ui.$llm.addPendingModel({
                                  provider_id: provider.id,
                                });
                              }}
                            >
                              新增model
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="w-80 h-screen overflow-y-auto bg-gray-50 p-4 border-r">
          <h2 className="text-lg font-bold h-8 mb-4">Agent</h2>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="space-y-6">
              {agent_store.state &&
                agent_store.state.agents &&
                agent_store.state.agents.map((agent) => (
                  <div key={agent.id}>
                    <div className="font-medium text-gray-900 mb-4">
                      {agent.id}、{agent.name}
                    </div>
                    <div className="text-gray-700 mb-4">{agent.desc}</div>
                    <div className="text-gray-700 mb-4">{agent.prompt}</div>
                    <select
                      className="w-full p-2 border rounded mb-4"
                      value={`${agent.llm.provider_id}:${agent.llm.model_id}`}
                      onChange={(event) => {
                        const [provider_id, model_id] =
                          event.currentTarget.value.split(":");
                        model.ui.$editor.selectProviderModelForAgent({
                          agent_id: agent.id,
                          provider_id: provider_id,
                          model_id: model_id,
                        });
                      }}
                    >
                      {state.enabledProviders.map((provider) => (
                        <optgroup key={provider.id} label={provider.name}>
                          {provider.models.map((m) => (
                            <option
                              key={m.id}
                              value={`${provider.id}:${m.id}`}
                              // selected={
                              //   agent.llm.provider_id === provider.id &&
                              //   agent.llm.model_id === m.id
                              // }
                              // onClick={() => {
                              //   model.ui.$editor.selectProviderModel({
                              //     provider_id: provider.id,
                              //     model_id: m.id,
                              //   });
                              // }}
                            >
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      {/* <button
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                          model.startChat(agent);
                        }}
                      >
                        对话
                      </button> */}
                      <button
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                          model.addAgentToChat(agent);
                        }}
                      >
                        添加到对话
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {/* 聊天室 */}
        <div className="flex-1 h-screen overflow-y-auto p-4">
          <div className="flex items-center h-8 mb-4">
            <h2 className="text-lg font-bold mr-4">Agent 对话</h2>
            <div className="flex items-center">
              {state.agentsInRoom.map((agent, index) => (
                <div
                  key={agent.id}
                  className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 border-2 border-white"
                  style={{
                    marginLeft: index > 0 ? "-8px" : "0",
                    zIndex: state.agentsInRoom.length - index,
                  }}
                >
                  {agent.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[90%]">
            <div className="absolute top-0 bottom-[240px] space-y-4 w-full overflow-y-auto">
              {state.boxes.map((msg) => {
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600">
                      {msg.sender.name.charAt(0)}
                    </div>
                    <div
                      className={`max-w-[70%] ${
                        msg.isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`text-sm text-gray-600 mb-1 ${
                          msg.isMe ? "text-right" : ""
                        }`}
                      >
                        {msg.sender.name}
                      </div>
                      {(() => {
                        if (msg.payload.type === ChatBoxPayloadType.Text) {
                          return (
                            <div
                              className={`rounded-lg px-4 py-2 break-words ${
                                msg.isMe
                                  ? "bg-blue-500 text-white rounded-tr-none"
                                  : "bg-gray-100 text-gray-800 rounded-tl-none"
                              }`}
                            >
                              {msg.payload.text}
                            </div>
                          );
                        }
                        if (msg.payload.type === ChatBoxPayloadType.Custom) {
                          if (
                            msg.payload.data.type ===
                            ChatBoxPayloadCustomType.Vocabulary
                          ) {
                            return (
                              <div className="bg-white rounded-lg shadow-md p-4 max-w-md border border-gray-200">
                                <div className="space-y-4">
                                  {/* 翻译部分 */}
                                  <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">
                                      翻译
                                    </div>
                                    <div className="text-base text-gray-800">
                                      {msg.payload.data.translation}
                                    </div>
                                  </div>
                                  {/* 发音 */}
                                  <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">
                                      发音
                                    </div>
                                    <div className="text-base text-gray-800">
                                      {msg.payload.data.pronunciation}
                                    </div>
                                  </div>
                                  {/* 例句部分 */}
                                  <div>
                                    <div className="text-sm font-medium text-gray-500 mb-1">
                                      例句
                                    </div>
                                    <div className="space-y-2">
                                      {msg.payload.data.examples.map(
                                        (example: string, index: number) => (
                                          <div
                                            key={index}
                                            className="text-sm text-gray-700 bg-gray-50 p-2 rounded"
                                          >
                                            {example}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                        if (msg.payload.type === ChatBoxPayloadType.Error) {
                          return (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-red-800 mb-1">
                                    {msg.payload.title}
                                  </h3>
                                  <div className="text-sm text-red-700 whitespace-pre-wrap">
                                    {msg.payload.content}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return <div>Unknown</div>;
                      })()}
                      <div
                        className={`text-xs text-gray-500 mt-1 ${
                          msg.isMe ? "text-right" : ""
                        }`}
                      >
                        {msg.createdAt}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute left-0 bottom-[12px] w-full ">
              <textarea
                className="w-full p-2 border rounded mb-4"
                rows={6}
                value={state.inputting}
                onChange={(event) => {
                  model.ui.$chatroom.inputting(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    model.ui.$chatroom.sendMessage(event.currentTarget.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
