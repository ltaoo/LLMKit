<script setup lang="ts">
import { ChatBoxPayloadType } from "@llmkit/libs/chatbox";
import { AppViewModel } from "@logic/index";

import { useViewModel } from "./hooks";

const [state, $model] = useViewModel(AppViewModel);
</script>

<template>
  <div class="w-screen h-screen">
    <div class="flex w-full">
      <!-- 第一列 - LLM提供商 -->
      <div class="w-84 h-screen overflow-y-auto bg-gray-100 p-4 border-r">
        <h2 class="text-lg font-bold h-8 mb-4">LLM 提供商</h2>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="llm_list w-full space-y-4">
            <template v-for="provider in state.providers" :key="provider.id">
              <div class="">
                <div class="llm_header flex items-center justify-between">
                  <div class="llm_title flex items-center">
                    <img class="w-5 h-5" :src="provider.logo_uri" :alt="provider.name" />
                    <h2 class="text-lg font-medium text-gray-900">{{ provider.name }}</h2>
                  </div>
                  <input
                    class="border"
                    type="checkbox"
                    :checked="provider.enabled"
                    @change="(e: Event) => $model.ui.$llm.toggleProviderEnabled({
                      provider_id: provider.id,
                      enabled: (e.target as HTMLInputElement).checked
                    })"
                  />
                </div>
                <div v-if="provider.enabled">
                  <div>
                    <div>
                      <div>API代理地址</div>
                      <input
                        class="w-full border"
                        :placeholder="provider.placeholder"
                        :value="provider.apiProxyAddress"
                        @input="(event: Event) => $model.ui.$llm.updateProviderApiProxyAddress({
                          provider_id: provider.id,
                          apiProxyAddress: (event.target as HTMLInputElement).value
                        })"
                      />
                    </div>
                    <div>
                      <div>API密钥</div>
                      <input
                        class="w-full border"
                        :value="provider.apiKey"
                        @input="(event: Event) => $model.ui.$llm.updateProviderApiKey({
                          provider_id: provider.id,
                          apiKey: (event.target as HTMLInputElement).value
                        })"
                      />
                    </div>
                  </div>
                  <template v-if="provider.models">
                    <div v-for="m in provider.models" :key="m.id" class="flex items-center justify-between gap-4">
                      <div class="text-gray-900">{{ m.name }}</div>
                      <div class="flex items-center">
                        <div
                          v-if="!m.builtin"
                          class="text-sm mr-2 cursor-pointer whitespace-nowrap"
                          @click="
                            $model.ui.$llm.deleteProviderModel({
                              provider_id: provider.id,
                              model_id: m.id,
                            })
                          "
                        >
                          删除
                        </div>
                        <input
                          class="w-full border"
                          type="checkbox"
                          :checked="m.enabled"
                          @change="(e: Event) => $model.ui.$llm.toggleModelEnabled({
                            provider_id: provider.id,
                            model_id: m.id,
                            enabled: (e.target as HTMLInputElement).checked
                          })"
                        />
                      </div>
                    </div>
                  </template>
                  <div class="flex items-center gap-4">
                    <input
                      class="flex-1 border"
                      autocomplete="off"
                      autocapitalize="off"
                      :value="state.pendingProviders[provider.id]?.model_id ?? ''"
                      @input="(event: Event) => $model.ui.$llm.updatePendingModel({
                        provider_id: provider.id,
                        id: (event.target as HTMLInputElement).value
                      })"
                    />
                    <button
                      @click="
                        $model.ui.$llm.addPendingModel({
                          provider_id: provider.id,
                        })
                      "
                    >
                      新增model
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 第二列 - Agent列表 -->
      <div class="w-80 h-screen overflow-y-auto bg-gray-50 p-4 border-r">
        <h2 class="text-lg font-bold h-8 mb-4">Agent</h2>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="space-y-6">
            <template v-for="agent in state.agents" :key="agent.id">
              <div>
                <div class="font-medium text-gray-900 mb-4">{{ agent.id }}、{{ agent.name }}</div>
                <div class="text-gray-700 mb-4">{{ agent.desc }}</div>
                <div class="text-gray-700 mb-4">{{ agent.prompt }}</div>
                <select
                  class="w-full p-2 border rounded mb-4"
                  :value="`${agent.llm.provider_id}:${agent.llm.model_id}`"
                  @change="(event: Event) => {
                    const [provider_id, model_id] = (event.target as HTMLSelectElement).value.split(':');
                    $model.ui.$editor.selectProviderModelForAgent({
                      agent_id: agent.id,
                      provider_id,
                      model_id
                    });
                  }"
                >
                  <optgroup v-for="provider in state.enabledProviders" :key="provider.id" :label="provider.name">
                    <option v-for="m in provider.models" :key="m.id" :value="`${provider.id}:${m.id}`">
                      {{ m.name }}
                    </option>
                  </optgroup>
                </select>
                <div class="flex items-center gap-2">
                  <button
                    class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    @click="$model.addAgentToChat(agent)"
                  >
                    添加到对话
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 第三列 - 聊天室 -->
      <div class="flex-1 h-screen overflow-y-auto p-4">
        <div class="flex items-center h-8 mb-4">
          <h2 class="text-lg font-bold mr-4">Agent 对话</h2>
          <div class="flex items-center">
            <template v-for="(agent, index) in state.agentsInRoom" :key="agent.id">
              <div
                class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 border-2 border-white"
                :style="{
                  marginLeft: index > 0 ? '-8px' : '0',
                  zIndex: state.agentsInRoom.length - index,
                }"
              >
                {{ agent.name.charAt(0) }}
              </div>
            </template>
          </div>
        </div>

        <div class="relative h-[90%]">
          <div class="absolute top-0 bottom-[240px] space-y-4 w-full overflow-y-auto">
            <template v-for="msg in state.boxes" :key="msg.id">
              <div class="flex items-start gap-3" :class="msg.isMe ? 'flex-row-reverse' : 'flex-row'">
                <div
                  class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600"
                >
                  {{ msg.sender.name.charAt(0) }}
                </div>
                <div class="max-w-[70%]" :class="msg.isMe ? 'items-end' : 'items-start'">
                  <div class="text-sm text-gray-600 mb-1" :class="msg.isMe ? 'text-right' : ''">
                    {{ msg.sender.name }}
                  </div>

                  <!-- Text Message -->
                  <div
                    v-if="msg.payload.type === ChatBoxPayloadType.Text"
                    class="rounded-lg px-4 py-2 break-words"
                    :class="
                      msg.isMe ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    "
                  >
                    {{ msg.payload.text }}
                  </div>

                  <!-- Vocabulary Message -->
                  <div
                    v-else-if="msg.payload.type === ChatBoxPayloadType.Custom && msg.payload.data.type === 'vocabulary'"
                    class="bg-white rounded-lg shadow-md p-4 max-w-md border border-gray-200"
                  >
                    <div class="space-y-4">
                      <div>
                        <div class="text-sm font-medium text-gray-500 mb-1">翻译</div>
                        <div class="text-base text-gray-800">{{ msg.payload.data.translation }}</div>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-500 mb-1">发音</div>
                        <div class="text-base text-gray-800">{{ msg.payload.data.pronunciation }}</div>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-500 mb-1">例句</div>
                        <div class="space-y-2">
                          <div
                            v-for="(example, index) in msg.payload.data.examples"
                            :key="index"
                            class="text-sm text-gray-700 bg-gray-50 p-2 rounded"
                          >
                            {{ example }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Error Message -->
                  <div
                    v-else-if="msg.payload.type === ChatBoxPayloadType.Error"
                    class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md"
                  >
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
                        <h3 class="text-sm font-medium text-red-800 mb-1">{{ msg.payload.title }}</h3>
                        <div class="text-sm text-red-700 whitespace-pre-wrap">{{ msg.payload.content }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="text-xs text-gray-500 mt-1" :class="msg.isMe ? 'text-right' : ''">
                    {{ msg.createdAt }}
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Input Area -->
          <div class="absolute left-0 bottom-[12px] w-full">
            <div class="border-t border-gray-200 bg-white p-4">
              <div class="max-w-4xl mx-auto">
                <div class="relative">
                  <textarea
                    class="w-full resize-none rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 px-4 py-3 min-h-[120px] transition-colors duration-200"
                    placeholder="Type your message here..."
                    autocapitalize="off"
                    autocomplete="off"
                    :value="state.inputting"
                    @input="(event: Event) => $model.ui.$chatroom.input((event.target as HTMLTextAreaElement).value)"
                    @keydown="(event: KeyboardEvent) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        $model.ui.$chatroom.sendMessage((event.target as HTMLTextAreaElement).value);
                      }
                    }"
                  />
                  <div class="absolute bottom-3 right-3 flex items-center space-x-2">
                    <button
                      class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                      @click="$model.ui.$chatroom.sendMessage(state.inputting)"
                    >
                      {{ state.loading ? "Sending..." : "Send" }}
                    </button>
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-500 text-right">Press Enter to send, Shift + Enter for new line</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.w-84 {
  width: 21rem;
}
</style>
