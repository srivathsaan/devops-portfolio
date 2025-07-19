# DevOps Engineer Portfolio

This project contains a simple static website that showcases the work of a DevOps engineer. It uses Tailwind CSS for styling, Three.js for animated visuals and a small JavaScript snippet to call the Gemini API for detailed project descriptions.

## Setup

1. Clone or download this repository.
2. Serve the `index.html` file using any static web server or simply open it directly in your browser.

```bash
# Example using Python
python3 -m http.server
```

Then visit `http://localhost:8000/index.html`.


## How the form works

Every project card on the page includes a **Generate Detailed Description** button. Clicking it will:

1. Create a prompt from the project's title, short text and tech tags.
2. Send that prompt to the Gemini API using `fetch()` and the configured key.
3. Display the returned text inside a pop‑up modal.

If the request fails the modal shows an error message.
