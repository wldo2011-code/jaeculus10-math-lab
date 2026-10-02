// Math Lab Hub - Lesson 01. 확률과 통계 대수의 법칙 JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let totalFlips = 0;
    let headsCount = 0;
    let tailsCount = 0;
    let chartDataPoints = [];
    let autoInterval = null;

    // --- DOM Elements ---
    const coinElem = document.getElementById('coin');
    const lastResultText = document.getElementById('last-result-text');
    
    const statTotal = document.getElementById('stat-total');
    const statHeads = document.getElementById('stat-heads');
    const statTails = document.getElementById('stat-tails');
    const statRatio = document.getElementById('stat-ratio');
    const statPercent = document.getElementById('stat-percent');

    const btnFlip1 = document.getElementById('btn-flip-1');
    const btnFlip100 = document.getElementById('btn-flip-100');
    const btnFlip1000 = document.getElementById('btn-flip-1000');
    const btnFlipAuto = document.getElementById('btn-flip-auto');
    const autoBtnText = document.getElementById('auto-btn-text');
    const autoBtnSub = document.getElementById('auto-btn-sub');
    const btnReset = document.getElementById('btn-reset');
    const zoomToggle = document.getElementById('zoom-toggle');

    // Q&A Answer Toggle Buttons
    const toggleAnswerBtns = document.querySelectorAll('.toggle-answer-btn');
    toggleAnswerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetElem = document.getElementById(targetId);
            if (targetElem) {
                targetElem.classList.toggle('hidden');
                if (targetElem.classList.contains('hidden')) {
                    btn.innerHTML = '<span>🔍 예시 답안 및 개념 보기</span>';
                } else {
                    btn.innerHTML = '<span>🙈 답안 닫기</span>';
                }
            }
        });
    });

    // --- Chart Initialization ---
    const ctx = document.getElementById('probabilityChart').getContext('2d');

    const probabilityChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: '통계적 확률 (앞면 비율)',
                    data: chartDataPoints,
                    borderColor: '#6366f1', // Indigo 500
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    pointRadius: (ctx) => {
                        const total = ctx.chart.data.datasets[0].data.length;
                        return total < 50 ? 3 : 0;
                    },
                    pointBackgroundColor: '#818cf8',
                    fill: false,
                    tension: 0.15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: '던진 횟수 (시행 횟수 N)',
                        color: '#94a3b8',
                        font: { size: 12, weight: 'bold' }
                    },
                    ticks: {
                        color: '#64748b',
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.4)'
                    }
                },
                y: {
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: '앞면의 비율 (통계적 확률)',
                        color: '#94a3b8',
                        font: { size: 12, weight: 'bold' }
                    },
                    ticks: {
                        color: '#64748b',
                        stepSize: 0.1,
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.4)'
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => `시행 횟수: ${items[0].raw.x.toLocaleString()}회`,
                        label: (item) => `상대도수: ${item.raw.y.toFixed(4)} (${(item.raw.y * 100).toFixed(2)}%)`
                    }
                },
                annotation: {
                    annotations: {
                        theoreticalLine: {
                            type: 'line',
                            yMin: 0.5,
                            yMax: 0.5,
                            borderColor: '#ef4444',
                            borderWidth: 2.5,
                            borderDash: [6, 4],
                            label: {
                                display: true,
                                content: '수학적 확률 (0.5)',
                                position: 'end',
                                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                                color: '#ffffff',
                                font: { size: 11, weight: 'bold' },
                                padding: { top: 4, bottom: 4, left: 8, right: 8 }
                            }
                        }
                    }
                }
            }
        }
    });

    // --- Simulation Logic ---
    function runSimulation(count) {
        let lastOutcomeIsHead = true;

        for (let i = 0; i < count; i++) {
            totalFlips++;
            const isHead = Math.random() < 0.5;
            if (isHead) {
                headsCount++;
                lastOutcomeIsHead = true;
            } else {
                tailsCount++;
                lastOutcomeIsHead = false;
            }

            const currentRatio = headsCount / totalFlips;

            let shouldRecord = false;
            if (totalFlips <= 100) {
                shouldRecord = true;
            } else if (totalFlips <= 1000) {
                shouldRecord = (totalFlips % 10 === 0);
            } else if (totalFlips <= 10000) {
                shouldRecord = (totalFlips % 100 === 0);
            } else {
                shouldRecord = (totalFlips % 500 === 0);
            }

            if (shouldRecord || i === count - 1) {
                chartDataPoints.push({ x: totalFlips, y: currentRatio });
            }
        }

        if (count === 1) {
            triggerCoinAnimation(lastOutcomeIsHead);
        } else {
            coinElem.classList.remove('flip-heads', 'flip-tails');
            if (lastOutcomeIsHead) {
                coinElem.style.transform = 'rotateY(0deg)';
                lastResultText.innerHTML = `<span class="text-amber-400 font-bold">🦅 ${count}회 던지기 완료!</span> (마지막: 앞면)`;
            } else {
                coinElem.style.transform = 'rotateY(180deg)';
                lastResultText.innerHTML = `<span class="text-slate-300 font-bold">100 ${count}회 던지기 완료!</span> (마지막: 뒷면)`;
            }
        }

        updateStatsUI();
        probabilityChart.update();
    }

    function triggerCoinAnimation(isHead) {
        coinElem.classList.remove('flip-heads', 'flip-tails');
        void coinElem.offsetWidth;

        if (isHead) {
            coinElem.classList.add('flip-heads');
            lastResultText.innerHTML = `<span class="text-amber-400 font-bold animate-pulse">🦅 앞면이 나왔습니다!</span>`;
        } else {
            coinElem.classList.add('flip-tails');
            lastResultText.innerHTML = `<span class="text-slate-300 font-bold animate-pulse">100 뒷면이 나왔습니다!</span>`;
        }
    }

    function updateStatsUI() {
        statTotal.textContent = totalFlips.toLocaleString();
        statHeads.textContent = headsCount.toLocaleString();
        statTails.textContent = tailsCount.toLocaleString();

        if (totalFlips > 0) {
            const ratio = headsCount / totalFlips;
            statRatio.textContent = ratio.toFixed(3);
            statPercent.textContent = `(${(ratio * 100).toFixed(1)}%)`;

            const diff = Math.abs(ratio - 0.5);
            if (diff < 0.02) {
                statRatio.className = 'text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider';
            } else if (diff < 0.08) {
                statRatio.className = 'text-2xl sm:text-3xl font-black text-indigo-400 tracking-wider';
            } else {
                statRatio.className = 'text-2xl sm:text-3xl font-black text-amber-400 tracking-wider';
            }
        } else {
            statRatio.textContent = '0.000';
            statPercent.textContent = '(0.0%)';
            statRatio.className = 'text-2xl sm:text-3xl font-black text-indigo-400 tracking-wider';
        }
    }

    function resetSimulation() {
        stopAutoFlip();
        totalFlips = 0;
        headsCount = 0;
        tailsCount = 0;
        chartDataPoints.length = 0;

        coinElem.classList.remove('flip-heads', 'flip-tails');
        coinElem.style.transform = 'rotateY(0deg)';
        lastResultText.textContent = '동전을 던져 실험을 시작하세요!';

        updateStatsUI();
        probabilityChart.update();
    }

    function toggleAutoFlip() {
        if (autoInterval) {
            stopAutoFlip();
        } else {
            autoBtnText.textContent = '⏸ 일시정지';
            autoBtnSub.textContent = '자동 시행 중';
            btnFlipAuto.classList.remove('bg-emerald-700', 'hover:bg-emerald-600');
            btnFlipAuto.classList.add('bg-amber-600', 'hover:bg-amber-500');

            autoInterval = setInterval(() => {
                runSimulation(50);
            }, 100);
        }
    }

    function stopAutoFlip() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        autoBtnText.textContent = '▶ 자동';
        autoBtnSub.textContent = '연속 시행';
        btnFlipAuto.classList.remove('bg-amber-600', 'hover:bg-amber-500');
        btnFlipAuto.classList.add('bg-emerald-700', 'hover:bg-emerald-600');
    }

    btnFlip1.addEventListener('click', () => { stopAutoFlip(); runSimulation(1); });
    btnFlip100.addEventListener('click', () => { stopAutoFlip(); runSimulation(100); });
    btnFlip1000.addEventListener('click', () => { stopAutoFlip(); runSimulation(1000); });
    btnFlipAuto.addEventListener('click', toggleAutoFlip);
    btnReset.addEventListener('click', resetSimulation);

    zoomToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            probabilityChart.options.scales.y.min = 0.4;
            probabilityChart.options.scales.y.max = 0.6;
            probabilityChart.options.scales.y.ticks.stepSize = 0.02;
        } else {
            probabilityChart.options.scales.y.min = 0;
            probabilityChart.options.scales.y.max = 1;
            probabilityChart.options.scales.y.ticks.stepSize = 0.1;
        }
        probabilityChart.update();
    });

});
