import { FormCore, InputCore, SelectCore } from "@/domains/ui";
import { FormFieldCore } from "@/domains/ui/form/field";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";

import { Input } from "./ui/input";
import { ImageUpload } from "./ui/image-upload";
import { Select } from "./ui/select";

export function SponsorForm(props: {
  store: FormCore<{
    text: FormFieldCore<InputCore<string>>;
    image: FormFieldCore<ImageUploadCore>;
    href: FormFieldCore<InputCore<string>>;
    from: FormFieldCore<SelectCore<string>>;
  }>;
}) {
  const { store } = props;

  const fieldCx = "flex items-center";
  const labelCx = "w-[68px] text-[14px] color-[#59636e]";
  const inputCx = "ml-1";

  return (
    <div className="flex">
      <div className="flex-1 ml-4 space-y-2">
        <div className={fieldCx}>
          <label className={labelCx}>{store.fields.text.label}</label>
          <div className={inputCx}>
            <Input store={store.fields.text.$input} />
          </div>
        </div>
        <div className={fieldCx}>
          <label className={labelCx}>{store.fields.href.label}</label>
          <div className={inputCx}>
            <Input store={store.fields.href.$input} />
          </div>
        </div>
        <div className={fieldCx}>
          <label className={labelCx}>{store.fields.from.label}</label>
          <div className={inputCx}>
            <Select store={store.fields.from.$input} />
          </div>
        </div>
      </div>
      <ImageUpload
        className="relative w-[98px] h-[98px]"
        store={store.fields.image.$input}
      />
    </div>
  );
}
