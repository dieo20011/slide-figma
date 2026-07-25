// Slides Controller Logic (Figma MCP Flow Focused)

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
    // Slide 5 Stepper Simulator Panel Logic
    // ----------------------------------------------------
    const consoleOutput = document.getElementById('console-output');
    const btnStep1 = document.getElementById('btn-step1');
    const btnStep2 = document.getElementById('btn-step2');
    const btnStep3 = document.getElementById('btn-step3');
    const btnStep4 = document.getElementById('btn-step4');
    const btnReset = document.getElementById('btn-reset');

    function appendLog(text, type = 'system') {
        const line = document.createElement('div');
        line.classList.add('log-line', type);
        
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        line.innerText = `[${timestamp}] ${text}`;
        
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function resetStepper() {
        // Clear logs
        consoleOutput.innerHTML = '<div class="log-line system">// Hệ thống Figma MCP sẵn sàng. Bắt đầu bằng cách bấm [Bước 1]...</div>';
        
        // Buttons state reset
        btnStep1.disabled = false;
        btnStep1.classList.add('active-step');
        
        btnStep2.disabled = true;
        btnStep2.classList.remove('active-step');
        
        btnStep3.disabled = true;
        btnStep3.classList.remove('active-step');
        
        btnStep4.disabled = true;
        btnStep4.classList.remove('active-step');
        
        btnReset.style.display = 'none';

        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('reset');
        }
    }

    // Step 1: User sends Link containing Node ID to AI
    btnStep1.addEventListener('click', () => {
        btnStep1.classList.remove('active-step');
        btnStep1.disabled = true;
        
        appendLog(`USER: "Hãy đọc thiết kế và code giao diện Angular cho frame này: https://www.figma.com/design/Fdgx5QSeVjX65cvS4R08sS/Header?node-id=7850-46251"`, 'client-req');
        appendLog(`AI CLIENT: Nhận lệnh. Trích xuất File Key: 'Fdgx5QSeVjX65cvS4R08sS', Node ID: '7850-46251'.`, 'system');
        
        // Trigger 3D animation (User -> AI Client)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-1');
        }

        setTimeout(() => {
            btnStep2.disabled = false;
            btnStep2.classList.add('active-step');
            appendLog(`// Bước 1 Hoàn Tất. Bấm [Bước 2: AI Gọi Figma MCP] để AI liên kết với Server...`, 'system');
        }, 1200);
    });

    // Step 2: AI Client calls local Figma MCP server -> Figma Cloud API
    btnStep2.addEventListener('click', () => {
        btnStep2.classList.remove('active-step');
        btnStep2.disabled = true;
        
        appendLog(`AI CLIENT -> FIGMA MCP: Gửi yêu cầu JSON-RPC "resources/read"`, 'client-req');
        appendLog(`Payload: { uri: "figma://file/Fdgx5QSeVjX65cvS4R08sS/node?id=7850-46251" }`, 'system');
        appendLog(`FIGMA MCP -> FIGMA CLOUD: Gửi HTTPS GET "https://api.figma.com/v1/files/Fdgx5QSeVjX65cvS4R08sS/nodes?ids=7850-46251" (Dùng FIGMA_API_KEY bảo mật)`, 'system');

        // Trigger 3D animation (AI Client -> MCP Server -> Figma Cloud)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-2');
        }

        setTimeout(() => {
            btnStep3.disabled = false;
            btnStep3.classList.add('active-step');
            appendLog(`// Bước 2 Hoàn Tất. Bấm [Bước 3: Trả Về Dữ Liệu Node] để xem thiết kế JSON Figma...`, 'system');
        }, 1200);
    });

    // Step 3: Figma Cloud returns design JSON AST to AI Client
    btnStep3.addEventListener('click', () => {
        btnStep3.classList.remove('active-step');
        btnStep3.disabled = true;
        
        appendLog(`FIGMA CLOUD -> FIGMA MCP: Trả về HTTP 200 OK với dữ liệu JSON AST.`, 'server-resp');
        appendLog(`FIGMA MCP -> AI CLIENT: Trả về dữ liệu Node đã được trích xuất: { type: "FRAME", name: "HeaderBar", layoutMode: "HORIZONTAL", primaryAxisAlignItems: "SPACE_BETWEEN", counterAxisAlignItems: "CENTER", paddingLeft: 24, paddingRight: 24, itemSpacing: 16, fills: [{color: {r: 0.05, g: 0.06, b: 0.11}}] }`, 'system');

        // Trigger 3D animation (Figma Cloud -> MCP Server -> AI Client)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-3');
        }

        setTimeout(() => {
            btnStep4.disabled = false;
            btnStep4.classList.add('active-step');
            appendLog(`// Bước 3 Hoàn Tất. Bấm [Bước 4: Phân Tích & Ghi Code] để xem cách sinh mã nguồn...`, 'system');
        }, 1200);
    });

    // Step 4: AI processes JSON AST & writes code to filesystem
    btnStep4.addEventListener('click', () => {
        btnStep4.classList.remove('active-step');
        btnStep4.disabled = true;
        
        appendLog(`AI CLIENT: Bắt đầu phân tích Auto Layout 'HORIZONTAL'...`, 'client-req');
        appendLog(`AI CLIENT: Map 'SPACE_BETWEEN' & 'CENTER' -> CSS: "display: flex; justify-content: space-between; align-items: center;"`, 'system');
        appendLog(`AI CLIENT: Dịch spacing 16px -> Tailwind 'gap-4'; padding 24px -> Tailwind 'px-6'.`, 'system');
        appendLog(`AI CLIENT: Dịch màu RGB(0.05, 0.06, 0.11) -> Hex #0D0F1C. Khớp màu trùng khớp với Design Token: '--bg-primary-dark'.`, 'system');
        appendLog(`AI CLIENT -> LOCAL FILESYSTEM: Ghi đè file code "src/app/header.component.ts"...`, 'client-req');

        // Trigger 3D animation (AI Client -> Workspace Code Editor)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-4');
        }

        setTimeout(() => {
            appendLog(`LOCAL FILESYSTEM: Tạo file src/app/header.component.ts thành công!`, 'server-resp');
            appendLog(`MÃ NGUỒN ANGULAR SINH RA:\n@Component({\n  selector: 'tds-header',\n  template: '<div class="flex justify-between items-center px-6 gap-4 bg-primary-dark"><ng-content></ng-content></div>'\n})`, 'system');
            appendLog(`// QUY TRÌNH HOÀN THÀNH! Bản thiết kế Figma đã được chuyển đổi thành code thực tế nằm trong workspace của bạn.`, 'server-resp');
            
            btnReset.style.display = 'block';
        }, 1500);
    });

    btnReset.addEventListener('click', resetStepper);
});
