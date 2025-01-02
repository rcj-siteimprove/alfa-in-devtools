import { AlfaDevTools } from "./alfa-dev-tools.js";

import * as act from "@siteimprove/alfa-act";
import * as aria from "@siteimprove/alfa-aria";
import * as dom from "@siteimprove/alfa-dom";
import * as rules from "@siteimprove/alfa-rules";
import * as web from "@siteimprove/alfa-web";
import * as sequence from "@siteimprove/alfa-sequence";
import * as style from "@siteimprove/alfa-style";

const storedPageJson = localStorage.getItem("page.json");

if (storedPageJson) {
  document.getElementById("page").value = storedPageJson;
} else {
  const response = await fetch("page.json");

  if (response.ok) {
    document.getElementById("page").value = await response.text();
  }
}

function init() {
  window.alfa = {
    act,
    aria,
    dom,
    rules,
    web,
    sequence,
    style,
  };

  window.alfaDT = new AlfaDevTools(document.getElementById("page").value);
}

init();

document.getElementById("page").addEventListener("keyup", init);
window.addEventListener("beforeunload", () => {
  localStorage.setItem("page.json", document.getElementById("page").value);
});

console.log(
  "Welcome to Alfa in DevTools! Get started by inspecting the global \`alfa\` and \`alfaDT\` instances.",
);
