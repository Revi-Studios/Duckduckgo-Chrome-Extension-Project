// Auto-focus on the search input
document.getElementById("search-input").focus();

const themedark = document.getElementById("theme-dark");
const themeblue = document.getElementById("theme-blue");

// Function to get favicon URL
function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  } catch (e) {
    return ""; // Fallback if URL is invalid
  }
}

// Function to flatten bookmarks
function flattenBookmarks(bookmarkTreeNodes, includeFolders = true) {
  const bookmarks = [];
  const traverse = (nodes) => {
    nodes.forEach((node) => {
      if (node.url) {
        bookmarks.push(node); // Add bookmark
      }
      if (
        node.children &&
        (includeFolders || !node.children.some((child) => child.url))
      ) {
        traverse(node.children); // Recursively process child nodes
      }
    });
  };
  traverse(bookmarkTreeNodes);
  return bookmarks;
}

// Function to render bookmarks in a grid
function renderBookmarks(bookmarks, container) {
  container.innerHTML = ""; // Clear existing bookmarks
  const fragment = document.createDocumentFragment();
  bookmarks.slice(0, 12).forEach((bookmark) => {
    // Only render up to 12 bookmarks
    const bookmarkContainer = document.createElement("div");
    bookmarkContainer.className = "bookmark-container";

    // Create bookmark link
    const link = document.createElement("a");
    link.href = bookmark.url;
    link.className = "bookmark";
    link.target = "_blank"; // Open in new tab

    // Add favicon
    const favicon = document.createElement("img");
    favicon.src = getFaviconUrl(bookmark.url);
    favicon.alt = "Favicon";
    link.appendChild(favicon);

    // Add bookmark name
    const name = document.createElement("span");
    name.className = "bookmark-name";
    name.textContent = bookmark.title || new URL(bookmark.url).hostname;

    // Append elements to container
    bookmarkContainer.appendChild(link);
    bookmarkContainer.appendChild(name);
    fragment.appendChild(bookmarkContainer);
  });
  container.appendChild(fragment);
}

// Fetch and render Chrome bookmarks
function fetchAndRenderBookmarks(includeFolders = true) {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const bookmarks = flattenBookmarks(bookmarkTreeNodes, includeFolders);
    const grid = document.getElementById("bookmarks-grid");
    renderBookmarks(bookmarks, grid);
  });
}

// Toggle customize menu
document.getElementById("settings-button").addEventListener("click", () => {
  const menu = document.getElementById("customize-menu");
  menu.style.animationPlayState = "running";
});

// Theme change functionality
function setTheme(theme) {
  document.body.className = theme; // Apply theme class to body
  localStorage.setItem("theme", theme); // Save theme to localStorage
}

// Apply saved theme on page load
const savedTheme = localStorage.getItem("theme") || "theme-dark";
setTheme(savedTheme);

// Add event listeners for theme buttons
themedark.addEventListener("click", () => {
  setTheme("theme-dark");
});

themeblue.addEventListener("click", () => {
  setTheme("theme-blue");
});

// Handle "Show Bookmarks" checkbox
const toggleFoldersCheckbox = document.getElementById(
  "toggle-folders-checkbox",
);

// Load saved checkbox state
const savedFoldersState = localStorage.getItem("showFolders");
if (savedFoldersState !== null) {
  toggleFoldersCheckbox.checked = savedFoldersState === "true";
}

// Update bookmarks when checkbox state changes
toggleFoldersCheckbox.addEventListener("change", () => {
  const includeFolders = toggleFoldersCheckbox.checked;
  localStorage.setItem("showFolders", includeFolders); // Save state to localStorage
  fetchAndRenderBookmarks(includeFolders);
});

// Fetch bookmarks when the page loads
fetchAndRenderBookmarks(toggleFoldersCheckbox.checked);
