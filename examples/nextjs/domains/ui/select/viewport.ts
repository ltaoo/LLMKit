import { BaseDomain } from "@/domains/base";

enum Events {
  Change,
}
type TheTypesOfEvents = { [Events.Change]: void };
export class SelectViewportCore extends BaseDomain<TheTypesOfEvents> {
  constructor(
    props: Partial<{
      unique_id: string;
      $node: () => HTMLElement;
      getStyles: () => CSSStyleDeclaration;
      getRect: () => DOMRect;
    }> = {}
  ) {
    super(props);
    const { $node, getStyles, getRect } = props;
    if ($node) {
      this.$node = $node;
    }
    if (getRect) {
      this.getRect = getRect;
    }
    if (getStyles) {
      this.getStyles = getStyles;
    }
  }
  $node(): HTMLElement | null {
    return null;
  }
  getRect() {
    return {} as DOMRect;
  }
  getStyles() {
    return {} as CSSStyleDeclaration;
  }
  get clientHeight() {
    return this.$node()?.clientHeight ?? 0;
  }
  get scrollHeight() {
    return this.$node()?.scrollHeight ?? 0;
  }
  get offsetTop() {
    return this.$node()?.offsetTop ?? 0;
  }
  get offsetHeight() {
    return this.$node()?.offsetHeight ?? 0;
  }
}
