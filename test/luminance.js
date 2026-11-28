import Color from "../src/index.js";
import { getLuminance, setLuminance } from "../src/luminance.js";
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "Luminance tests",
	description:
		"Tests for getting and setting relative luminance (CIE Y). Setting luminance must preserve chromaticity (and thus hue), keep alpha, and handle pure black.",
	check: check.deep(check.proximity({ epsilon: 1e-9 })),
	tests: [
		{
			name: "getLuminance / luminance getter",
			tests: [
				{
					name: "Black",
					run: () => [getLuminance(new Color("srgb", [0, 0, 0]))],
					expect: [0],
				},
				{
					name: "White",
					run: () => [new Color("white").luminance],
					expect: [1],
				},
				{
					name: "oklch(0.7 0.15 30)",
					run: () => [new Color("oklch", [0.7, 0.15, 30]).luminance],
					expect: [0.31885697354576303],
				},
				{
					name: "oklch(0.55 0.08 200)",
					run: () => [new Color("oklch", [0.55, 0.08, 200]).luminance],
					expect: [0.17460079951213794],
				},
			],
		},
		{
			name: "setLuminance / luminance setter",
			tests: [
				{
					name: "Pure black becomes neutral gray, not green",
					run () {
						let color = new Color("srgb", [0, 0, 0]);
						color.luminance = 0.2;
						return [...color.to("srgb").coords, color.luminance];
					},
					expect: [
						0.48452920448170694,
						0.48452920448170694,
						0.48452920448170694,
						0.2,
					],
				},
				{
					name: "Warm color keeps hue and alpha",
					run () {
						let color = new Color("oklch", [0.7, 0.15, 30], 0.4);
						color.luminance = 0.2;
						return [
							...color.to("srgb").coords,
							color.to("oklch").coords[2],
							color.alpha,
							color.luminance,
						];
					},
					expect: [
						0.7548694518717851,
						0.3716669876502409,
						0.31490190841658416,
						30,
						0.4,
						0.2,
					],
				},
				{
					name: "Cool color keeps hue",
					run () {
						let color = new Color("oklch", [0.55, 0.08, 200]);
						color.luminance = 0.2;
						return [...color.to("srgb").coords, color.to("oklch").coords[2]];
					},
					expect: [
						0.17522955230281345,
						0.5324334963104674,
						0.5507349725542824,
						200,
					],
				},
				{
					name: "Result is in sRGB gamut",
					run () {
						let color = new Color("oklch", [0.7, 0.15, 30], 0.4);
						color.luminance = 0.2;
						return [color.inGamut("srgb") ? 1 : 0];
					},
					expect: [1],
				},
				{
					name: "Setting the same luminance twice is stable",
					run () {
						let color = new Color("oklch", [0.7, 0.15, 30], 0.4);
						color.luminance = 0.2;
						color.luminance = 0.2;
						return [
							...color.to("srgb").coords,
							color.to("oklch").coords[2],
							color.alpha,
						];
					},
					expect: [
						0.7548694518717851,
						0.3716669876502409,
						0.31490190841658416,
						30,
						0.4,
					],
				},
				{
					name: "White stays neutral",
					run () {
						let color = new Color("white");
						color.luminance = 0.5;
						return color.to("srgb").coords;
					},
					expect: [0.7353569830524496, 0.7353569830524496, 0.7353569830524496],
				},
				{
					name: "Setting luminance to 0 gives black",
					run () {
						let color = new Color("oklch", [0.7, 0.15, 30]);
						color.luminance = 0;
						return [...color.to("srgb").coords, color.luminance];
					},
					expect: [0, 0, 0, 0],
				},
				{
					name: "Black to full luminance gives white",
					run () {
						let color = new Color("srgb", [0, 0, 0]);
						color.luminance = 1;
						return color.to("srgb").coords;
					},
					expect: [1, 1, 1],
				},
				{
					name: "Function value receives current luminance",
					run () {
						let color = new Color("oklch", [0.7, 0.15, 30]);
						setLuminance(color, y => y / 2);
						return [color.luminance];
					},
					expect: [0.31885697354576303 / 2],
				},
			],
		},
	],
};
