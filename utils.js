import { Outcome } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Rules } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";
import { Style } from "@siteimprove/alfa-style";

let _page;
export function page() {
  if (!_page) {
    _page = Page.from(
      JSON.parse(document.getElementById("page").value),
    ).getUnsafe();
  }

  return _page;
}

export function audit(rule) {
  return Rules.get(rule).getUnsafe().evaluate(page());
}

export async function summarize(rule) {
  const result = await audit(rule);

  const cantTell = result.filter(Outcome.isCantTell);
  const passed = result.filter(Outcome.isPassed);
  const failed = result.filter(Outcome.isFailed);

  console.log(
    `cantTell: ${cantTell.length}, passed: ${passed.length}, failed: ${failed.length}`,
  );
}

export function getElements() {
  return page().document.descendants().filter(Element.isElement);
}

export function getElementById(id) {
  return page()
    .document.descendants()
    .filter(Element.isElement)
    .find((element) => element.id.includes(id));
}

export function getElementsByClassName(className) {
  return page()
    .document.descendants()
    .filter(Element.isElement)
    .filter((element) => element.classes.includes(className));
}

export function getElementsByTagName(tagName) {
  return page()
    .document.descendants()
    .filter(Element.isElement)
    .filter(Element.hasName(tagName));
}

export function getElementsByText(str) {
  return page()
    .document.descendants()
    .filter(Text.isText)
    .filter((text) => text.data.includes(str))
    .map((text) => text.parent().getUnsafe())
    .filter(Element.isElement);
}

export function getComputedStyle(element, property) {
  return Style.from(element, page().device).computed(property);
}

export function getAriaNode(element) {
  return Node.from(element, page().device);
}

export function createDomElement(element) {
  const domElement = document.createElement(element.name);

  for (let attr of element.attributes) {
    domElement.setAttribute(attr.name, attr.value);
  }

  for (let child of element.children()) {
    if (Text.isText(child)) {
      domElement.append(child.data);
    } else {
      domElement.append(createDomElement(child));
    }
  }

  return domElement;
}
