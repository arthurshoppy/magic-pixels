import { WHITE, pixelColor, rndColorIdx } from "../helpers/color-utils";
import { rndBtwn } from "../helpers/utils";

export type EmitterOptions = {
	active: boolean,
	colored?: boolean,
	intensity?: number,
	density?: number,
	spread?: number,
	opacity?: number
}

export function pixelemitter(element: HTMLElement, options: EmitterOptions) {
	const amount = Math.floor((element.clientHeight * element.clientWidth / 280) * (options.density ?? 1))

	const pool = document.createElement("div")

	const pixels = Array(amount).fill(1).map(() => {
		const el = document.createElement("div")
		el.style.position = "absolute";
		el.style.height = "4px";
		el.style.width = "4px";
		el.style.pointerEvents = "none";
		return el
	})
	pixels.forEach(p => pool.appendChild(p))

	// pool.style.display = "none"
	pool.style.zIndex = "-1"
	pool.style.position = "absolute"
	pool.className = "inset-0"
	element.style.position = "relative"
	element.appendChild(pool)

	const centerX = element.clientWidth / 2;
	const centerY = element.clientHeight / 2;

	function moveAlongLine(x: number, y: number, distance: number) {
		const magnitude = Math.sqrt(x * x + y * y);

		const normalizedX = x / magnitude;
		const normalizedY = y / magnitude;

		return [x + normalizedX * (distance * 10), y + normalizedY * (distance * 10)]
	}

	function rndPoint() {
		const w = element.clientWidth;
		const h = element.clientHeight;

		const x = rndBtwn(1, w) - centerX;
		const y = rndBtwn(1, h) - centerY;

		const [ex, ey] = moveAlongLine(x, y, 1.5)

		return [x + centerX, ex + centerX, y + centerY, ey + centerY]
	}

	let active = false

	function animatePixel(el: HTMLElement) {
		function animate() {
			if (!active) return
			const duration = 800 - (800 * ((options.intensity ?? 1) - 1))
			const [xStart, xEnd, yStart, yEnd] = rndPoint();
			el.animate([
				{ transform: `translate(${xStart}px, ${yStart}px)`, backgroundColor: "transparent" },
				{ backgroundColor: pixelColor(options.colored ? rndColorIdx() : WHITE) + (options.opacity ? Math.floor(options.opacity * 255).toString(16) : '') },
				{ transform: `translate(${xEnd}px, ${yEnd}px)`, backgroundColor: "transparent" }
			], {
				duration: duration,
				delay: rndBtwn(0, duration)
			}).onfinish = animate;
		}
		animate();
	}

	function start() {
		active = true
		pixels.forEach((p) => animatePixel(p))
	}

	function stop() {
		active = false
	}

	if (options.active) {
		start()
	}

	return {
		update(newOptions: EmitterOptions) {
			options = newOptions

			if (options.active !== undefined && active !== options.active) {
				options.active ? start() : stop()
			}
		},

		destroy() {
			element.removeChild(pool)
		}
	}
}