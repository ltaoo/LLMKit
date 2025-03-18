import { ref, onMounted, Ref } from "vue";

export function useViewModel<
  T extends {
    state: any;
    ready: () => void;
    onStateChange: (handler: any) => void;
  }
>(builder: () => T): [Ref<T["state"]>, T] {
  // 创建视图模型实例
  const model = builder();

  // 使用 ref 来存储响应式状态
  const state = ref(model.state);

  // 组件挂载时设置状态变更监听并调用 ready
  model.onStateChange((v: any) => {
    // console.log("[HOOK]model.onStateChange", v)
    state.value = v;
  });
  onMounted(() => {
    model.ready();
  });

  return [state, model];
}
