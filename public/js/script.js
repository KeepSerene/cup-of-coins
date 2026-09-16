/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

/**
 * Counter functionality
 */
const $decrementBtn = document.querySelector("[data-decrement-btn]");
const $amountField = document.querySelector("[data-counter-val-field]");
const $incrementBtn = document.querySelector("[data-increment-btn]");
const $totalContributionSpan = document.querySelector(
  "[data-total-contribution-span]",
);

const MIN_CONTRIBUTION = 1;
const MAX_CONTRIBUTION = 999;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Standard names (e.g., John O'Brian, Mary-Jane) OR an X handle (e.g., @XHandle_123)
const NAME_REGEX = /^([a-zA-Z\s\-']+|@[a-zA-Z0-9_]{1,15})$/;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Function to check and update counter button state
const updateCounterButtonState = (amountStr) => {
  // If the field is completely cleared
  if (!amountStr) {
    $decrementBtn.disabled = true;
    $incrementBtn.disabled = true;
    return;
  }

  const val = Number(amountStr);
  $decrementBtn.disabled = val <= MIN_CONTRIBUTION;
  $incrementBtn.disabled = val >= MAX_CONTRIBUTION;
};

const setAmount = (amount) => {
  $amountField.value = amount;
  $totalContributionSpan.textContent = amount;
  updateCounterButtonState(String(amount));
};

// Initialize counter button state on load
updateCounterButtonState($amountField.value);

// Decrement contribution functionality
$decrementBtn.addEventListener("click", function () {
  const currentAmount = Number($amountField.value);

  if (currentAmount > MIN_CONTRIBUTION) {
    setAmount(currentAmount - 1);
  }
});

// Increment contribution functionality
$incrementBtn.addEventListener("click", function () {
  const currentAmount = Number($amountField.value);

  if (currentAmount < MAX_CONTRIBUTION) {
    setAmount(currentAmount + 1);
  }
});

// Reject non-digit characters *before* they're inserted, rather than
// stripping them after the fact
$amountField.addEventListener("beforeinput", function (event) {
  // event.data is null for non-insertion edits (backspace, delete, cut)
  // those are always safe and shouldn't be blocked here
  if (event.data && /\D/.test(event.data)) {
    event.preventDefault();
  }
});

// Enter contribution functionality
$amountField.addEventListener("input", function () {
  // Fallback only: `beforeinput` (above) is what should normally prevent a
  // non-digit from ever landing here. This stays as a safety net for the
  // rare path where `beforeinput` isn't supported, and preserves cursor
  // position across the strip so that fallback can't reintroduce the same
  // reordering bug `beforeinput` exists to prevent
  const cursorPos = this.selectionStart;
  const rawValue = this.value;
  const sanitized = rawValue.replace(/\D/g, "");

  // Update counter button state dynamically as the user types or clears the field
  updateCounterButtonState(sanitized);

  if (sanitized !== rawValue) {
    const removedBeforeCursor = rawValue
      .slice(0, cursorPos)
      .replace(/\d/g, "").length;

    this.value = sanitized;
    this.setSelectionRange(
      cursorPos - removedBeforeCursor,
      cursorPos - removedBeforeCursor,
    );
  }

  const val = Number(sanitized);

  // Hard-cap at max while typing so the field can never hold an invalid value
  // We don't clamp at min here — the user may be mid-typing (e.g. typing "15"
  // passes through "1" first, which is valid), so min is enforced on blur
  if (val > MAX_CONTRIBUTION) {
    setAmount(MAX_CONTRIBUTION);

    return;
  }

  // Guard against the field being completely empty (e.g. the user selects all
  // and deletes). In that state, sanitized is "" and Number("") is 0,
  // which would flash "Contribute $0" on the submit button — an invalid and
  // confusing state. By checking the truthiness of the sanitized string, we
  // skip the span update entirely when the field is empty — the span holds whatever
  // value it showed last, and let the blur handler restore the value to MIN_CONTRIBUTION
  // once the user leaves the field
  if (sanitized) {
    $totalContributionSpan.textContent = val;
  }
});

// Clamp to min when the user leaves the field empty or below the minimum
$amountField.addEventListener("blur", function () {
  const val = Number(this.value);
  setAmount(clamp(val || MIN_CONTRIBUTION, MIN_CONTRIBUTION, MAX_CONTRIBUTION));
});

/**
 * Dynamic copyright year
 */
document.querySelector("[data-copyright-year]").textContent =
  new Date().getFullYear();

/**
 * Textarea character counter
 */
const $messageField = document.querySelector("[data-message-field]");
const $charCounter = document.querySelector("[data-char-counter]");
const WARNING_THRESHOLD = 450;
const DANGER_THRESHOLD = 490;
const MAX_CHARS = 500;

$messageField.addEventListener("input", function () {
  const currentLength = this.value.length;
  $charCounter.textContent = `${currentLength}/${MAX_CHARS}`;

  if (currentLength >= DANGER_THRESHOLD) {
    $charCounter.classList.remove("on-surface-variant-text", "text-warning");
    $charCounter.classList.add("text-error");
  } else if (currentLength >= WARNING_THRESHOLD) {
    $charCounter.classList.remove("on-surface-variant-text", "text-error");
    $charCounter.classList.add("text-warning");
  } else {
    $charCounter.classList.remove("text-warning", "text-error");
    $charCounter.classList.add("on-surface-variant-text");
  }
});

/**
 * Email validation & submit button state
 */
const $contributeForm = document.querySelector("[data-contribute-form]");
const $submitBtn = $contributeForm.querySelector("[data-submit-btn]");
const $emailField = document.querySelector("[data-email-field]");

function toggleSubmitBtn() {
  $submitBtn.disabled = !EMAIL_REGEX.test($emailField.value.trim());
}

$emailField.addEventListener("input", toggleSubmitBtn);
// Check on initial load
toggleSubmitBtn();

/**
 * Submit contribute form
 */
const $formError = $contributeForm.querySelector("[data-form-error]");

let formErrorTimeoutId;

function showFormError(message) {
  // Clear any pending auto-dismiss so a fast second error doesn't get cut
  // off early by the first error's timer
  clearTimeout(formErrorTimeoutId);

  $formError.textContent = message;
  $formError.hidden = false;

  formErrorTimeoutId = setTimeout(() => {
    $formError.hidden = true;
  }, 6000);
}

$contributeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // GATHER DATA & NORMALIZE
  const $formFields = $contributeForm.querySelectorAll("[data-form-field]");
  const formData = {};

  $formFields.forEach((field) => {
    formData[field.getAttribute("name")] = field.value.trim();
  });

  const parsedAmount = Number(formData.amount);
  const clampedAmount = clamp(
    Number.isFinite(parsedAmount) ? Math.trunc(parsedAmount) : MIN_CONTRIBUTION,
    MIN_CONTRIBUTION,
    MAX_CONTRIBUTION,
  );

  if (clampedAmount !== parsedAmount) {
    setAmount(clampedAmount);
  }
  formData.amount = clampedAmount;

  // CLIENT-SIDE VALIDATION
  if (formData.name) {
    if (formData.name.length < 2 || formData.name.length > 60) {
      return showFormError("Name must be between 2 and 60 characters.");
    }
    if (!NAME_REGEX.test(formData.name)) {
      return showFormError("Please enter a valid name or @XHandle.");
    }
  }

  if (!EMAIL_REGEX.test(formData.email)) {
    return showFormError("Please enter a valid email address.");
  }

  if (formData.message.length > MAX_CHARS) {
    return showFormError(`Message cannot exceed ${MAX_CHARS} characters.`);
  }

  // LOCK UI & SUBMIT
  try {
    // Lock submit button
    $submitBtn.setAttribute("disabled", "");
    $submitBtn.classList.add("loading");
    $submitBtn.setAttribute("aria-label", "Processing contribution...");

    // Lock all inputs and counter buttons
    $formFields.forEach((field) => (field.disabled = true));
    $decrementBtn.disabled = true;
    $incrementBtn.disabled = true;

    const response = await fetch("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData).toString(),
    });

    if (response.ok) {
      const { checkoutUrl } = await response.json();

      if (checkoutUrl) {
        $contributeForm.reset();
        $charCounter.textContent = `0/${MAX_CHARS}`;
        $charCounter.classList.remove("text-warning", "text-error");
        $charCounter.classList.add("on-surface-variant-text");
        setAmount(MIN_CONTRIBUTION);

        window.location.href = checkoutUrl;
        return;
      }
      showFormError("Something went wrong starting the checkout. Try again.");
    } else {
      const { error } = await response.json().catch(() => ({}));
      console.error(
        "Error in checkout route response:",
        error || response.statusText,
      );
      showFormError(error || "Something went wrong. Try again.");
    }
  } catch (error) {
    console.error("Error submitting contribute form:", error);
    showFormError("Network error. Check your connection and try again.");
  } finally {
    // UNLOCK UI ON ERROR (or if redirect fails)
    $submitBtn.classList.remove("loading");
    $submitBtn.removeAttribute("aria-label");

    $formFields.forEach((field) => (field.disabled = false));

    // Restore the correct logical states for the counter and submit buttons
    updateCounterButtonState($amountField.value);
    toggleSubmitBtn();
  }
});

/**
 * Auto-clear the success banner and refresh the page
 */
const $successBanner = document.querySelector("[data-success-banner]");

if ($successBanner) {
  setTimeout(() => {
    window.location.replace(window.location.pathname);
  }, 5000);
}
