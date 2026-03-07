// Markdown Viewer JavaScript - Mermaid & Zoom/Pan Logic

(function() {
    'use strict';

    // Initialize Mermaid with white background theme and dark text
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            background: '#ffffff',
            primaryColor: '#e1f5fe',
            primaryTextColor: '#1f2328',
            primaryBorderColor: '#0288d1',
            lineColor: '#24292f',
            secondaryColor: '#fff3e0',
            secondaryTextColor: '#1f2328',
            tertiaryColor: '#f3e5f5',
            tertiaryTextColor: '#1f2328',
            nodeBorder: '#57606a',
            nodeTextColor: '#1f2328',
            edgeLabelBackground: '#ffffff',
            edgeLabelColor: '#1f2328',
            // Sequence diagram specific
            sequenceNumberColor: '#1f2328',
            sequenceBorderColor: '#57606a',
            sequenceTextColor: '#1f2328',
            actorBkg: '#e1f5fe',
            actorBorder: '#0288d1',
            actorTextColor: '#1f2328',
            actorLineColor: '#57606a',
            signalColor: '#24292f',
            signalTextColor: '#24292f',
            labelBoxBkgColor: '#ffffff',
            labelBoxBorderColor: '#57606a',
            labelTextColor: '#1f2328',
            loopTextColor: '#1f2328',
            loopLineColor: '#57606a',
            noteTextColor: '#1f2328',
            noteBorderColor: '#d0d7de',
            noteBkgColor: '#f6f8fa',
            activationBkgColor: '#e1f5fe',
            activationBorderColor: '#0288d1',
            altBkgColor: '#f6f8fa'
        },
        flowchart: {
            curve: 'basis',
            padding: 15
        },
        sequence: {
            diagramMarginX: 10,
            diagramMarginY: 10,
            actorMargin: 50,
            boxMargin: 10,
            boxTextColor: '#1f2328',
            noteMargin: 10,
            messageMargin: 35,
            mirrorActors: false
        }
    });

    // Initialize syntax highlighting and mermaid
    document.addEventListener('DOMContentLoaded', function() {
        hljs.highlightAll();
        processMermaidDiagrams();
    });

    // Process all Mermaid diagrams in parallel
    async function processMermaidDiagrams() {
        const mermaidBlocks = document.querySelectorAll('.mermaid-block pre.mermaid code');

        const renderPromises = Array.from(mermaidBlocks).map((block, i) => {
            const code = block.textContent;
            const containerToReplace = block.closest('.mermaid-block');

            return renderMermaidDiagram(code, containerToReplace, i).catch(error => {
                console.error('Mermaid rendering error:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'mermaid-error';
                errorDiv.style.cssText = 'color: #cf222e; padding: 16px; border: 1px solid #cf222e; border-radius: 6px; background: #ffebe9;';
                errorDiv.innerHTML = '<strong>Mermaid Error:</strong> ' + error.message;
                containerToReplace.parentNode.replaceChild(errorDiv, containerToReplace);
            });
        });

        await Promise.all(renderPromises);
    }

    async function renderMermaidDiagram(code, containerToReplace, index) {
        // Create container for the diagram
        const container = document.createElement('div');
        container.className = 'mermaid-container';

        // Create wrapper for scroll/pan
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-wrapper';

        // Create div for mermaid
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        const id = 'mermaid-' + index;

        // Render mermaid diagram
        const { svg } = await mermaid.render(id, code);
        mermaidDiv.innerHTML = svg;

        wrapper.appendChild(mermaidDiv);
        container.appendChild(wrapper);

        // Replace the container
        containerToReplace.parentNode.replaceChild(container, containerToReplace);

        // Add double-click handler for fullscreen
        wrapper.addEventListener('dblclick', function(e) {
            e.preventDefault();
            openFullscreenDiagram(index);
        });

        // Ensure SVG is properly sized
        requestAnimationFrame(() => {
            const svgElement = wrapper.querySelector('svg');
            if (!svgElement) return;

            // Mermaid sets viewBox correctly - just ensure width scales
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
        });
    }

    // Fullscreen diagram functionality
    function openFullscreenDiagram(index) {
        const wrapper = document.querySelectorAll('.mermaid-wrapper')[index];
        if (!wrapper) return;

        const svgElement = wrapper.querySelector('svg');
        if (!svgElement) return;

        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.className = 'mermaid-fullscreen-overlay';
        overlay.id = 'mermaid-fullscreen-' + index;

        // Create fullscreen container
        const container = document.createElement('div');
        container.className = 'mermaid-fullscreen-container';

        // Clone the SVG
        const svgClone = svgElement.cloneNode(true);
        svgClone.style.width = '100%';
        svgClone.style.height = '100%';
        svgClone.style.maxWidth = 'none';
        svgClone.style.maxHeight = 'none';

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mermaid-fullscreen-close';
        closeBtn.textContent = '×';
        closeBtn.title = 'Close (Esc)';
        closeBtn.type = 'button';

        container.appendChild(closeBtn);
        container.appendChild(svgClone);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Initialize pan-zoom for fullscreen SVG
        let fullscreenPanZoom = null;
        requestAnimationFrame(() => {
            try {
                // Set explicit dimensions for pan-zoom
                const viewBox = svgClone.getAttribute('viewBox');
                if (viewBox) {
                    const parts = viewBox.split(' ').map(Number);
                    if (parts.length === 4) {
                        svgClone.setAttribute('width', parts[2]);
                        svgClone.setAttribute('height', parts[3]);
                    }
                }

                fullscreenPanZoom = svgPanZoom(svgClone, {
                    zoomEnabled: true,
                    controlIconsEnabled: false,
                    fit: true,
                    center: true,
                    minZoom: 0.1,
                    maxZoom: 10,
                    zoomScaleSensitivity: 0.3,
                    panEnabled: true,
                    dblClickZoomEnabled: true,
                    mouseWheelZoomEnabled: true,
                    preventMouseEventsDefault: false
                });

                // Store for cleanup
                overlay._panZoomInstance = fullscreenPanZoom;
            } catch (err) {
                console.error('[Mermaid] Fullscreen svgPanZoom init failed:', err);
            }
        });

        // Keydown handler - store reference for cleanup
        function keyHandler(e) {
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                if (fullscreenPanZoom) fullscreenPanZoom.zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                if (fullscreenPanZoom) fullscreenPanZoom.zoomOut();
            }
        }

        // Close function - always removes the keydown listener
        function closeFullscreen() {
            document.removeEventListener('keydown', keyHandler);
            if (fullscreenPanZoom) {
                fullscreenPanZoom.destroy();
            }
            overlay.remove();
            document.body.style.overflow = '';
        }

        // Event handlers
        closeBtn.addEventListener('click', closeFullscreen);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeFullscreen();
            }
        });

        document.addEventListener('keydown', keyHandler);
    }
})();
