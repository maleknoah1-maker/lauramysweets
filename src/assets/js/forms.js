// Forms: Formspree submit, conditional fields, Quick Order dates and pricing. No dependencies.
(function () {
  "use strict";

  var TZ = "America/New_York";

  // Today's date and time in Eastern time, whatever the visitor's device is set to.
  function easternNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return { y: +parts.year, m: +parts.month, d: +parts.day, minutes: +parts.hour * 60 + +parts.minute };
  }
  function iso(y, m, d) {
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toISOString().slice(0, 10);
  }
  function addDays(isoDate, n) {
    var dt = new Date(isoDate + "T00:00:00Z");
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt.toISOString().slice(0, 10);
  }
  function pretty(isoDate) {
    return new Date(isoDate + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  }
  function readJson(id) {
    var el = document.getElementById(id);
    try { return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; }
  }

  var booking = readJson("booking-data") || { blockouts: [] };
  function blockedBy(isoDate) {
    for (var i = 0; i < booking.blockouts.length; i++) {
      var b = booking.blockouts[i];
      if (b.start && isoDate >= b.start && isoDate <= (b.end || b.start)) return b;
    }
    return null;
  }

  // Date fields: a minimum date, plus blockout dates rejected with a clear message.
  function setupDate(input, earliest, tooSoonMsg) {
    if (!input) return;
    input.min = earliest;
    function check() {
      var v = input.value, msg = "";
      if (v && v < earliest) msg = tooSoonMsg(earliest);
      else if (v && blockedBy(v)) msg = "Sorry, " + pretty(v) + " is unavailable" + (blockedBy(v).note ? " (" + blockedBy(v).note + ")" : "") + ". Please pick another date.";
      input.setCustomValidity(msg);
      showError(input, msg);
    }
    input.addEventListener("change", check);
    input.addEventListener("input", check);
  }

  function showError(input, msg) {
    var field = input.closest(".field") || input.parentNode;
    var err = field.querySelector(".error");
    if (!err) { err = document.createElement("span"); err.className = "error"; err.id = (input.id || input.name) + "-error"; field.appendChild(err); }
    err.textContent = msg || "";
    if (msg) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-errormessage", err.id); }
    else { input.removeAttribute("aria-invalid"); input.removeAttribute("aria-errormessage"); }
  }

  // Show/hide groups based on another field's value: data-show-when="fieldName=value"
  function setupConditionals(form) {
    form.querySelectorAll("[data-show-when]").forEach(function (group) {
      var rule = group.getAttribute("data-show-when").split("=");
      var name = rule[0], value = rule[1];
      function update() {
        var checked = form.querySelector('[name="' + name + '"]:checked');
        var current = checked ? checked.value : (form.elements[name] && form.elements[name].value);
        var on = current === value;
        group.hidden = !on;
        group.querySelectorAll("input, select, textarea").forEach(function (el) {
          el.disabled = !on;
          if (el.hasAttribute("data-required-when-shown")) el.required = on;
        });
      }
      form.querySelectorAll('[name="' + name + '"]').forEach(function (el) { el.addEventListener("change", update); });
      update();
    });
  }

  function setupSubmit(form) {
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.removeAttribute("data-state");

      // Validate, then move focus to the first problem.
      var firstBad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (el.disabled || el.name === "_gotcha" || el.type === "hidden") return;
        var ok = el.checkValidity();
        showError(el, ok ? "" : (el.validationMessage || "Please fill this in."));
        if (!ok && !firstBad) firstBad = el;
      });
      form.querySelectorAll("[data-require-one]").forEach(function (group) {
        var any = group.querySelector("input:checked");
        var msgEl = group.querySelector(".error") || group.appendChild(Object.assign(document.createElement("span"), { className: "error" }));
        msgEl.textContent = any ? "" : group.getAttribute("data-require-one");
        if (!any && !firstBad) firstBad = group.querySelector("input");
      });
      if (firstBad) { firstBad.focus(); return; }

      if (form.hasAttribute("data-unconfigured")) {
        status.setAttribute("data-state", "error");
        status.textContent = "This form isn't connected yet. Please text or call (484) 293-1329 for now.";
        return;
      }

      button.disabled = true;
      var label = button.textContent;
      button.textContent = "Sending...";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("bad response");
          if (typeof window.gtag === "function") window.gtag("event", "form_submit", { form_name: form.getAttribute("data-form") });
          var redirect = form.getAttribute("data-redirect");
          if (redirect) { window.location.href = redirect; return; }
          form.reset();
          status.setAttribute("data-state", "ok");
          status.textContent = "Thank you! You're on the list.";
        })
        .catch(function () {
          status.setAttribute("data-state", "error");
          status.textContent = "Something went wrong sending the form. Please try again, or text or call (484) 293-1329.";
        })
        .then(function () { button.disabled = false; button.textContent = label; });
    });
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    setupConditionals(form);
    setupSubmit(form);
  });

  // Custom order: any date from today, minus blockouts.
  var now = easternNow();
  var today = iso(now.y, now.m, now.d);
  setupDate(document.getElementById("f-event_date"), today, function () { return "Please pick a date in the future."; });

  // Quick Order
  var qo = readJson("qo-data");
  var qoForm = document.querySelector('form[data-form="Quick Order"]');
  if (qo && qoForm) {
    var cutoffParts = qo.cutoffTime.split(":");
    var cutoffMinutes = +cutoffParts[0] * 60 + +(cutoffParts[1] || 0);
    var earliest = addDays(today, qo.noticeDays + (now.minutes >= cutoffMinutes ? 1 : 0));
    var dateInput = document.getElementById("f-pickup_date");
    setupDate(dateInput, earliest, function (e) { return "Quick Order cakes need " + qo.noticeDays + " days' notice. The earliest pickup is " + pretty(e) + "."; });
    var earliestEl = document.querySelector("[data-earliest]");
    if (earliestEl) earliestEl.textContent = pretty(earliest);

    var designSel = qoForm.elements.design;
    var flavorGroup = qoForm.querySelector("[data-qo-flavor]");
    var flavorSel = qoForm.elements.cake_flavor;
    var fillingGroup = qoForm.querySelector("[data-qo-filling]");
    var colorGroup = qoForm.querySelector("[data-qo-colors]");
    var colorLabel = colorGroup && colorGroup.querySelector("label");
    var totalEl = qoForm.querySelector("[data-total]");
    var totalInput = qoForm.elements.estimated_total;

    function design() { return qo.designs.filter(function (d) { return d.name === designSel.value; })[0]; }
    function toggle(group, on) {
      if (!group) return;
      group.hidden = !on;
      group.querySelectorAll("select, input").forEach(function (el) { el.disabled = !on; el.required = on && el.hasAttribute("data-required-when-shown"); });
    }
    function update() {
      var d = design();
      toggle(flavorGroup, !!(d && d.flavorChoice && d.flavorChoice.length));
      if (d && d.flavorChoice && d.flavorChoice.length) {
        flavorSel.innerHTML = '<option value="">Choose a flavor</option>' + d.flavorChoice.map(function (f) { return '<option>' + f + '</option>'; }).join("");
      }
      toggle(fillingGroup, !!(d && d.fillingChoice));
      toggle(colorGroup, !!(d && d.accentColors > 0));
      if (d && colorLabel) colorLabel.textContent = d.name.indexOf("Ombre") > -1 ? "Ombre color" : (d.accentColors > 1 ? "Accent colors (up to " + d.accentColors + ")" : "Accent color");
      var size = qoForm.querySelector('[name="size"]:checked');
      var total = 0;
      if (d && size) total = size.value === qo.sizes[0].label ? d.price6 : d.price8;
      if (total && qoForm.elements.topper.checked) total += qo.topper.price;
      totalEl.textContent = total ? "$" + total : "Choose a design and size";
      totalInput.value = total ? "$" + total : "";
    }
    qoForm.addEventListener("change", update);
    update();

    // "Order this design" buttons on the design cards
    document.querySelectorAll("[data-pick-design]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        designSel.value = btn.getAttribute("data-pick-design");
        update();
        document.getElementById("order-form").scrollIntoView({ behavior: "smooth", block: "start" });
        designSel.focus({ preventScroll: true });
      });
    });
  }
})();
