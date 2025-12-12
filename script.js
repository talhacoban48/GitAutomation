// Custom Select Implementation
class CustomSelect {
  constructor(
    selectEl,
    dropdownEl,
    options,
    editable = true,
    storageKey = null
  ) {
    this.selectEl = selectEl;
    this.dropdownEl = dropdownEl;
    this.editable = editable;
    this.storageKey = storageKey;
    this.valueEl = selectEl.querySelector(".select-value");

    if (editable && storageKey) {
      this.options = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!Array.isArray(this.options) || this.options.length === 0) {
        this.options = options;
      }
    } else {
      this.options = options;
    }

    this.selectedValue = this.options[0];
    this.init();
  }

  init() {
    this.render();

    this.selectEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener("click", () => {
      this.close();
    });

    this.dropdownEl.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  render() {
    this.dropdownEl.innerHTML = "";
    this.options.forEach((opt) => {
      const optEl = document.createElement("div");
      optEl.className = "custom-select-option";
      if (opt === this.selectedValue) optEl.classList.add("selected");

      const span = document.createElement("span");
      span.textContent = opt;

      optEl.addEventListener("click", () => {
        this.selectOption(opt);
      });

      optEl.appendChild(span);

      if (this.editable) {
        const delBtn = document.createElement("button");
        delBtn.className = "option-delete";
        delBtn.textContent = "×";
        delBtn.title = "Delete";
        delBtn.type = "button";

        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteOption(opt);
        });

        optEl.appendChild(delBtn);
      }

      this.dropdownEl.appendChild(optEl);
    });

    this.valueEl.textContent = this.selectedValue;
  }

  toggle() {
    const isActive = this.dropdownEl.classList.contains("active");
    document.querySelectorAll(".custom-select-dropdown").forEach((d) => {
      d.classList.remove("active");
    });
    document.querySelectorAll(".custom-select").forEach((s) => {
      s.classList.remove("active");
    });

    if (!isActive) {
      this.dropdownEl.classList.add("active");
      this.selectEl.classList.add("active");
    }
  }

  close() {
    this.dropdownEl.classList.remove("active");
    this.selectEl.classList.remove("active");
  }

  selectOption(value) {
    this.selectedValue = value;
    this.render();
    this.close();
  }

  addOption(value) {
    if (!this.editable) return false;
    if (this.options.includes(value)) {
      alert("This option already exists.");
      return false;
    }
    this.options.push(value);
    this.save();
    this.render();
    return true;
  }

  deleteOption(value) {
    if (!this.editable) return;
    if (this.options.length <= 1) {
      alert("At least one option must remain.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${value}?`)) return;

    this.options = this.options.filter((x) => x !== value);
    if (this.selectedValue === value) {
      this.selectedValue = this.options[0];
    }
    this.save();
    this.render();
  }

  save() {
    if (this.editable && this.storageKey) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.options));
    }
  }

  getValue() {
    return this.selectedValue;
  }
}

// Initialize custom selects
const REPO_KEY = "git_ui_repoOptions_v1";

const branchTypeSelect = new CustomSelect(
  document.getElementById("branchTypeSelect"),
  document.getElementById("branchTypeDropdown"),
  ["feature", "bugfix", "hotfix", "release"],
  false
);

const repoSelectObj = new CustomSelect(
  document.getElementById("repoSelect"),
  document.getElementById("repoDropdown"),
  ["current", "repo-a", "repo-b"],
  true,
  REPO_KEY
);

// Add repo button handler
document.getElementById("addRepoBtn").addEventListener("click", () => {
  const newVal = prompt("New repository name:");
  if (!newVal) return;
  const val = newVal.trim();
  if (!val) return;
  repoSelectObj.addOption(val);
});

// Validation functions
function validateGitBranchName(name) {
  if (!name) return true; // Optional field

  // Apply sanitization first
  const sanitized = sanitizeBranchName(name);

  // After sanitization, check if it's still valid
  if (!sanitized || sanitized.length === 0) return false;

  return true;
}

