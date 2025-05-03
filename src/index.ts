var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/") {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Image Generator</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #f0f0f0;
      --text-color: #333;
      --button-bg: #007bff;
      --button-text: white;
      --input-bg: white;
      --input-text: black;
      --input-border: #ccc;
      --container-bg: white;
    }
    body.dark-mode {
      --bg-color: #333;
      --text-color: #f0f0f0;
      --button-bg: #0056b3;
      --button-text: white;
      --input-bg: #444;
      --input-text: white;
      --input-border: #666;
      --container-bg: #222;
    }
    body {
      background-color: var(--bg-color);
      font-family: 'Roboto', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      color: var(--text-color);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 800px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 2.5rem;
      margin: 0;
    }
    .theme-toggle {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }
    .theme-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #2196F3;
    }
    input:checked + .slider:before {
      transform: translateX(26px);
    }
    .input-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 600px;
    }
    #promptInput {
      width: 80%;
      height: 50px;
      padding: 10px;
      border: 1px solid var(--input-border);
      border-radius: 5px;
      font-size: 1rem;
      margin-bottom: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      background-color: var(--input-bg);
      color: var(--input-text);
      box-sizing: border-box;
    }
    #promptInput:disabled {
      background-color: #e0e0e0;
      cursor: not-allowed;
    }
    #generateButton {
      padding: 10px 20px;
      background-color: var(--button-bg);
      color: var(--button-text);
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    #generateButton:hover {
      background-color: #0056b3;
    }
    #generateButton:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .result-section {
      margin-top: 20px;
      width: 100%;
      max-width: 600px;
    }
    .image-container {
      background-color: var(--container-bg);
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .image-container img {
      width: 100%;
      border-radius: 5px;
    }
    .image-container button {
      margin-top: 10px;
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .image-container button:hover {
      background-color: #218838;
    }
    .message {
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
    }
    .message.error {
      background-color: #f8d7da;
      color: #721c24;
    }
    @media (max-width: 600px) {
      .input-section, .result-section {
        max-width: 100%;
        padding: 0 10px;
      }
      h1 {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>AI Image Generator</h1>
    <div class="theme-toggle">
      <input type="checkbox" id="theme-toggle">
      <label class="slider" for="theme-toggle"></label>
    </div>
  </header>
  <main>
    <section class="input-section">
      <input type="text" id="promptInput" placeholder="Enter your prompt" aria-label="Prompt input">
      <button id="generateButton">Generate Image</button>
    </section>
    <section class="result-section">
      <div id="result" aria-live="polite"></div>
    </section>
  </main>
  <script>
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
      document.body.classList.toggle('dark-mode', e.target.checked);
    });

    document.getElementById('generateButton').addEventListener('click', async () => {
      const promptInput = document.getElementById('promptInput');
      const generateButton = document.getElementById('generateButton');
      const resultDiv = document.getElementById('result');
      const prompt = promptInput.value.trim();
      if (!prompt) {
        resultDiv.innerHTML = '<div class="message error"><p>Please enter a prompt.</p></div>';
        return;
      }
      promptInput.disabled = true;
      generateButton.disabled = true;
      resultDiv.innerHTML = '';

      const states = ["Generating.", "Generating..", "Generating..."];
      let stateIndex = 0;
      const animationInterval = setInterval(() => {
        generateButton.textContent = states[stateIndex];
        stateIndex = (stateIndex + 1) % states.length;
      }, 500);

      try {
        const response = await fetch(\`/generate?prompt=\${encodeURIComponent(prompt)}\`);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const blob = await response.blob();
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.alt = \`Generated image for: "\${prompt}"\`;
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.innerHTML = \`<p>Generated image for: "\${prompt}"</p>\`;
        imageContainer.appendChild(img);
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Image';
        downloadButton.addEventListener('click', () => {
          const link = document.createElement('a');
          link.href = img.src;
          link.download = 'generated-image.png';
          link.click();
        });
        imageContainer.appendChild(downloadButton);
        resultDiv.innerHTML = '';
        resultDiv.appendChild(imageContainer);
      } catch (error) {
        resultDiv.innerHTML = \`<div class="message error"><p>Error: \${error.message}</p></div>\`;
      } finally {
        clearInterval(animationInterval);
        promptInput.disabled = false;
        generateButton.disabled = false;
        generateButton.textContent = 'Generate Image';
      }
    });
  </script>
</body>
</html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    } else if (path === "/generate") {
      const prompt = url.searchParams.get('prompt');
      if (!prompt) {
        return new Response('Prompt is required', { status: 400 });
      }
      const inputs = { prompt: prompt };
      try {
        const response = await env.AI.run(
          "@cf/stabilityai/stable-diffusion-xl-base-1.0",
          inputs
        );
        return new Response(response, {
          headers: { "Content-Type": "image/png" }
        });
      } catch (error) {
        return new Response('Error generating image', { status: 500 });
      }
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }
};

export {
  index_default as default
};
