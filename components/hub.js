import { apiRequest } from "../lib/api.js";

export const render = () => {
  return `
    <div class="container mx-auto p-4 md:p-8">
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-cyan-400">Napp's e621 Tools</h1>
            <p class="text-gray-400 mt-2">A collection of useful tools for e621.net</p>
        </header>

        <main>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <a href="/tools/mass-favorite" data-link class="tool-card bg-gray-800 rounded-2xl p-6 shadow-2xl transition-transform transform hover:scale-105">
                    <h2 class="text-2xl font-bold text-cyan-500 mb-2">Mass Favorite Tool</h2>
                    <p class="text-gray-400">Favorite posts in bulk based on a tag search.</p>
                </a>

                <a href="/tools/mass-downloader" data-link class="tool-card bg-gray-800 rounded-2xl p-6 shadow-2xl transition-transform transform hover:scale-105">
                    <h2 class="text-2xl font-bold text-cyan-500 mb-2">Mass Downloader</h2>
                    <p class="text-gray-400">Download posts in bulk based on a tag search.</p>
                </a>

                <div class="tool-card-disabled bg-gray-800 rounded-2xl p-6 shadow-2xl">
                    <h2 class="text-2xl font-bold text-gray-600 mb-2">Tag Explorer</h2>
                    <p class="text-gray-500">Analyze tag relationships and discover related content and artists. (Coming Soon)</p>
                </div>

                <div class="tool-card-disabled bg-gray-800 rounded-2xl p-6 shadow-2xl">
                    <h2 class="text-2xl font-bold text-gray-600 mb-2">Pool Viewer</h2>
                    <p class="text-gray-500">View entire image sets and comics in a seamless, scrollable grid. (Coming Soon)</p>
                </div>
                
                <div class="tool-card-disabled bg-gray-800 rounded-2xl p-6 shadow-2xl">
                    <h2 class="text-2xl font-bold text-gray-600 mb-2">Reverse Search</h2>
                    <p class="text-gray-500">Find the source of an image by uploading it or providing a URL. (Coming Soon)</p>
                </div>

            </div>
        </main>
    </div>
    `;
};

export const afterRender = () => {};
