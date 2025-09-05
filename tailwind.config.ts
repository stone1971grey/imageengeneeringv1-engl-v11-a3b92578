import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'roboto': ['Roboto', 'sans-serif'],
				'roboto-thin': ['Roboto', 'sans-serif'],
				'roboto-regular': ['Roboto', 'sans-serif'],
				'roboto-bold': ['Roboto', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				light: {
					background: 'hsl(var(--light-background))',
					foreground: 'hsl(var(--light-foreground))',
					muted: 'hsl(var(--light-muted))',
					card: 'hsl(var(--light-card))',
					border: 'hsl(var(--light-border))'
				},
				'accent-violet': 'hsl(var(--accent-violet))',
				'accent-soft-blue': 'hsl(var(--accent-soft-blue))',
				scandi: {
					grey: 'hsl(var(--scandi-grey))',
					'light-grey': 'hsl(var(--scandi-light-grey))',
					white: 'hsl(var(--scandi-white))'
				},
				downloads: {
					bg: 'hsl(var(--downloads-bg))',
					text: 'hsl(var(--downloads-text))',
					border: 'hsl(var(--downloads-border))',
					hover: 'hsl(var(--downloads-hover))'
				},
				icon: {
					camera: 'hsl(var(--icon-camera))',
					'camera-fg': 'hsl(var(--icon-camera-fg))',
					testing: 'hsl(var(--icon-testing))',
					'testing-fg': 'hsl(var(--icon-testing-fg))',
					performance: 'hsl(var(--icon-performance))',
					'performance-fg': 'hsl(var(--icon-performance-fg))',
					general: 'hsl(var(--icon-general))',
					'general-fg': 'hsl(var(--icon-general-fg))'
				},
				automotive: {
					button: 'hsl(var(--automotive-button))',
					'icon-bg': 'hsl(var(--automotive-icon-bg))',
					'tests-bg': 'hsl(var(--automotive-tests-bg))'
				},
				training: {
					button: 'hsl(var(--training-button))',
					bg: 'hsl(var(--training-bg))'
				},
				decision: {
					button: 'hsl(var(--decision-button))',
					'icon-bg': 'hsl(var(--decision-icon-bg))'
				},
				academia: {
					button: 'hsl(var(--academia-button))',
					'icon-bg': 'hsl(var(--academia-icon-bg))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'lift': 'var(--shadow-lift)',
				'soft': 'var(--shadow-soft)',
				'gentle': 'var(--shadow-gentle)',
				'warm': 'var(--shadow-warm)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-in-up': {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" }
				},
				'hover-lift': {
					"0%": { transform: "translateY(0px)" },
					"100%": { transform: "translateY(-8px)" }
				},
				'fade-in': {
					"0%": { opacity: "0", transform: "scale(1.05)" },
					"100%": { opacity: "1", transform: "scale(1)" }
				},
				'ken-burns': {
					"0%": { transform: "scale(1) translate(0, 0)" },
					"20%": { transform: "scale(1.25) translate(-3%, -2%)" },
					"40%": { transform: "scale(1.3) translate(2%, -3%)" },
					"60%": { transform: "scale(1.35) translate(-2%, 2%)" },
					"80%": { transform: "scale(1.28) translate(3%, -1%)" },
					"100%": { transform: "scale(1.2) translate(-1%, 3%)" }
				},
				'slide-in-right': {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(100%)" }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in-up': 'slide-in-up 0.4s ease-out',
				'hover-lift': 'hover-lift 0.3s ease-out',
				'fade-in': 'fade-in 1.2s ease-out',
				'ken-burns': 'ken-burns 40s ease-in-out 1 forwards',
				'slide-in-right': 'slide-in-right 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
