#!/bin/bash

# Process CSS
npx postcss assets/css/main.css -o assets/css/styles.css

# Build Jekyll site
JEKYLL_ENV=production bundle exec jekyll build 