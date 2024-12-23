import { Outcome } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Rules } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";
import { Style } from "@siteimprove/alfa-style";

class AlfaDevTools {
  constructor(pageJson) {
    this.page = Page.from(JSON.parse(pageJson)).getUnsafe();
  }

  isFailed = Outcome.isFailed;
  isPassed = Outcome.isPassed;
  isCantTell = Outcome.isCantTell;
  isElement = Element.isElement;
  isText = Text.isText;
  hasName = Element.hasName;
  isVisible = Style.isVisible;

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
      .find((element) => element.id.includes(id))
      .getOr(undefined);
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

const storedPageJson = localStorage.getItem("page.json");

if (storedPageJson) {
  document.getElementById("page").value = storedPageJson;
} else {
  const response = await fetch("page.json");

  if (response.ok) {
    document.getElementById("page").value = await response.text();
  }
}

function setGlobalAlfa() {
  window.alfa = {};

  window.alfa = new AlfaDevTools(document.getElementById("page").value);
}

setGlobalAlfa();

document.getElementById("page").addEventListener("keyup", setGlobalAlfa);
window.addEventListener("beforeunload", () => {
  localStorage.setItem("page.json", document.getElementById("page").value);
});

console.log(
  "Welcome to Alfa in DevTools! Get started by inspecting the global \`alfa\` instance.",
);
