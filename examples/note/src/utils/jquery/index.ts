export const $ = {
  extend(...args: any[]): any {
    let target = args[0] || {};
    let length = args.length;
    let deep = false;
    let i = 1;

    // 处理深拷贝的情况
    if (typeof target === "boolean") {
      deep = target;
      target = args[i] || {};
      i++;
    }

    // 确保 target 是对象
    if (typeof target !== "object" && typeof target !== "function") {
      target = {};
    }

    // 遍历所有源对象
    for (; i < length; i++) {
      let source = args[i];

      if (source != null) {
        // 遍历源对象的所有属性
        for (let key in source) {
          let value = source[key];
          let targetValue = target[key];

          // 深拷贝对象或数组
          if (deep && value && (typeof value === "object" || Array.isArray(value))) {
            let clone;

            if (Array.isArray(value)) {
              clone = targetValue && Array.isArray(targetValue) ? targetValue : [];
            } else {
              clone = targetValue && typeof targetValue === "object" ? targetValue : {};
            }

            target[key] = $.extend(deep, clone, value);
          } else if (value !== undefined) {
            // 浅拷贝直接赋值
            target[key] = value;
          }
        }
      }
    }

    return target;
  },
  inArray(value: any, array: any[]): number {
    return Array.prototype.indexOf.call(array, value);
  },
};
