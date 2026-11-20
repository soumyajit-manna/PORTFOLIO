# Soumyajit Manna - Portfolio

A responsive personal portfolio for Soumyajit Manna, a MERN-stack developer. The site showcases selected projects, technical skills, education, a downloadable resume, and contact links.

## Features

- Responsive layout for desktop and mobile
- Animated hero and section transitions, scroll progress, and custom desktop cursor
- Project details with technology stacks, video previews, and a static image preview
- Skills and technology logos
- Education and learning timeline with panda illustrations
- Resume viewing and download links
- Accessible page structure and basic social and search metadata

## Tech stack

- HTML
- CSS
- Vanilla JavaScript

No package manager, framework, or build step is required. Google Fonts and technology logos are loaded from external services.

## Run locally

From the project directory, start a local static server:

```powershell
py -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser. If the `py` command is unavailable, use:

```powershell
python -m http.server 8000
```

Press `Ctrl+C` in the terminal to stop the server.

## Project structure

```text
portfolio/
|-- index.html
|-- style.css
|-- script.js
`-- assets/
    |-- Soumyajit_Manna_Full_Stack_Developer_Resume.pdf
    |-- Prescripto_video.mp4
    |-- Forever_video.mp4
    |-- Tomato_video.mp4
    |-- tech-and-kit-project.png
    |-- home-panda-avatar.png
    |-- about-panda-avatar.png
    |-- learning-panda.png
    `-- contact-panda.png
```

## Customize

- Update portfolio text, project details, links, and resume references in `index.html`.
- Adjust layout, colors, typography, and responsive styles in `style.css`.
- Edit interactive behavior and animations in `script.js`.
- Keep referenced images, videos, and the resume in `assets/`, and preserve their filenames or update the corresponding paths in `index.html`.

## Deploy

Deploy the project as a static site using Vercel, Netlify, GitHub Pages, or another static host. Set the project root as the site root; no build command is needed. Ensure the `assets/` directory is included in the deployment.