function validateCommitMessage(msg) {
  if (!msg || msg.trim().length === 0) return false;
  if (msg.trim().length > 72) return false;
  return true;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeBranchName(name) {
  if (!name) return "";

  let sanitized = name.trim();

  // Remove leading/trailing dots and slashes
  sanitized = sanitized.replace(/^[\.\/]+|[\.\/]+$/g, "");

  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, "-");

  // Remove invalid characters (keep alphanumeric, hyphen, underscore, forward slash)
  sanitized = sanitized.replace(/[~^:?*\[\\\]]/g, "");

  // Replace double dots and double slashes
  sanitized = sanitized.replace(/\.\.+/g, ".");
  sanitized = sanitized.replace(/\/\/+/g, "/");

  // Remove .lock suffix if exists
  if (sanitized.endsWith(".lock")) {
    sanitized = sanitized.slice(0, -5);
  }

  // Limit length to 255 characters
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  // Remove trailing dots and slashes again (in case they were created)
  sanitized = sanitized.replace(/[\.\/]+$/, "");

  return sanitized;
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "Error");
  input.classList.add("error");
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "Error");
  input.classList.remove("error");
  errorEl.classList.remove("show");
}

function clearAllErrors() {
  ["issueNumber", "branchName", "commitMessage"].forEach(clearError);
}

// Copy to clipboard
let copyTimeouts = {};

document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("copy-btn") ||
    e.target.closest(".copy-btn")
  ) {
    const btn = e.target.classList.contains("copy-btn")
      ? e.target
      : e.target.closest(".copy-btn");
    const copyType = btn.dataset.copy;

    let textToCopy = "";
    if (copyType === "branchName") {
      textToCopy = document.getElementById("outputBranchName").textContent;
    } else if (copyType === "commitMessage") {
      textToCopy = document.getElementById("outputCommitMessage").textContent;
    } else if (copyType === "prTitle") {
      textToCopy = document.getElementById("outputPRTitle").textContent;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      btn.classList.add("copied");
      btn.innerHTML = '<i class="fa fa-check"></i> Copied';

      if (copyTimeouts[copyType]) {
        clearTimeout(copyTimeouts[copyType]);
      }

      copyTimeouts[copyType] = setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = '<i class="fa fa-copy"></i> Copy';
      }, 2000);
    });
  }
});

// Form submit
document.getElementById("gitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  clearAllErrors();

  const branchType = branchTypeSelect.getValue();
  const issueNumber = document.getElementById("issueNumber").value.trim();
  const branchName = document.getElementById("branchName").value.trim();
  const commitMessage = document.getElementById("commitMessage").value.trim();
  const repo = repoSelectObj.getValue().replace("_", "-");

  let isValid = true;

  // Validate issue number
  if (!issueNumber || issueNumber < 1) {
    showError(
      "issueNumber",
      "Issue number is required and must be a positive number."
    );
    isValid = false;
  }

  // Validate branch name (optional but if provided must be valid)
  if (branchName && !validateGitBranchName(branchName)) {
    showError(
      "branchName",
      "Invalid branch name. Could not sanitize to GitHub rules."
    );
    isValid = false;
  }

  // Validate commit message
  if (!validateCommitMessage(commitMessage)) {
    showError(
      "commitMessage",
      "Commit message is required and must be max 72 characters."
    );
    isValid = false;
  }

  if (!isValid) return;

  // Generate outputs - sanitize branch name if provided, otherwise use commit message
  const sanitizedBranchName = branchName ? sanitizeBranchName(branchName) : "";
  const branchSuffix = sanitizedBranchName || slugify(commitMessage);
  const outputBranchName = `${branchType}/iss-${issueNumber}-${branchSuffix}`;
  const outputCommitMessage = `${repo} #${issueNumber} | ${commitMessage}`;
  const outputPRTitle = `${branchType.toUpperCase()} #${issueNumber} | PR`;

  // Display outputs
  document.getElementById("outputBranchName").textContent = outputBranchName;
  document.getElementById("outputCommitMessage").textContent = outputCommitMessage;
  document.getElementById("outputPRTitle").textContent = outputPRTitle;

  // Enable copy buttons
  document
    .querySelectorAll(".copy-btn")
    .forEach((btn) => (btn.disabled = false));

  // Scroll to output
  document
    .getElementById("outputSection")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
});
