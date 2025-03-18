import { BaseDomain } from "@/domains/base";

enum Events {
  Change,
}
type TheTypesOfEvents = { [Events.Change]: void };
type SelectContentProps = {
  $node: () => HTMLElement;
  getStyles: () => CSSStyleDeclaration;
  getRect: () => DOMRect;
};
export class SelectContentCore extends BaseDomain<TheTypesOfEvents> {
  constructor(
    props: Partial<{
      unique_id: string;
    }> &
      Partial<SelectContentProps> = {}
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
}
