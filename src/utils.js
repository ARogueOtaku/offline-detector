export function fetchWithTimeout(url, timeout = 5000, options = {}) {
  const controller = new AbortController();
  const response = fetch(url, { signal: controller.signal, ...options });
  const timeoutId = setTimeout(() => {}, timeout);
  response.finally(() => {
    clearTimeout(timeoutId);
  });
  return response;
}
