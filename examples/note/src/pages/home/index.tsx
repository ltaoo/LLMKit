/**
 * @file 首页
 */
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import Loader from "lucide-solid/icons/loader";
import dayjs from "dayjs";

import { base, Handler } from "@llm/libs/base";
import { ChatBoxPayloadType } from "@llm/libs/chatbox";

import { ViewComponent, ViewComponentProps } from "@/store/types";
import { llm_store } from "@/store/llm";
import { agent_store } from "@/store/agents";
import { NoteStore } from "@/biz/note_store";
import { NoteCore } from "@/biz/note";
import { useViewModel } from "@/hooks";
import { ListView } from "@/components/ui";

function HomeIndexViewModel(props: ViewComponentProps) {
  let _noteStore = NoteStore({ client: props.client });
  let _currentNote: NoteCore | null = null;
  // 添加选择文本相关的状态
  let _selection = {
    text: "",
    isVisible: false,
    x: 0,
    y: 0,
    range: null as Range | null,
    rect: null as DOMRect | null,
    start: 0,
    end: 0,
  };
  /** 调用 AI 处理文本 */
  let _textPending = false;
  let _polishedText = "";
  // 添加保存状态
  let _saveStatus = {
    show: false,
    timer: null as NodeJS.Timeout | null,
  };

  const _state = {
    get response() {
      return _noteStore.ui.$list.response;
    },
    get currentNote() {
      return _currentNote;
    },
    get editTitle() {
      return _currentNote?.title || "";
    },
    get editContent() {
      return _currentNote?.content || "";
    },
    get selectedText() {
      return window.getSelection()?.toString() || "";
    },
    get selection() {
      return _selection;
    },
    get textPending() {
      return _textPending;
    },
    get polishedText() {
      return _polishedText;
    },
    get saveStatus() {
      return _saveStatus;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  _noteStore.onStateChange(() => {
    console.log("[PAGE]home/index - _noteStore.onStateChange", _noteStore.state.response.dataSource);
    bus.emit(Events.StateChange, { ..._state });
  });

  // 添加一个工具函数来处理换行
  function convertToPlainText(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    // 将 <div> 和 <br> 转换为换行符
    const content = div.innerText.replace(/\n\n/g, '\n');
    return content;
  }

  return {
    state: _state,
    ui: {
      $list: _noteStore.ui.$list,
    },
    async ready() {
      console.log("[PAGE]ready");
      await this.loadNotes();
    },
    // 加载笔记列表
    async loadNotes() {
      _noteStore.fetchNotes();
      bus.emit(Events.StateChange, { ..._state });
    },
    syncContent(content: string) {
      if (!_currentNote) {
        return;
      }
      const plainText = convertToPlainText(content);
      _currentNote.setContent(plainText);
      bus.emit(Events.StateChange, { ..._state });
    },
    // 更新笔记
    async updateNoteContent(content: string) {
      if (!_currentNote) {
        props.app.tip({
          text: ["请先选择笔记"],
        });
        return;
      }
      const plainText = convertToPlainText(content);
      if (!_currentNote.contentHasChanged(plainText)) {
        return;
      }
      const r = await _currentNote.updateContent(plainText);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      this.showSaveTip();
      bus.emit(Events.StateChange, { ..._state });
    },
    showSaveTip() {
      // 显示保存状态
      _saveStatus.show = true;
      bus.emit(Events.StateChange, { ..._state });
      // 清除之前的定时器
      if (_saveStatus.timer) {
        clearTimeout(_saveStatus.timer);
      }
      // 2秒后隐藏保存状态
      _saveStatus.timer = setTimeout(() => {
        _saveStatus.show = false;
        bus.emit(Events.StateChange, { ..._state });
      }, 2000);
    },
    // 添加保存笔记方法
    async saveNote() {
      if (!_currentNote) {
        return;
      }
      const r = await _currentNote.updateContent();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      this.showSaveTip();
    },
    // 添加更新标题的方法
    async updateNoteTitle(title: string) {
      if (!_currentNote) {
        props.app.tip({
          text: ["请先选择笔记"],
        });
        return;
      }
      if (!_currentNote.titleHasChanged(title)) {
        return;
      }
      const r = await _currentNote.updateTitle(title);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      _noteStore.ui.$list.modifyResponse((response) => {
        response.dataSource = response.dataSource.map((item) => {
          if (item.id === _currentNote?.id) {
            return { ...item, title };
          }
          return item;
        });
        return response;
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    // 添加创建笔记的方法
    async createNote() {
      const r = await _noteStore.createNote();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      const { id, title } = r.data;
      _noteStore.unshiftNote({ id, title, created_at: dayjs().format("YYYY-MM-DD HH:mm:ss") });
      await this.selectNote({ id });
    },
    // 选择笔记
    async selectNote(note: { id: number }) {
      _currentNote = NoteCore({ id: note.id, client: props.client });
      const r = await _currentNote.load();
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    // 添加文本选择处理方法
    handleTextSelection() {
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
      const text = selection.toString() || "";
      _selection = {
        text: "",
        isVisible: false,
        x: 0,
        y: 0,
        range: null,
        rect: null,
        start: 0,
        end: 0,
      };
      if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect) {
          // 获取选中文本的起始和结束位置
          const container = range.startContainer.parentElement;
          if (container) {
            const textContent = container.textContent || "";
            const start = textContent.indexOf(text);
            const end = start + text.length;
            _selection = {
              text,
              isVisible: true,
              x: rect.left + rect.width / 2,
              y: rect.top - 48,
              range: range ?? null,
              rect,
              start,
              end,
            };
          }
        }
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    // 添加文本操作方法
    async polishText() {
      const agent = agent_store.findAgentById("2");
      if (!agent) {
        console.error("[PAGE]index - polishText - agent not found");
        return;
      }
      _textPending = true;
      bus.emit(Events.StateChange, { ..._state });
      const r = await agent.request<string>(_selection.text);
      _textPending = false;
      bus.emit(Events.StateChange, { ..._state });
      if (r.error) {
        console.error("[PAGE]index - polishText - error", r.error);
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      _polishedText = r.data;
      _selection.isVisible = false;
      bus.emit(Events.StateChange, { ..._state });
    },
    async applyPolishedText() {
      if (!_currentNote) {
        props.app.tip({
          text: ["请先选择笔记"],
        });
        return;
      }
      const _editContent = _currentNote.content;
      if (_selection.start >= 0 && _selection.end > _selection.start) {
        const before = _editContent.substring(0, _selection.start);
        const after = _editContent.substring(_selection.end);
        // _editContent = before + _polishedText + after;
        const r = await _currentNote.updateContent(before + _polishedText + after);
        if (r.error) {
          props.app.tip({
            text: [r.error.message],
          });
          return;
        }
        // 清除选择状态和润色文本
        _selection.isVisible = false;
        _polishedText = "";

        bus.emit(Events.StateChange, { ..._state });
      }
    },
    async checkText() {
      // TODO: 调用 AI 接口进行查错
      console.log("Check text:", _selection.text);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const HomeIndexPage: ViewComponent = (props) => {
  const [state, $model] = useViewModel(HomeIndexViewModel, [props]);

  // 添加快捷键监听
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下 Ctrl+S 或 Command+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault(); // 阻止默认的保存行为
        $model.saveNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <div class="w-full h-screen flex bg-gray-50">
      {/* 左侧笔记列表 */}
      <div class="w-80 h-full border-r border-gray-200 bg-white overflow-y-auto">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">我的笔记</h2>
          <button
            onClick={() => $model.createNote()}
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="新建笔记"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div class="divide-y divide-gray-100">
          <ListView store={$model.ui.$list} skeleton={<div class="w-full h-10 bg-gray-100" />}>
            <For each={state().response.dataSource}>
              {(note) => (
                <div
                  class={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    state().currentNote?.id === note.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                  onClick={() => $model.selectNote(note)}
                >
                  <h3 class="font-medium text-gray-900 mb-1">{note.title}</h3>
                  <p class="text-sm text-gray-500 truncate">{note.created_at}</p>
                </div>
              )}
            </For>
          </ListView>
        </div>
      </div>
      {/* 右侧内容区 */}
      <div class="flex-1 h-full overflow-hidden flex flex-col bg-white">
        {/* 笔记编辑 */}
        <Show
          when={state().currentNote}
          fallback={
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p class="text-gray-400 text-lg">请先选择或创建一个笔记</p>
                <button
                  onClick={() => $model.createNote()}
                  class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  创建新笔记
                </button>
              </div>
            </div>
          }
        >
          <div class="border-gray-100 p-6">
            <div class="flex items-center justify-between">
              <div
                contentEditable
                class="text-2xl font-normal text-gray-800 outline-none"
                onBlur={(event) => $model.updateNoteTitle(event.currentTarget.innerText)}
              >
                {state().editTitle}
              </div>
              {/* 添加保存状态提示 */}
              <Show when={state().saveStatus.show}>
                <span class="text-sm text-green-600 ml-2 transition-opacity duration-200">已保存</span>
              </Show>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <pre
              class="min-h-[calc(100vh-120px)] px-6 pb-12 outline-none leading-relaxed text-gray-700 whitespace-pre-wrap break-words"
              contentEditable
              onMouseUp={() => $model.handleTextSelection()}
              onChange={(event) => $model.syncContent(event.currentTarget.innerHTML)}
              onBlur={(event) => $model.updateNoteContent(event.currentTarget.innerHTML)}
            >
              {state().editContent}
            </pre>
          </div>
        </Show>
      </div>
      <Show when={state().selection.isVisible}>
        <div
          class="fixed z-50 bg-white shadow-lg rounded-lg py-2 px-3 flex gap-2 transform -translate-x-1/2 transition-opacity duration-200"
          style={{
            left: `${state().selection.x}px`,
            top: `${state().selection.y}px`,
            opacity: state().selection.isVisible ? 1 : 0,
          }}
        >
          <button
            class="flex items-center px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            onClick={() => $model.polishText()}
          >
            <Show when={state().textPending}>
              <Loader class="w-4 h-4 animate-spin" />
            </Show>
            润色
          </button>
        </div>
      </Show>
      {/* 添加润色文本显示 */}
      <Show when={state().polishedText}>
        <div
          class="fixed z-40 bg-white shadow-lg rounded-lg p-4 transform -translate-x-1/2 transition-opacity duration-200 max-w-md"
          style={{
            left: `${state().selection.x}px`,
            top: `${state().selection.rect?.bottom || 0 + 10}px`,
            opacity: state().polishedText ? 1 : 0,
          }}
        >
          <h3 class="text-sm font-medium text-gray-700 mb-2">润色建议：</h3>
          <p class="text-gray-800 mb-3">{state().polishedText}</p>
          <div class="flex justify-end">
            <button
              class="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors border border-gray-200"
              onClick={() => $model.applyPolishedText()}
            >
              应用
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};
