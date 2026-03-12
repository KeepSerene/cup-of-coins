/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

/**
 * Counter functionality
 */
const $decrementBtn = document.querySelector("[data-decrement-btn]");
const $counterValField = document.querySelector("[data-counter-val-field]");
const $incrementBtn = document.querySelector("[data-increment-btn]");
const $totalContributionSpan = document.querySelector(
  "[data-total-contribution-span]",
);

const MIN_CONTRIBUTION = 1;
const MAX_CONTRIBUTION = 999;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const setCounterValue = (val) => {
  $counterValField.value = val;
  $totalContributionSpan.textContent = val;
};

// Decrement contribution functionality
$decrementBtn.addEventListener("click", function () {
  const currentVal = Number($counterValField.value);

  if (currentVal > MIN_CONTRIBUTION) {
    setCounterValue(currentVal - 1);
  }
});

// Increment contribution functionality
$incrementBtn.addEventListener("click", function () {
  const currentVal = Number($counterValField.value);

  if (currentVal < MAX_CONTRIBUTION) {
    setCounterValue(currentVal + 1);
  }
});

// Enter contribution functionality
$counterValField.addEventListener("input", function () {
  // Strip any non-digit characters (e.g. 'e', '+', '-', '.')
  // that browsers allow into number inputs
  const sanitized = this.value.replace(/\D/g, "");
  this.value = sanitized;

  const val = Number(sanitized);

  // Hard-cap at max while typing so the field can never hold an invalid value.
  // We don't clamp at min here — the user may be mid-typing (e.g. typing "15"
  // passes through "1" first, which is valid), so min is enforced on blur.
  if (val > MAX_CONTRIBUTION) {
    setCounterValue(MAX_CONTRIBUTION);

    return;
  }

  // Guard against the field being completely empty (e.g. the user selects all
  // and deletes). In that state, sanitized is "" and Number("") is 0,
  // which would flash "Contribute $0" on the submit button — an invalid and
  // confusing state. By checking the truthiness of the sanitized string, we
  // skip the span update entirely when the field is empty — the span holds whatever
  // value it showed last, and let the blur handler restore the value to MIN_CONTRIBUTION
  // once the user leaves the field.
  if (sanitized) {
    $totalContributionSpan.textContent = val;
  }
});

// Clamp to min when the user leaves the field empty or below the minimum
$counterValField.addEventListener("blur", function () {
  const val = Number(this.value);
  setCounterValue(
    clamp(val || MIN_CONTRIBUTION, MIN_CONTRIBUTION, MAX_CONTRIBUTION),
  );
});

/**
 * Dynamic copyright year
 */
document.querySelector("[data-copyright-year]").textContent =
  new Date().getFullYear();

/**
 * Submit contribute form
 */
const $contributeForm = document.querySelector("[data-contribute-form]");
const $submitBtn = $contributeForm.querySelector("[data-submit-btn]");

$contributeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    $submitBtn.setAttribute("disabled", "");
    const $formFields = $contributeForm.querySelectorAll("[data-form-field]");
    const formData = {};

    $formFields.forEach((field) => {
      formData[field.getAttribute("name")] = field.value.trim();
    });

    const response = await fetch("/checkout", {
      method: "POST",
      body: new URLSearchParams(formData).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      $contributeForm.reset();
      console.log(responseData);
    } else {
      console.error("Error in checkout route response:", response.statusText);
    }
  } catch (error) {
    console.error("Error submitting contribute form:", error);

    throw error;
  } finally {
    $submitBtn.removeAttribute("disabled");
  }
});
