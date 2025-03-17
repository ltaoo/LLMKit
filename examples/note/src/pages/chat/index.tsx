import { For, Show } from "solid-js";

import { base, Handler } from "@llm/libs/base";
import { ChatRoomCore } from "@llm/libs/chatroom";
import { ChatBoxPayloadType } from "@llm/libs/chatbox";
import { BizError } from "@llm/libs/biz_error";
import { LLMAgentCore } from "@llm/libs/llm_agent";

import { ViewComponentProps } from "@/store/types";
import { ChatBoxPayloadCustomType } from "@/store/agents";
import { agent_store } from "@/store/agents";
import { llm_store } from "@/store/llm";
import { useViewModel } from "@/hooks";

function AgentChatViewModel(props: ViewComponentProps) {
  console.log("[PAGE]chat/index - AgentChatViewModel", props.view.query);

  let _agent: LLMAgentCore | null = null;
  let _error: BizError | null = null;
  let _chatroom = ChatRoomCore({ agents: [] });

  let _state = {
    get name() {
      if (!_agent) {
        return "...";
      }
      return _agent.name;
    },
    get LLMConfig() {
      if (!_agent) {
        return null;
      }
      return {
        provider_id: _agent.llm.provider_id,
        model_id: _agent.llm.model_id,
        stream: _agent.llm.extra.stream ?? false,
      };
    },
    get LLMProvider() {
      if (!_agent) {
        return null;
      }
      const r = llm_store.findProviderById(_agent.llm.provider_id, {
        enabled: true,
      });
      if (!r) {
        return null;
      }
      return {
        id: r.id,
        name: r.name,
        model: r.models.map((model) => {
          return {
            id: model.id,
            name: model.name,
          };
        }),
      };
    },
    get boxes() {
      return _chatroom.state.boxes;
    },
    get inputting() {
      return _chatroom.state.inputting;
    },
    get error() {
      return _error
        ? {
            message: _error.message,
            code: _error.code,
          }
        : null;
    },
  };

  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: typeof _error;
  };
  const bus = base<TheTypesOfEvents>();
  return {
    state: _state,
    ui: {
      $chatroom: _chatroom,
    },
    async ready() {
      agent_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      _chatroom.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      const r = await agent_store.findAgentById(props.view.query.id);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        _error = r.error;
        bus.emit(Events.StateChange, { ..._state });
        return;
      }
      console.log("[PAGE]chat/index - AgentChatViewModel - r", r.data);
      _agent = r.data;
      agent_store.appendAgents([_agent]);
      _error = null;
      _chatroom.addAgentToChat(_agent);
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function AgentChatPage(props: ViewComponentProps) {
  const [state, $model] = useViewModel(AgentChatViewModel, [props]);

  return (
    <div class="h-screen flex flex-col bg-gray-50">
      <Show when={!state().error} fallback={<div class="text-center text-red-500 p-4">{state().error!.message}</div>}>
        {/* 顶部状态栏 */}
        <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 font-medium">{state().name.charAt(0)}</span>
            </div>
            <div>
              <h2 class="font-medium text-gray-900">{state().name}</h2>
              <Show when={state().LLMProvider}>
                <p class="text-sm text-gray-500">
                  {state().LLMProvider?.name} - {state().LLMConfig?.model_id}
                </p>
              </Show>
            </div>
          </div>
          {/* <div class="flex items-center space-x-2">
            <div class={`w-2 h-2 rounded-full ${state().LLMProvider ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span class="text-sm text-gray-600">{state().LLMProvider ? 'Connected' : 'Disconnected'}</span>
          </div> */}
        </div>

        {/* 聊天消息区域 */}
        <div class="flex-1 overflow-hidden">
          <div class="h-full overflow-y-auto px-4 py-6 space-y-6">
            {state().boxes.map((msg) => {
              return (
                <div class={`flex items-start gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600">
                    {msg.sender.name.charAt(0)}
                  </div>
                  <div class={`max-w-[70%] ${msg.isMe ? "items-end" : "items-start"}`}>
                    <div class={`text-sm text-gray-600 mb-1 ${msg.isMe ? "text-right" : ""}`}>{msg.sender.name}</div>
                    {(() => {
                      if (msg.payload.type === ChatBoxPayloadType.Text) {
                        return (
                          <div
                            class={`rounded-lg px-4 py-2 break-words ${
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
                        if (msg.payload.data.type === ChatBoxPayloadCustomType.Vocabulary) {
                          return (
                            <div class="bg-white rounded-lg shadow-md p-4 max-w-md border border-gray-200">
                              <div class="space-y-4">
                                {/* 翻译部分 */}
                                <div>
                                  <div class="text-sm font-medium text-gray-500 mb-1">翻译</div>
                                  <div class="text-base text-gray-800">{msg.payload.data.translation}</div>
                                </div>
                                {/* 发音 */}
                                <div>
                                  <div class="text-sm font-medium text-gray-500 mb-1">发音</div>
                                  <div class="text-base text-gray-800">{msg.payload.data.pronunciation}</div>
                                </div>
                                {/* 例句部分 */}
                                <div>
                                  <div class="text-sm font-medium text-gray-500 mb-1">例句</div>
                                  <div class="space-y-2">
                                    <For each={msg.payload.data.examples}>
                                      {(example, index) => {
                                        return (
                                          <div class="text-sm text-gray-700 bg-gray-50 p-2 rounded">{example}</div>
                                        );
                                      }}
                                    </For>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return <div>Unknown Custom Content {msg.payload.type}</div>;
                      }
                      if (msg.payload.type === ChatBoxPayloadType.Error) {
                        return (
                          <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                            <div class="flex items-start">
                              <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800 mb-1">{msg.payload.title}</h3>
                                <div class="text-sm text-red-700 whitespace-pre-wrap">{msg.payload.content}</div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return <div>Unknown</div>;
                    })()}
                    <div class={`text-xs text-gray-500 mt-1 ${msg.isMe ? "text-right" : ""}`}>{msg.createdAt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部输入框区域 */}
        <div class="border-t border-gray-200 bg-white p-4">
          <div class="max-w-4xl mx-auto">
            <div class="relative">
              <textarea
                class="w-full resize-none rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 px-4 py-3 min-h-[120px] transition-colors duration-200"
                placeholder="Type your message here..."
                autocapitalize="off"
                autocomplete="off"
                value={state().inputting}
                onChange={(event) => {
                  $model.ui.$chatroom.input(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    $model.ui.$chatroom.sendMessage(event.currentTarget.value);
                  }
                }}
              />
              <div class="absolute bottom-3 right-3 flex items-center space-x-2">
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => $model.ui.$chatroom.sendMessage(state().inputting)}
                >
                  Send
                </button>
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500 text-right">Press Enter to send, Shift + Enter for new line</p>
          </div>
        </div>
      </Show>
    </div>
  );
}
