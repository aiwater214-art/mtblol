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
        const errorData = await response
          .json()
          .catch(async () => ({ message: await response.text().catch(() => response.statusText) }));
        throw new Error(errorData.error || errorData.message || "Request failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition") || "";
      let filename = "download";

      const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
      if (filenameMatch) {
        filename = decodeURIComponent(filenameMatch[1] || filenameMatch[2] || filename);
      }

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);

      status.textContent = `Download started for ${filename}`;
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
