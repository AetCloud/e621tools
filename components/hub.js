export const render = () => {
  return `
    <div class="container mx-auto p-4 md:p-8">
        <header class="text-center mb-12 relative">
            <h1 class="text-4xl md:text-5xl font-bold text-cyan-400">Napp's e621 Tools</h1>
            <p class="text-gray-400 mt-2">A collection of useful tools for e621.net</p>
            <a href="#/settings" data-link class="absolute top-0 right-0 p-2 text-gray-400 hover:text-cyan-400" title="Settings">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </a>
        </header>

        <main>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <a href="#/tools/mass-favorite" data-link class="tool-card bg-gray-800 rounded-2xl p-6 shadow-2xl transition-transform transform hover:scale-105">
                    <h2 class="text-2xl font-bold text-cyan-500 mb-2">Mass Favorite Tool</h2>
                    <p class="text-gray-400">Favorite posts in bulk based on a tag search.</p>
                </a>

                <a href="#/tools/mass-downloader" data-link class="tool-card bg-gray-800 rounded-2xl p-6 shadow-2xl transition-transform transform hover:scale-105">
                    <h2 class="text-2xl font-bold text-cyan-500 mb-2">Mass Downloader</h2>
                    <p class="text-gray-400">Download posts in bulk based on a tag search.</p>
                </a>

                <a href="#/tools/pool-viewer" data-link class="tool-card bg-gray-800 rounded-2xl p-6 shadow-2xl transition-transform transform hover:scale-105">
                    <h2 class="text-2xl font-bold text-cyan-500 mb-2">Pool Viewer</h2>
                    <p class="text-gray-400">View entire image sets and comics in a seamless, scrollable grid.</p>
                </a>

                <div class="tool-card-disabled bg-gray-800 rounded-2xl p-6 shadow-2xl">
                    <h2 class="text-2xl font-bold text-gray-600 mb-2">Tag Explorer</h2>
                    <p class="text-gray-500">Analyze tag relationships and discover related content and artists. (Coming Soon)</p>
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
