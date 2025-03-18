import { FormCore, InputCore, SelectCore } from "@/domains/ui";
import { FormFieldCore } from "@/domains/ui/form/field";
import { SwitchCore } from "@/domains/ui/switch";
import { SliderCore } from "@/domains/ui/slider";
import { CardImageShape } from "@/biz/sponsors";
import { cn } from "@/utils";

import { Input } from "./ui/input";
import { Switch, SwitchLabel } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Select } from "./ui/select";

export function SectionForm(props: {
  store: FormCore<{
    title: FormFieldCore<InputCore<string>>;
    num: FormFieldCore<SliderCore>;
    gutter: FormFieldCore<SliderCore>;
    width: FormFieldCore<SliderCore>;
    enableWidth: FormFieldCore<SwitchCore>;
    shape: FormFieldCore<SelectCore<CardImageShape>>;
    showText: FormFieldCore<SwitchCore>;
  }>;
}) {
  const { store } = props;

  const fieldCx = "flex items-center";
  const labelCx = "w-[68px] text-[14px] color-[#59636e]";
  const inputCx = "flex-1";

  return (
    <div className="space-y-4">
      <div className={fieldCx}>
        <label className={labelCx}>{store.fields.title.label}</label>
        <div className={inputCx}>
          <Input store={store.fields.title.$input} />
        </div>
      </div>
      <div className={fieldCx}>
        <label className={labelCx}>{store.fields.shape.label}</label>
        <div className={inputCx}>
          <Select store={store.fields.shape.$input} />
        </div>
      </div>
      <div className={fieldCx}>
        <label className={labelCx}>{store.fields.num.label}</label>
        <div className={inputCx}>
          <Slider store={store.fields.num.$input} />
        </div>
      </div>
      <div className={fieldCx}>
        <label className={labelCx}>{store.fields.gutter.label}</label>
        <div className={inputCx}>
          <Slider store={store.fields.gutter.$input} />
        </div>
      </div>
      <div className={fieldCx}>
        <label className={labelCx}>{store.fields.width.label}</label>
        <div className={cn(inputCx, "flex items-center")}>
          <div className="w-full">
            <Slider store={store.fields.width.$input} />
          </div>
          <div className="ml-4">
            <Switch store={store.fields.enableWidth.$input}></Switch>
          </div>
        </div>
      </div>
      <div className={fieldCx}>
        <label className={labelCx}></label>
        <div className={cn(inputCx, "flex items-center")}>
          <Switch store={store.fields.showText.$input} />
          <SwitchLabel className="ml-2" store={store.fields.showText.$input} />
        </div>
      </div>
    </div>
  );
}
