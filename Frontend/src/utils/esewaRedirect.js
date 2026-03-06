/**
 * Redirect the user to eSewa's payment page by submitting a hidden form.
 *
 * eSewa v2 requires a POST form submission to their payment URL.
 * This function dynamically creates and submits that form.
 *
 * @param {string} esewaUrl - The eSewa payment form URL (sandbox or production)
 * @param {object} params - The payment parameters returned from /api/payments/esewa/initiate/
 */
export function redirectToEsewa(esewaUrl, params) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = esewaUrl;

  // Add all params as hidden fields
  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
