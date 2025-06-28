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
				'2xl': '1440px'
			}
		},
		extend: {
			colors: {
				// Custom Design System Colors
				primary: {
					DEFAULT: '#3B82F6',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#6B7280',
					foreground: '#FFFFFF'
				},
				accent: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF'
				},
				background: {
					DEFAULT: '#F8FAFC',
					secondary: '#FFFFFF',
					tertiary: '#F3F4F6'
				},
				surface: '#FFFFFF',
				text: {
					primary: '#1F2937',
					secondary: '#6B7280',
					tertiary: '#9CA3AF'
				},
				border: {
					DEFAULT: '#E5E7EB',
					light: '#F3F4F6',
					medium: '#E5E7EB',
					dark: '#D1D5DB'
				},
				success: '#10B981',
				error: '#EF4444',
				warning: '#F59E0B',
				info: '#3B82F6',
				interactive: {
					primary: '#3B82F6',
					secondary: '#6366F1'
				},
				// Keep existing shadcn colors for compatibility
				foreground: '#1F2937',
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#1F2937'
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#1F2937'
				},
				muted: {
					DEFAULT: '#F3F4F6',
					foreground: '#6B7280'
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF'
				},
				input: '#D1D5DB',
				ring: '#3B82F6',
				sidebar: {
					DEFAULT: '#FFFFFF',
					foreground: '#1F2937',
					primary: '#3B82F6',
					'primary-foreground': '#FFFFFF',
					accent: '#F3F4F6',
					'accent-foreground': '#1F2937',
					border: '#E5E7EB',
					ring: '#3B82F6'
				}
			},
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
			},
			fontSize: {
				'h1': ['32px', { lineHeight: '40px', fontWeight: '600' }],
				'h2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
				'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
				'h4': ['18px', { lineHeight: '24px', fontWeight: '500' }],
				'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
				'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
				'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
			},
			spacing: {
				'4': '4px',
				'8': '8px',
				'12': '12px',
				'16': '16px',
				'20': '20px',
				'24': '24px',
				'32': '32px',
				'40': '40px',
				'48': '48px',
				'64': '64px',
				'80': '80px',
				'96': '96px',
			},
			borderRadius: {
				'sm': '4px',
				'md': '8px',
				'lg': '12px',
				'xl': '16px',
				DEFAULT: '8px'
			},
			boxShadow: {
				'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			},
			transitionDuration: {
				'150': '150ms',
				'200': '200ms',
				'300': '300ms',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
