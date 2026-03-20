// Simple toast utility using browser notifications or fallback
export interface ToastOptions {
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	id?: string | number;
}

class SimpleToast {
	private toasts = new Map<string | number, HTMLElement>();
	private container: HTMLElement | null = null;

	private ensureContainer() {
		if (!this.container) {
			this.container = document.createElement("div");
			this.container.className = "fixed top-4 right-4 z-50 space-y-2";
			document.body.appendChild(this.container);
		}
		return this.container;
	}

	private createToast(
		message: string,
		type: "success" | "error" | "loading",
		options?: ToastOptions,
	) {
		const container = this.ensureContainer();
		const id = options?.id || Date.now();

		// Remove existing toast with same ID
		if (this.toasts.has(id)) {
			this.remove(id);
		}

		const toast = document.createElement("div");
		toast.className = `
      p-4 rounded-lg shadow-lg min-w-[300px] max-w-md
      transform transition-all duration-300 ease-in-out
      ${type === "success" ? "bg-green-600 text-white" : ""}
      ${type === "error" ? "bg-red-600 text-white" : ""}
      ${type === "loading" ? "bg-blue-600 text-white" : ""}
    `;

		const iconMap = {
			success: "✅",
			error: "❌",
			loading: "⏳",
		};

		toast.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-lg">${iconMap[type]}</span>
        <div class="flex-1">
          <div class="font-medium">${message}</div>
          ${
						options?.description
							? `<div class="text-sm opacity-90 mt-1">${options.description}</div>`
							: ""
					}
          ${
						options?.action
							? `
            <button class="text-sm underline mt-2 hover:no-underline" onclick="(${options.action.onClick.toString()})()">
              ${options.action.label}
            </button>
          `
							: ""
					}
        </div>
        <button class="text-white/80 hover:text-white ml-2" onclick="window.simpleToast.remove('${id}')">
          ×
        </button>
      </div>
    `;

		container.appendChild(toast);
		this.toasts.set(id, toast);

		// Auto remove after delay (except loading)
		if (type !== "loading") {
			setTimeout(() => this.remove(id), type === "error" ? 5000 : 3000);
		}

		return id;
	}

	success(message: string, options?: ToastOptions) {
		return this.createToast(message, "success", options);
	}

	error(message: string, options?: ToastOptions) {
		return this.createToast(message, "error", options);
	}

	loading(message: string, options?: ToastOptions) {
		return this.createToast(message, "loading", options);
	}

	remove(id: string | number) {
		const toast = this.toasts.get(id);
		if (toast) {
			toast.style.transform = "translateX(100%)";
			toast.style.opacity = "0";
			setTimeout(() => {
				toast.remove();
				this.toasts.delete(id);
			}, 300);
		}
	}
}

// Create global instance
const simpleToast = new SimpleToast();

// Make it available globally for button clicks
if (typeof window !== "undefined") {
	(window as any).simpleToast = simpleToast;
}

export const toast = simpleToast;
