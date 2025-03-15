/**
 * @file 首页
 */
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { listen } from "@tauri-apps/api/event";

import { ViewComponent, ViewComponentProps } from "@/store/types";
import { llm } from "@/store/llm";
import { agent_store } from "@/store/agents";
import { base, Handler } from "@/domains/base";
import { useViewModel } from "@/hooks";

import "@milkdown/theme-nord/style.css";
import { ChatBoxPayloadType } from "@llm/libs/chatbox";

// 定义笔记类型
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}
// Editor.make().config(nord).use(commonmark).create();
function HomeIndexViewModel(props: ViewComponentProps) {
  // const [notes, setNotes] = createSignal<Note[]>([]);
  // const [currentNote, setCurrentNote] = createSignal<Note | null>(null);
  // const [isEditing, setIsEditing] = createSignal(false);
  let _notes: Note[] = [];
  let _currentNote: Note | null = null;
  let _editContent = "";
  let _isEditing = false;
  // 添加选择文本相关的状态
  let _selection = {
    text: "",
    isVisible: false,
    x: 0,
    y: 0,
    range: null as Range | null,
    rect: null as DOMRect | null,
    start: 0,
    end: 0
  };
  let _polishedText = "";

  const services = {
    // 加载笔记列表
    async loadNotes() {
      const mockNotes: Note[] = [
        {
          id: "1",
          title: "第一篇笔记",
          content: `# Milkdown Vanilla Commonmark

\n
> You're scared of a world where you're needed.

This is a demo for using Milkdown with **Vanilla Typescript**.`,
          createdAt: Date.now(),
        },
        {
          id: "2",
          title: "第二篇笔记",
          content: "天上的云朵很美",
          createdAt: Date.now(),
        },
      ];
      _notes = mockNotes;
      bus.emit(Events.StateChange, { ..._state });
    },

    // 选择笔记
    async selectNote(note: Note) {
      _currentNote = note;
      _isEditing = false;
      _editContent = note.content;
      // const editor = await Editor.make()
      //   .config((ctx) => {
      //     ctx.set(rootCtx, "#editor");
      //     ctx.set(defaultValueCtx, note.content);
      //   })
      //   .config(nord)
      //   .use(commonmark)
      //   .create();
      // _editor = editor;
      // editor.action((ctx) => {
      //   const editorView = ctx.get(editorViewCtx);
      //   let selection = editorView.state.tr.selection;
      //   console.log(selection);
      //   // ctx.updateView(ViewUpdate.Focus);
      // });
      bus.emit(Events.StateChange, { ..._state });
    },

    // 更新笔记
    async updateNote(noteId: string, content: string) {
      // TODO: 调用后端 API 更新笔记
      const updatedNotes = _notes.map((note) => (note.id === noteId ? { ...note, content } : note));
      _notes = updatedNotes;
      _isEditing = false;
      bus.emit(Events.StateChange, { ..._state });
    },
  };

  const _state = {
    get notes() {
      return _notes;
    },
    get currentNote() {
      return _currentNote;
    },
    get editContent() {
      return _editContent;
    },
    get isEditing() {
      return _isEditing;
    },
    get selectedText() {
      return window.getSelection()?.toString() || "";
    },
    get selection() {
      return _selection;
    },
    get polishedText() {
      return _polishedText;
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
    ui: {},
    services,
    async ready() {
      console.log("[PAGE]ready");
      await services.loadNotes();
    },
    startEdit() {
      _editContent = _currentNote?.content || "";
      _isEditing = true;
      bus.emit(Events.StateChange, { ..._state });
      // if (!_editor) {
      //   return;
      // }
      // const v = _editor.ctx.get(editorViewCtx);
      // console.log(v.state);
    },
    cancelEdit() {
      _isEditing = false;
      bus.emit(Events.StateChange, { ..._state });
    },
    saveNote() {
      services.updateNote(_currentNote!.id, _editContent);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    // 添加文本选择处理方法
    handleTextSelection() {
      const selection = window.getSelection();
      const text = selection?.toString() || "";

      if (text) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          // 获取选中文本的起始和结束位置
          const container = range?.startContainer.parentElement;
          if (container) {
            const textContent = container.textContent || "";
            const start = textContent.indexOf(text);
            const end = start + text.length;

            _selection = {
              text,
              isVisible: true,
              x: rect.left + rect.width / 2,
              y: rect.top - 40,
              range: range ?? null,
              rect,
              start,
              end
            };
          }
        }
      } else {
        _selection = {
          text: "",
          isVisible: false,
          x: 0,
          y: 0,
          range: null,
          rect: null,
          start: 0,
          end: 0
        };
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
      const r = await agent.request(_selection.text);
      if (r.error) {
        console.error("[PAGE]index - polishText - error", r.error);
        return;
      }
      const payload = r.data;
      console.log("[PAGE]index - polishText", payload);
      if (payload.type === ChatBoxPayloadType.Text) {
        _polishedText = payload.text;
        _selection.isVisible = false;
        bus.emit(Events.StateChange, { ..._state });
      }
      console.log("[PAGE]polishText", r.data);
    },
    applyPolishedText() {
      if (_selection.start >= 0 && _selection.end > _selection.start) {
        const before = _editContent.substring(0, _selection.start);
        const after = _editContent.substring(_selection.end);
        _editContent = before + _polishedText + after;
        
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
  };
}

export const HomeIndexPage: ViewComponent = (props) => {
  const [state, $model] = useViewModel(HomeIndexViewModel, [props]);

  return (
    <div class="w-full h-screen flex bg-gray-50">
      {/* 左侧笔记列表 */}
      <div class="w-80 h-full border-r border-gray-200 bg-white overflow-y-auto">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800">我的笔记</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <For each={state().notes}>
            {(note) => (
              <div
                class={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  state().currentNote?.id === note.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
                onClick={() => $model.services.selectNote(note)}
              >
                <h3 class="font-medium text-gray-900 mb-1">{note.title}</h3>
                <p class="text-sm text-gray-500 truncate">{new Date(note.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div class="flex-1 h-full overflow-hidden flex flex-col">
        {/* 顶部操作栏 */}
        <div class="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-white">
          <h1 class="text-xl font-semibold text-gray-900">{state().currentNote?.title}</h1>
          <Show
            when={!state().isEditing}
            fallback={
              <div class="space-x-3">
                <button
                  onClick={() => $model.cancelEdit()}
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  onClick={() => state().currentNote && $model.saveNote()}
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  保存
                </button>
              </div>
            }
          >
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => $model.startEdit()}
            >
              编辑
            </button>
          </Show>
        </div>

        {/* 使用新的内容区域组件 */}
        <div class="flex-1 overflow-y-auto p-6">
          <div
            class="relative outline-none"
            contentEditable
            onMouseUp={() => $model.handleTextSelection()}
            onKeyUp={() => $model.handleTextSelection()}
          >
            {state().editContent}
          </div>

          {/* 修改选择文本后的工具栏 */}
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
                class="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                onClick={() => $model.polishText()}
              >
                润色
              </button>
              <button
                class="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                onClick={() => $model.checkText()}
              >
                查错
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
              <p class="text-gray-800">{state().polishedText}</p>
              <button
                class="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                onClick={() => $model.applyPolishedText()}
              >
                应用
              </button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
