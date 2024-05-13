function generateImage(event) {
  const button = document.querySelector("input[type=submit]");
  event.preventDefault();
  button.value = "Generating...";
  button.disabled = true;
  const repoOwner = document
    .getElementById("repo-owner")
    .value.trim()
    .toLowerCase();
  const repoName = document
    .getElementById("repo-name")
    .value.trim()
    .toLowerCase();
  if (repoOwner.length === 0 || repoName.length === 0) {
    button.value = "Generate";
    button.disabled = false;
    alert("Please enter a valid GitHub repository owner and name.");
    return false;
  }
  const griaPreviewImage = document.getElementById("gria-preview-image");
  const src = `https://gria.smug.af/repo/${repoOwner}/${repoName}`;
  if (griaPreviewImage.src == src) {
    button.value = "Generate";
    button.disabled = false;
    return false;
  }
  griaPreviewImage.onload = function () {
    const griaCopy = document.querySelector(".gria-copy");
    griaCopy.classList.remove("gria-hidden");
    griaPreviewImage.classList.add("gria-preview-image");
    button.value = "Generate";
    button.disabled = false;
  };
  griaPreviewImage.src = src;
  return false;
}
function textCopy(type) {
  const repoName =
    document.getElementById("repo-name").value.trim().toLowerCase() || "gria";
  const repoOwner =
    document.getElementById("repo-owner").value.trim().toLowerCase() ||
    "ryan-willis";
  const src = `https://gria.smug.af/repo/${repoOwner}/${repoName}`;
  const text = type == 0 ? `![${repoName}](${src})` : src;
  navigator.clipboard.writeText(text).then(
    function () {
      alert("Copied to clipboard!");
    },
    function () {
      alert("Failed to copy to clipboard.");
    }
  );
}
