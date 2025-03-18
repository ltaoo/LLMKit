import React, { useEffect, useState } from "react";
import { File, FileQuestion } from "lucide-react";

import { DragZoneCore } from "@/domains/ui/drag-zone";
import { readFileAsText } from "@/utils/browser";

export function DragZonePreview(
  props: { store: DragZoneCore } & React.HTMLAttributes<HTMLDivElement>
) {
  const { store } = props;

  //   const [state, setState] = useState(store.state);
  const [error, setError] = useState<Error | null>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState(store.files);

  useEffect(() => {
    //     store.onStateChange((v) => setState(v));
    store.onChange(async (v) => {
      setError(null);
      setFiles(v);
      const file = v[0];
      if (!file) {
        return;
      }
      if (file.type === "application/json") {
        const r = await readFileAsText(file);
        if (r.error) {
          setError(new Error(r.error.message));
          return;
        }
        setText(r.data);
        return;
      }
    });
    store.onError((err) => {
      setError(err);
    });
  }, []);

  return (
    <div className="h-full">
      {(() => {
        if (error) {
          return (
            <div className="flex items-center justify-center h-full">
              <div>
                <FileQuestion className="w-12 h-12" />
                <div className="mt-2 text-sm">{error.message}</div>
              </div>
            </div>
          );
        }
        if (files.length === 0) {
          return null;
        }
        if (text) {
          return <div className="p-1 bg-slate-100 h-full overflow-y-auto break-all">{text}</div>;
        }
        return (
          <div className="flex items-center justify-center h-full">
            <File className="w-12 h-12" />
          </div>
        );
      })()}
    </div>
  );
}
