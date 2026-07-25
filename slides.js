// Slides Controller Logic

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

    function handleSimulateAction(actionType, label, method, params, mockResponse) {
        appendLog(`CLIENT -> SERVER: Gửi yêu cầu JSON-RPC "${method}"...`, 'client-req');
        appendLog(`Payload: ${JSON.stringify(params)}`, 'system');
        
        // Trigger 3D path particle animation
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation(actionType);
        }
        
        // Simulate networking delay
        setTimeout(() => {
            appendLog(`SERVER -> CLIENT: Trả về kết quả JSON-RPC cho "${method}"`, 'server-resp');
            appendLog(`Kết quả: ${JSON.stringify(mockResponse)}`, 'system');
            appendLog(`// Luồng xử lý hoàn thành cho: ${label}`, 'system');
        }, 1200);
    }

    btnResource.addEventListener('click', () => {
        handleSimulateAction(
            'resource',
            'Đọc Resource File/DB',
            'resources/read',
            { uri: 'file:///D:/Luan/slide/README.md' },
            { contents: [{ uri: 'file:///D:/Luan/slide/README.md', text: '# slide-figma', mimeType: 'text/markdown' }] }
        );
    });

    btnTool.addEventListener('click', () => {
        handleSimulateAction(
            'tool',
            'Thực thi Tool (Run CLI)',
            'tools/call',
            { name: 'run_command', arguments: { command: 'git status' } },
            { content: [{ type: 'text', text: 'On branch main\nYour branch is up to date.\nnothing to commit, working tree clean' }] }
        );
    });

    btnPrompt.addEventListener('click', () => {
        handleSimulateAction(
            'prompt',
            'Nạp Prompt Template',
            'prompts/get',
            { name: 'explain-mcp', arguments: { topic: 'data flow' } },
            { description: 'Mẫu prompt giải thích luồng hoạt động', messages: [{ role: 'user', content: 'Hãy giải thích chi tiết luồng xử lý của MCP.' }] }
        );
    });
});
