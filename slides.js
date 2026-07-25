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
        consoleOutput.innerHTML = '<div class="log-line system">// Hệ thống Figma MCP sẵn sàng. Bắt đầu bằng cách bấm [Bước 1]...</div>';
        
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

    // Step 1: User prompts IDE -> sends to AI Model
    btnStep1.addEventListener('click', () => {
        btnStep1.classList.remove('active-step');
        btnStep1.disabled = true;
        
        appendLog(`USER (IDE): "Hãy sinh code Angular cho frame thiết kế: https://www.figma.com/design/Fdgx5QSeVjX65cvS4R08sS/Header?node-id=7850-46251"`, 'client-req');
        appendLog(`IDE -> AI (Model): [Gửi Prompt kèm danh sách Tool khả dụng của Figma MCP]`, 'system');
        
        // Trigger 3D animation (Computer -> AI Model)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-1');
        }

        setTimeout(() => {
            btnStep2.disabled = false;
            btnStep2.classList.add('active-step');
            appendLog(`// Bước 1 Hoàn Tất. Bấm [Bước 2: AI Gọi Tool Đọc Figma] để xem AI yêu cầu gọi tool...`, 'system');
        }, 1200);
    });

    // Step 2: AI Model instructs IDE to call tool -> local MCP Server
    btnStep2.addEventListener('click', () => {
        btnStep2.classList.remove('active-step');
        btnStep2.disabled = true;
        
        appendLog(`AI (Model) -> IDE: Yêu cầu gọi tool (tool_call): "figma/get_node_data"`, 'server-resp');
        appendLog(`Parameters: { fileKey: "Fdgx5QSeVjX65cvS4R08sS", nodeIds: ["7850-46251"] }`, 'system');
        appendLog(`IDE -> FIGMA MCP: Chuyển tiếp yêu cầu gọi tool cục bộ qua StdIO.`, 'client-req');

        // Trigger 3D animation (AI Model -> Computer -> MCP Server)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-2');
        }

        setTimeout(() => {
            btnStep3.disabled = false;
            btnStep3.classList.add('active-step');
            appendLog(`// Bước 2 Hoàn Tất. Bấm [Bước 3: Truy Vấn Thiết Kế] để lấy JSON thiết kế...`, 'system');
        }, 1200);
    });

    // Step 3: MCP Server calls Figma Cloud -> returns layout JSON to IDE
    btnStep3.addEventListener('click', () => {
        btnStep3.classList.remove('active-step');
        btnStep3.disabled = true;
        
        appendLog(`FIGMA MCP -> FIGMA CLOUD: GET https://api.figma.com/v1/files/Fdgx5QSeVjX65cvS4R08sS/nodes?ids=7850-46251`, 'client-req');
        appendLog(`FIGMA CLOUD -> FIGMA MCP: Trả về JSON AST (Auto Layout, styles, colors)`, 'server-resp');
        appendLog(`FIGMA MCP -> IDE: Trả về kết quả JSON Node cho IDE.`, 'system');

        // Trigger 3D animation (MCP Server -> Figma -> MCP Server -> Computer)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-3');
        }

        setTimeout(() => {
            btnStep4.disabled = false;
            btnStep4.classList.add('active-step');
            appendLog(`// Bước 3 Hoàn Tất. Bấm [Bước 4: AI Sinh & Ghi Code] để gửi dữ liệu cho AI sinh code...`, 'system');
        }, 1200);
    });

    // Step 4: IDE sends design JSON to AI Model -> AI generates code -> IDE writes to workspace
    btnStep4.addEventListener('click', () => {
        btnStep4.classList.remove('active-step');
        btnStep4.disabled = true;
        
        appendLog(`IDE -> AI (Model): [Gửi kết quả của tool_call để làm giàu ngữ cảnh]`, 'client-req');
        appendLog(`AI (Model) -> IDE: Phân tích layout, map CSS variables và trả về mã nguồn Angular component hoàn chỉnh.`, 'server-resp');
        appendLog(`IDE -> LOCAL FILESYSTEM: Ghi đè file code "src/app/header.component.ts"...`, 'client-req');

        // Trigger 3D animation (Computer -> AI Model -> Computer)
        if (typeof window.trigger3DAnimation === 'function') {
            window.trigger3DAnimation('step-4');
        }

        setTimeout(() => {
            appendLog(`LOCAL FILESYSTEM: Tạo file src/app/header.component.ts thành công!`, 'server-resp');
            appendLog(`MÃ NGUỒN ANGULAR SINH RA:\n@Component({\n  selector: 'tds-header',\n  template: '<div class="flex justify-between items-center px-6 gap-4 bg-primary-dark"><ng-content></ng-content></div>'\n})`, 'system');
            appendLog(`// QUY TRÌNH HOÀN THÀNH! Bản thiết kế Figma đã được biên dịch thành code và hiển thị thành công.`, 'server-resp');
            
            btnReset.style.display = 'block';
        }, 1500);
    });

    btnReset.addEventListener('click', resetStepper);

    // Slide Collapse/Expand Toggle
    const btnCollapse = document.getElementById('btn-collapse');
    const interactiveSlide = document.querySelector('.interactive-slide');
    
    btnCollapse.addEventListener('click', () => {
        interactiveSlide.classList.toggle('collapsed');
        if (interactiveSlide.classList.contains('collapsed')) {
            btnCollapse.innerText = '▶';
            btnCollapse.title = 'Mở rộng bảng điều khiển';
        } else {
            btnCollapse.innerText = '◀';
            btnCollapse.title = 'Thu gọn bảng điều khiển';
        }
    });
});
