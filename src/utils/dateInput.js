/**
 * Open the native picker for an `<input type="date" | "datetime-local">`.
 *
 * WHY THIS EXISTS
 * Chromium only opens the picker when you hit the small calendar button drawn
 * INSIDE the field. Clicking anywhere else just focuses a text segment, which
 * leaves roughly a 20x20px target for the primary action of a date field - and
 * nothing on screen tells the user that button is there. Attaching this to
 * `onClick` makes the whole field open the picker, which is what people expect
 * from a date input.
 *
 * - Must run inside a user gesture; a click handler qualifies.
 * - Deliberately NOT wired to `onFocus`: tabbing into the field should let a
 *   keyboard user type a date, not throw a picker in their way.
 * - A no-op where `showPicker` is unsupported (Firefox < 101, older Safari), so
 *   those browsers keep the native behaviour they already had.
 * - The click that lands ON the calendar button also reaches here; the browser
 *   simply ignores the second open, and the try/catch covers the rest.
 */
export function openDatePicker(event) {
  const input = event?.currentTarget;
  if (!input || typeof input.showPicker !== 'function') return;
  try {
    input.showPicker();
  } catch {
    // NotAllowedError when the call is not user-activated, InvalidStateError
    // when the picker is already open. Neither is worth surfacing: the native
    // affordances still work, so the user is never stuck.
  }
}
