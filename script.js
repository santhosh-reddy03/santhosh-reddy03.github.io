document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  let lastScroll = 0;
  const scrollThreshold = 50; // Reduced threshold for quicker response

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking a link
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Use requestAnimationFrame for smooth scroll handling
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;

        // Make the hide/show logic more responsive
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
          // Scrolling down
          nav.classList.add("hide");
        } else if (
          currentScroll < lastScroll ||
          currentScroll < scrollThreshold
        ) {
          // Scrolling up or near top
          nav.classList.remove("hide");
        }

        lastScroll = currentScroll;
        ticking = false;
      });

      ticking = true;
    }
  });

  // Debug - verify nav element was found
  console.log("Nav element:", nav);

  // Theme toggle functionality
  function initializeTheme() {
    const themeToggle = document.querySelector(".theme-toggle");
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme");
    const currentTheme =
      savedTheme || (prefersDarkScheme.matches ? "dark" : "light");

    // Set initial theme
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcons(currentTheme);

    // Toggle theme on button click
    themeToggle?.addEventListener("click", () => {
      const newTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcons(newTheme); // Update icons on all theme toggles
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        updateThemeIcons(newTheme);
      }
    });
  }

  // Update all theme icons on the page
  function updateThemeIcons(theme) {
    const themeToggles = document.querySelectorAll(".theme-toggle");
    themeToggles.forEach((toggle) => {
      const sunIcon = toggle.querySelector(".sun-icon");
      const moonIcon = toggle.querySelector(".moon-icon");

      if (theme === "dark") {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
      } else {
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
      }
    });
  }

  // Initialize theme when DOM is loaded
  initializeTheme();
});

async function fetchRecentRepos() {
  try {
    // Fetch repos and sort by last updated
    const response = await fetch(
      "https://api.github.com/users/santhosh-reddy03/repos?sort=updated&direction=desc"
    );
    const repos = await response.json();
    // Return only the 3 most recently updated repos
    return repos.slice(0, 3);
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
}

function createProjectCard(repo) {
  // Format the date
  const updatedAt = new Date(repo.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `
    <a href="${
      repo.html_url
    }" class="project-card" target="_blank" rel="noopener noreferrer">
      <div class="project-header">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
          <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
        </svg>
        <h3 class="project-title">${repo.name}</h3>
      </div>
      <p class="project-description">${
        repo.description || "No description provided."
      }</p>
      <div class="project-footer">
        ${
          repo.language
            ? `
          <div class="project-language">
            <span class="language-color" style="background-color: ${getLanguageColor(
              repo.language
            )}"></span>
            <span>${repo.language}</span>
          </div>
        `
            : ""
        }
        <div class="project-stats">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🔄 ${updatedAt}</span>
        </div>
      </div>
    </a>
  `;
}

function getLanguageColor(language) {
  const colors = {
    Python: "#3572A5",
    JavaScript: "#f1e05a",
    HTML: "#e34c26",
    CSS: "#563d7c",
    TypeScript: "#2b7489",
    Java: "#b07219",
    "C++": "#f34b7d",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
  };
  return colors[language] || "#858585";
}

async function displayRecentRepos() {
  const projectsGrid = document.querySelector(".projects-grid");
  const repos = await fetchRecentRepos();

  if (repos.length > 0) {
    projectsGrid.innerHTML = repos
      .map((repo) => createProjectCard(repo))
      .join("");
  } else {
    projectsGrid.innerHTML = "<p>No repositories found.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayRecentRepos();
});
