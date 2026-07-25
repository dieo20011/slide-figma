// Slides Controller Logic (Figma MCP Focused)

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicatorsContainer = document.getElementById('slide-indicators');
    const progressFill = document.getElementById('progress-fill');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Create indicator dots dynamically
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('indicator-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(dot);
    }
    
    const dots = document.querySelectorAll('.indicator-dot');

    // Slide navigation functions
    function updateControls() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
        
        // Progress bar percentage
        const percent = (currentSlide / (totalSlides - 1)) * 100;
        progressFill.style.width = `${percent}%`;

        // Update indicator dots
        dots.forEach((dot, idx) => {
            if (idx === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function goToSlide(index) {
        if (index < 0 || index >= totalSlides || index === currentSlide) return;
        
        // Remove active class from previous
        slides[currentSlide].classList.remove('active');
        
        // Update current index
        currentSlide = index;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
        
        updateControls();

        // Notify 3D Scene Controller
        if (typeof window.onSlideChange === 'function') {
            window.onSlideChange(currentSlide);
        }
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            // Prevent scrolling on space bar
            if (e.key === ' ') e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });

    // Button Event Listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Initialize controls states
    updateControls();

    // ----------------------------------------------------
    // Slide 5 Simulator Panel Logic
    // ----------------------------------------------------
    const consoleOutput = document.getElementById('console-output');
    const btnResource = document.getElementById('btn-resource');
    const btnTool = document.getElementById('btn-tool');
    const btnPrompt = document.getElementById('btn-prompt');

    function appendLog(text, type = 'system') {
        const line = document.createElement('div');
        line.classList.add('log-line', type);
        
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        line.innerText = `[${timestamp}] ${text}`;
        
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    btnResource.addEventListener('click', () => {
        appendLog(`CLIENT -> MCP: resources/read { uri: "figma://file/Fdgx5QSeVjX65cvS4R08sS/node?id=7850-46251" }`, 'client-req');
        
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('figma-fetch');
        }

        setTimeout(() => {
            appendLog(`MCP -> CLIENT: Trả về cấu trúc JSON Node thành công.`, 'server-resp');
            appendLog(`JSON AST: { type: "FRAME", name: "CardInfo", layoutMode: "VERTICAL", itemSpacing: 12, paddingLeft: 16, fills: [{ color: {r:0.05, g:0.06, b:0.11} }] }`, 'system');
        }, 1000);
    });

    btnTool.addEventListener('click', () => {
        appendLog(`CLIENT -> SYSTEM: Tiến hành phân tích layout & khớp CSS token...`, 'client-req');
        
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('parse-token');
        }

        setTimeout(() => {
            appendLog(`SYSTEM: Dịch màu RGB(0.05, 0.06, 0.11) -> Hex: #0D0F1C. Khớp màu với token background: --bg-card-dark.`, 'system');
            appendLog(`SYSTEM: Figma Auto Layout "VERTICAL" -> CSS: "display: flex; flex-direction: column;"`, 'system');
            appendLog(`SYSTEM: Figma Spacing "itemSpacing: 12" -> Tailwind: "gap-3"`, 'system');
            appendLog(`SYSTEM: Figma Padding "paddingLeft: 16" -> Tailwind: "pl-4"`, 'server-resp');
        }, 1000);
    });

    btnPrompt.addEventListener('click', () => {
        appendLog(`CLIENT -> LOCAL: Ghi đè file code "src/components/card.component.ts"...`, 'client-req');
        
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('code-output');
        }

        setTimeout(() => {
            appendLog(`LOCAL: Khởi tạo file src/components/card.component.ts thành công!`, 'server-resp');
            appendLog(`CODE: @Component({\n  selector: 'tds-card',\n  template: '<div class="flex flex-col gap-3 pl-4 bg-dark-card"><ng-content></ng-content></div>'\n})`, 'system');
        }, 1000);
    });
});
