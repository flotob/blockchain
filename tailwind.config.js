/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.{html,md,js,jsx}',
    './_layouts/**/*.{html,md,js,jsx}',
    './_posts/**/*.{html,md,js,jsx}',
    './_projects/**/*.{html,md,js,jsx}',
    './_research/**/*.{html,md,js,jsx}',
    './*.{html,md,js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--tw-prose-body)',
            '[class~="lead"]': {
              color: 'var(--tw-prose-lead)'
            },
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: 'var(--tw-prose-links-hover)'
              }
            },
            strong: {
              color: 'var(--tw-prose-bold)',
              fontWeight: '600'
            },
            'ol[type="A"]': {
              '--list-counter-style': 'upper-alpha'
            },
            'ol[type="a"]': {
              '--list-counter-style': 'lower-alpha'
            },
            'ol[type="A" s]': {
              '--list-counter-style': 'upper-alpha'
            },
            'ol[type="a" s]': {
              '--list-counter-style': 'lower-alpha'
            },
            'ol[type="I"]': {
              '--list-counter-style': 'upper-roman'
            },
            'ol[type="i"]': {
              '--list-counter-style': 'lower-roman'
            },
            'ol[type="I" s]': {
              '--list-counter-style': 'upper-roman'
            },
            'ol[type="i" s]': {
              '--list-counter-style': 'lower-roman'
            },
            'ol[type="1"]': {
              '--list-counter-style': 'decimal'
            },
            'ol > li': {
              position: 'relative'
            },
            'ol > li::before': {
              content: 'counter(list-item, var(--list-counter-style, decimal)) "."',
              position: 'absolute',
              fontWeight: '400',
              color: 'var(--tw-prose-counters)'
            },
            'ul > li': {
              position: 'relative'
            },
            'ul > li::before': {
              content: '""',
              position: 'absolute',
              backgroundColor: 'var(--tw-prose-bullets)',
              borderRadius: '50%'
            },
            hr: {
              borderColor: 'var(--tw-prose-hr)',
              borderTopWidth: 1
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'var(--tw-prose-quotes)',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"'
            },
            'blockquote p:first-of-type::before': {
              content: 'open-quote'
            },
            'blockquote p:last-of-type::after': {
              content: 'close-quote'
            },
            h1: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '800'
            },
            'h1 strong': {
              fontWeight: '900',
              color: 'inherit'
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700'
            },
            'h2 strong': {
              fontWeight: '800',
              color: 'inherit'
            },
            h3: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600'
            },
            'h3 strong': {
              fontWeight: '700',
              color: 'inherit'
            },
            h4: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600'
            },
            'h4 strong': {
              fontWeight: '700',
              color: 'inherit'
            },
            code: {
              color: 'var(--tw-prose-code)',
              fontWeight: '600'
            },
            'code::before': {
              content: '"`"'
            },
            'code::after': {
              content: '"`"'
            },
            'a code': {
              color: 'inherit'
            },
            'h1 code': {
              color: 'inherit'
            },
            'h2 code': {
              color: 'inherit'
            },
            'h3 code': {
              color: 'inherit'
            },
            'h4 code': {
              color: 'inherit'
            },
            'blockquote code': {
              color: 'inherit'
            },
            'thead th code': {
              color: 'inherit'
            },
            pre: {
              color: 'var(--tw-prose-pre-code)',
              backgroundColor: 'var(--tw-prose-pre-bg)',
              overflowX: 'auto',
              fontWeight: '400'
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit'
            },
            'pre code::before': {
              content: 'none'
            },
            'pre code::after': {
              content: 'none'
            },
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
} 