(function () {
  async function triggerDownload(event) {
    event.preventDefault();
    const status = document.getElementById("status");
    status.textContent = "Submitting download request...";

    try {
      const response = await fetch("/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download" }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.error || error.message || "Request failed");
      }

      const result = await response.json().catch(() => ({}));
      status.textContent = `Download triggered: ${JSON.stringify(result)}`;
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("download-form");
    if (form) {
      form.addEventListener("submit", triggerDownload);
    }
  });
})();
