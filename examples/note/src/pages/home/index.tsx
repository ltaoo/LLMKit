/**
 * @file 首页
 */
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { listen } from "@tauri-apps/api/event";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { nord } from "@milkdown/theme-nord";
// import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/solid";

import { ViewComponent, ViewComponentProps } from "@/store/types";
import { llm } from "@/store/llm";
import { agents } from "@/store/agents";
import { base, Handler } from "@/domains/base";
import { useViewModel } from "@/hooks";

import "@milkdown/theme-nord/style.css";

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
  let _editor: Editor | null = null;
  let _editContent = "";
  let _isEditing = false;

  const services = {
    // 加载笔记列表
    async loadNotes() {
      // TODO: 从后端加载笔记列表
      const mockNotes: Note[] = [
        {
          id: "1",
          title: "第一篇笔记",
          content: `# Milkdown Vanilla Commonmark

> You're scared of a world where you're needed.

This is a demo for using Milkdown with **Vanilla Typescript**.`,
          createdAt: Date.now(),
        },
        {
          id: "2",
          title: "第二篇笔记",
          content: "这是第二篇笔记的内容",
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
      if (!_editor !== null) {
        _editor?.destroy();
      }
      _editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, "#editor");
          ctx.set(defaultValueCtx, note.content);
        })
        .config(nord)
        .use(commonmark)
        .create();
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
  };
}

export const HomeIndexPage: ViewComponent = (props) => {
  const [state, $model] = useViewModel(HomeIndexViewModel, [props]);

  onMount(() => {
    $model.ready();
  });
  onCleanup(() => {});

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
              onClick={() => $model.startEdit()}
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              编辑
            </button>
          </Show>
        </div>

        {/* 使用新的内容区域组件 */}
        <div class="flex-1 overflow-y-auto p-6">
          <div class="relative">
            {/* 选中文本时显示的工具栏 */}
            <Show when={state().selectedText}>
              <div class="absolute top-0 left-0 bg-white shadow-lg rounded-lg p-2 flex gap-2">
                <button
                  class="p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    // 添加粗体
                    const selection = window.getSelection();
                    if (selection) {
                      const range = selection.getRangeAt(0);
                      const text = range.toString();
                      const newText = `**${text}**`;
                    }
                  }}
                >
                  <span class="font-bold">B</span>
                </button>
                <button
                  class="p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    // 添加斜体
                    const selection = window.getSelection();
                    if (selection) {
                      const range = selection.getRangeAt(0);
                      const text = range.toString();
                      const newText = `*${text}*`;
                      // 更新编辑器内容
                    }
                  }}
                >
                  <span class="italic">I</span>
                </button>
                {/* 可以添加更多格式化按钮 */}
              </div>
            </Show>

            {/* Markdown 编辑器 */}
            <div id="editor"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
