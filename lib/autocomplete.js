export class Autocomplete {
  constructor(
    inputElement,
    fetchSuggestions,
    tagCategoryColors,
    tagCategoryNames
  ) {
    this.input = inputElement;
    this.fetchSuggestions = fetchSuggestions;
    this.tagCategoryColors = tagCategoryColors;
    this.tagCategoryNames = tagCategoryNames;
    this.container = null;
    this.activeIndex = -1;
    this.animationTimeout = null;

    this.init();
  }

  init() {
    this.container = document.createElement("ul");
    this.container.className = "autocomplete-suggestions";
    document.body.appendChild(this.container);

    this.input.addEventListener(
      "input",
      this.debounce(this.onInput.bind(this), 300)
    );
    this.input.addEventListener("keydown", this.onKeyDown.bind(this));
    this.input.addEventListener("focus", this.onFocus.bind(this));
    this.input.addEventListener("blur", this.onBlur.bind(this));
  }

  debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async onInput() {
    const query = this.input.value;
    const currentTags = query.split(" ");
    const lastTag = currentTags[currentTags.length - 1];

    if (
      lastTag.length < 2 ||
      lastTag.startsWith("-") ||
      lastTag.includes(":")
    ) {
      this.hide();
      return;
    }
    const suggestions = await this.fetchSuggestions(lastTag);
    this.render(suggestions);
  }

  onFocus() {
    if (this.input.value.length > 1) {
      this.onInput();
    }
  }

  onBlur() {
    setTimeout(() => this.hide(), 150);
  }

  onKeyDown(e) {
    const items = this.container.querySelectorAll("li");
    if (!items.length || !this.container.classList.contains("visible")) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % items.length;
        this.updateActive();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + items.length) % items.length;
        this.updateActive();
        break;
      case "Enter":
        e.preventDefault();
        if (this.activeIndex > -1) {
          items[this.activeIndex].click();
        }
        this.hide();
        break;
      case "Escape":
        this.hide();
        break;
    }
  }

  updateActive() {
    const items = this.container.querySelectorAll("li");
    items.forEach((item, index) => {
      item.classList.toggle("active", index === this.activeIndex);
    });
  }

  render(suggestions) {
    const wasVisible = this.container.classList.contains("visible");
    if (!suggestions || suggestions.length === 0) {
      this.hide();
      return;
    }

    this.container.innerHTML = "";
    suggestions.slice(0, 7).forEach((suggestion, index) => {
      const item = document.createElement("li");
      const color = this.tagCategoryColors[suggestion.category] || "#9ca3af";
      const categoryName =
        this.tagCategoryNames[suggestion.category] || "Unknown";

      if (!wasVisible) {
        item.style.animationDelay = `${index * 50}ms`;
      }

      item.innerHTML = `
                <span class="tag-name" style="color: ${color};">${
        suggestion.name
      }</span>
                <span class="tag-details">
                    ${categoryName} &bull; ${suggestion.post_count.toLocaleString()}
                </span>
            `;

      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const currentTags = this.input.value.split(" ");
        const newTags = [...currentTags.slice(0, -1), suggestion.name, ""];
        this.input.value = newTags.join(" ");
        this.hide();
        this.input.focus();
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      this.container.appendChild(item);
    });

    this.show();
  }

  show() {
    const rect = this.input.getBoundingClientRect();
    this.container.style.left = `${rect.left}px`;
    this.container.style.top = `${rect.bottom + window.scrollY}px`;
    this.container.style.width = `${rect.width}px`;

    this.container.classList.add("is-opening");
    this.container.classList.add("visible");
    this.activeIndex = -1;

    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      this.container.classList.remove("is-opening");
    }, 800);
  }

  hide() {
    this.container.classList.remove("visible");
    this.container.classList.remove("is-opening");
  }
}
