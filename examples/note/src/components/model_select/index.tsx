import { createSignal, onMount } from "solid-js";

import { Input } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { ModelSelectCore } from "@/biz/model_select";

// 定义模型配置接口
interface ModelProvider {
  id: string;
  name: string;
  models: Model[];
  apiKeyPlaceholder?: string;
}

interface Model {
  id: string;
  name: string;
}

interface ModelSelectProps {
  //   onConfigChange: (config: { provider: string; model: string; apiKey: string }) => void;
  store: ModelSelectCore;
}

function ModelSelect(props: ModelSelectProps) {
  const [state, setState] = createSignal(props.store.state);
  //   const [selectedProvider, setSelectedProvider] = useState<string>("");
  //   const [selectedModel, setSelectedModel] = useState<string>("");
  //   const [apiKey, setApiKey] = useState<string>("");

  // 从 JSON 文件加载模型提供商数据
  onMount(() => {
    const loadProviders = async () => {
      try {
        const response = await fetch("/model-providers.json");
        const data = await response.json();
        props.store.methods.setProviders(data);
      } catch (error) {
        console.error("加载模型提供商数据失败:", error);
      }
    };
    loadProviders();
  });

  // 获取当前选中提供商的模型列表
  //   const getCurrentProviderModels = () => {
  //     const provider = providers.find((p) => p.id === selectedProvider);
  //     return provider?.models || [];
  //   };

  return <div></div>;
}

export default ModelSelect;
