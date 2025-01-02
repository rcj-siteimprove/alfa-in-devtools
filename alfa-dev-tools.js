import { Outcome } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Rules } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";
import { Style } from "@siteimprove/alfa-style";

export class AlfaDevTools {
  constructor(pageJson) {
    this.page = Page.from(JSON.parse(pageJson)).getUnsafe();
  }

  async audit(rule) {
    return await Rules.get(rule).getUnsafe().evaluate(this.page);
  }

  summarize(rule) {
    this.audit(rule).then((result) => {
      const cantTell = result.filter(Outcome.isCantTell);
      const passed = result.filter(Outcome.isPassed);
      const failed = result.filter(Outcome.isFailed);

      console.log(
        `cantTell: ${cantTell.length}, passed: ${passed.length}, failed: ${failed.length}`,
      );
    });
  }

  getElements() {
    return this.page.document.descendants().filter(Element.isElement);
  }

  getElementById(id) {
    return this.page.document
      .descendants()
      .filter(Element.isElement)
      .find((element) => element.id.includes(id));
  }

  getElementsByClassName(className) {
    return this.page.document
      .descendants()
      .filter(Element.isElement)
      .filter((element) => element.classes.includes(className));
  }

  getElementsByTagName(tagName) {
    return this.page.document
      .descendants()
      .filter(Element.isElement)
      .filter(Element.hasName(tagName));
  }

  getElementsByText(str) {
    return this.page.document
      .descendants()
      .filter(Text.isText)
      .filter((text) => text.data.includes(str))
      .map((text) => text.parent().getUnsafe())
      .filter(Element.isElement);
  }

  getComputedStyle(element, property) {
    return Style.from(element, this.page.device).computed(property);
  }

  getAriaNode(element) {
    return Node.from(element, this.page.device);
  }

  createDomElement(element) {
    const domElement = document.createElement(element.name);

    for (let attr of element.attributes) {
      domElement.setAttribute(attr.name, attr.value);
    }

    for (let child of element.children()) {
      if (Text.isText(child)) {
        domElement.append(child.data);
      } else {
        domElement.append(this.createDomElement(child));
      }
    }

    return domElement;
  }
}
