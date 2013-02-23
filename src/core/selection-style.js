// Returns an IE-style attribute name from a CSS property name.
function _convertPropertyToIEAttribute(name) {
  var i = 1, ar = name.split('-'), len = ar.length;
  for (; i < len; i++) {
    ar[i] = ar[i].substring(0,1).toUpperCase() + ar[i].substring(1);
  }
  return ar.join('');
}

d3_selectionPrototype.style = function(name, value, priority) {
  var n = arguments.length;
  if (n < 3) {

    // For style(object) or style(object, string), the object specifies the
    // names and values of the attributes to set or remove. The values may be
    // functions that are evaluated for each element. The optional string
    // specifies the priority.
    if (typeof name !== "string") {
      if (n < 2) value = "";
      for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
      return this;
    }

    // For style(string), return the computed style value for the first node.
    if (n < 2) return window
        .getComputedStyle(this.node(), null)
        .getPropertyValue(name);

    // For style(string, string) or style(string, function), use the default
    // priority. The priority is ignored for style(string, null).
    priority = "";
  }

  // Otherwise, a name, value and priority are specified, and handled as below.
  return this.each(d3_selection_style(name, value, priority));
};

function d3_selection_style(name, value, priority) {

  // For style(name, null) or style(name, null, priority), remove the style
  // property with the specified name. The priority is ignored.
  function styleNull() {
    if (this.style.removeProperty) {
      this.style.removeProperty(name);
    } else {
      this.style.removeAttribute(_convertPropertyToIEAttribute(name));
    }
  }

  // For style(name, string) or style(name, string, priority), set the style
  // property with the specified name, using the specified priority.
  function styleConstant() {
    if (this.style.setProperty) {
      this.style.setProperty(name, value, priority);
    } else {
      this.style.setAttribute(_convertPropertyToIEAttribute(name), value);
    }
  }

  // For style(name, function) or style(name, function, priority), evaluate the
  // function for each element, and set or remove the style property as
  // appropriate. When setting, use the specified priority.
  function styleFunction() {
    var x = value.apply(this, arguments);
    if (x == null) {
      if (this.style.removeProperty) {
        this.style.removeProperty(name);
      } else {
        this.style.removeAttribute(_convertPropertyToIEAttribute(name));
      }
    } else {
      if (this.style.setProperty) {
        this.style.setProperty(name, x, priority);
      } else {
        this.style.setAttribute(_convertPropertyToIEAttribute(name), x, priority);
      }
    }
  }

  return value == null
      ? styleNull : (typeof value === "function"
      ? styleFunction : styleConstant);
}
