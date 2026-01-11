class SortVisualizer {
    constructor({ K = 8, streamLength = 5, onInit, onStep, onRender }) {
        this.K = K;
        this.streamLength = streamLength;
        this.onInit = onInit;
        this.onStep = onStep;
        this.onRender = onRender;

        // State
        this.streams = [];
        this.output = [];
        this.comparisonCount = 0;
        this.isPlaying = false;
        this.playTimer = null;

        // Bind standard controls
        this.bindControls();
    }

    bindControls() {
        const stepBtn = document.getElementById('stepBtn');
        const playBtn = document.getElementById('playBtn');
        const resetBtn = document.querySelector('button[onclick="reset()"]');
        const seedInput = document.getElementById('seedInput');

        if (stepBtn) stepBtn.onclick = () => this.step();
        if (playBtn) playBtn.onclick = () => this.togglePlay();
        
        // Overwrite the inline onclick="reset()" if possible, or just add listener
        if (resetBtn) {
            resetBtn.onclick = null; // Remove inline handler
            resetBtn.addEventListener('click', () => this.reset());
        }

        // We also need to handle the slider and seed input which don't have IDs in some snippets 
        // or have inline handlers like oninput="...".
        // The HTML has: <input type="range" id="speedSlider" ...>
        // and <input type="text" id="seedInput" ...>
        // We don't need to add listeners for those, just read them when needed.
    }

    mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    init() {
        const seedInput = document.getElementById('seedInput');
        const seedValue = parseInt(seedInput ? seedInput.value : '123') || 123;
        const seededRandom = this.mulberry32(seedValue);

        this.streams = [];
        for(let i=0; i<this.K; i++) {
            let arr = [];
            let base = Math.floor(seededRandom() * 20);
            for(let j=0; j<this.streamLength; j++) {
                base += Math.floor(seededRandom() * 10) + 1;
                arr.push(base);
            }
            this.streams.push({ id: i, data: arr, headIdx: 0 });
        }

        this.output = [];
        this.comparisonCount = 0;
        this.updateComparisonDisplay();

        if (this.onInit) this.onInit();
        
        this.render();
        // We don't hardcode updateStatus here because specific inits might want to say something specific.
        // But we can check if status was updated? No, let specific code handle status.
    }

    reset() {
        this.stopPlay();
        const stepBtn = document.getElementById('stepBtn');
        if (stepBtn) stepBtn.disabled = false;
        this.init();
    }

    step() {
        // Delegate to specific logic
        if (this.onStep) {
            const keepGoing = this.onStep();
            return keepGoing;
        }
        return false;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stopPlay();
        } else {
            this.startPlay();
        }
    }

    startPlay() {
        const stepBtn = document.getElementById('stepBtn');
        if (stepBtn && stepBtn.disabled) return; 

        this.isPlaying = true;
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.innerText = "Pause";
            playBtn.classList.add('paused');
        }
        
        if (stepBtn) stepBtn.disabled = true;
        this.runLoop();
    }

    stopPlay() {
        this.isPlaying = false;
        if (this.playTimer) clearTimeout(this.playTimer);
        
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.innerText = "Play";
            playBtn.classList.remove('paused');
        }
        
        // We need to know if we are finished to re-enable step.
        // The specific implementations usually check 'state !== FINISHED'.
        // To keep it generic, we can ask the specific implementation or just re-enable 
        // and let the next step() disable it if it returns false.
        // Actually, the original code checks if merged complete.
        // Let's rely on the fact that if we stopped, the user can try to step.
        // If step returns false, it will disable button again.
        
        const stepBtn = document.getElementById('stepBtn');
        if (stepBtn) stepBtn.disabled = false; 
    }

    runLoop() {
        if (!this.isPlaying) return;
        const keepGoing = this.step();
        if (keepGoing) {
            const slider = document.getElementById('speedSlider');
            const speed = slider ? parseInt(slider.value) : 1000;
            this.playTimer = setTimeout(() => this.runLoop(), speed);
        } else {
            this.stopPlay();
            // Ensure step button stays disabled if we finished naturally
            const stepBtn = document.getElementById('stepBtn');
            if(stepBtn) stepBtn.disabled = true;
        }
    }

    // Helpers
    getStreamVal(streamIdx) {
        if (streamIdx === -1 || streamIdx === null || streamIdx === undefined) return Infinity;
        let s = this.streams[streamIdx];
        if (!s || s.headIdx >= s.data.length) return Infinity;
        return s.data[s.headIdx];
    }
    
    valStr(val) {
        // Can accept object {val: ...} or direct number
        if (typeof val === 'object' && val !== null) val = val.val;
        return val === Infinity ? '∞' : val;
    }

    incComparison() {
        this.comparisonCount++;
        this.updateComparisonDisplay();
    }

    updateComparisonDisplay() {
        const el = document.getElementById('comparison-counter');
        if(el) el.innerText = `Comparisons: ${this.comparisonCount}`;
    }

    updateStatus(msg) {
        const el = document.getElementById('status');
        if(el) el.innerText = msg;
    }

    render() {
        this.renderCommon();
        if (this.onRender) this.onRender();
    }

    renderCommon() {
        const streamsContainer = document.getElementById('streams');
        const outputDiv = document.getElementById('output');
        const outputWrapper = document.getElementById('outputWrapper');

        // Render Streams
        if (streamsContainer) {
            streamsContainer.innerHTML = '';
            this.streams.forEach(s => {
                let sDiv = document.createElement('div');
                sDiv.className = 'stream';
                let header = document.createElement('div');
                header.className = 'stream-header';
                header.innerText = `S${s.id}`;
                sDiv.appendChild(header);

                s.data.forEach((val, idx) => {
                    let item = document.createElement('div');
                    item.className = 'stream-item';
                    item.innerText = val;
                    if (idx < s.headIdx) item.classList.add('popped');
                    sDiv.appendChild(item);
                });
                streamsContainer.appendChild(sDiv);
            });
        }

        // Render Output
        if (outputDiv) {
            outputDiv.innerHTML = '';
            this.output.forEach(val => {
                let d = document.createElement('div');
                d.className = 'output-item';
                d.innerText = val;
                outputDiv.appendChild(d);
            });
        }
        
        if (outputWrapper) {
            outputWrapper.scrollLeft = outputWrapper.scrollWidth;
        }
    }

    drawLine(x1, y1, x2, y2, isDimmed = false) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        if(isDimmed) line.classList.add('dimmed');
        const svg = document.getElementById('lines');
        if(svg) svg.appendChild(line);
    }
}
