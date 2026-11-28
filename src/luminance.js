/**
 * Relative luminance
 */
import get from "./get.js";
import getColor from "./getColor.js";
import getAll from "./getAll.js";
import setAll from "./setAll.js";
import xyz_d65 from "./spaces/xyz-d65.js";

/** @import { ColorTypes } from "./types.js" */

/**
 *
 * @param {ColorTypes} color
 * @returns {number}
 */
export function getLuminance (color) {
	// Assume getColor() is called on color in get()
	return get(color, [xyz_d65, "y"]);
}

/**
 * @param {ColorTypes} color
 * @param {number | ((coord: number) => number)} value
 */
export function setLuminance (color, value) {
	color = getColor(color);

	if (typeof value === "function") {
		value = value(getLuminance(color));
	}

	let xyz = getAll(color, xyz_d65);
	let y = xyz[1];

	if (y === 0) {
		// Black has no chromaticity to preserve, adopt the white point's
		let white = xyz_d65.white;
		xyz = [white[0] * value, value, white[2] * value];
	}
	else {
		// Scale X, Y, Z by the same factor to keep the chromaticity unchanged
		let factor = value / y;
		xyz = [xyz[0] * factor, value, xyz[2] * factor];
	}

	setAll(color, xyz_d65, xyz);
}

/**
 * @param {typeof import("./color.js").default} Color
 */
export function register (Color) {
	Object.defineProperty(Color.prototype, "luminance", {
		get () {
			return getLuminance(this);
		},
		set (value) {
			setLuminance(this, value);
		},
	});
}
