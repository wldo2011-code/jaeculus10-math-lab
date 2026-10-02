// Math Lab Hub - Lesson 02. 피타고라스 정리와 두 점 사이의 거리 JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('gridCanvas');
    const ctxCanvas = canvas.getContext('2d');

    const pointACoordsElem = document.getElementById('point-a-coords');
    const pointBCoordsElem = document.getElementById('point-b-coords');
    const calcBaseElem = document.getElementById('calc-base');
    const calcHeightElem = document.getElementById('calc-height');
    const calcPythagorasExprElem = document.getElementById('calc-pythagoras-expr');
    const calcCSquaredElem = document.getElementById('calc-c-squared');
    const calcDistanceSqrtElem = document.getElementById('calc-distance-sqrt');
    const calcDistanceApproxElem = document.getElementById('calc-distance-approx');

    const snapGridToggle = document.getElementById('snap-grid-toggle');
    const btnPreset345 = document.getElementById('btn-preset-345');
    const btnPreset51213 = document.getElementById('btn-preset-51213');
    const btnPresetHorizontal = document.getElementById('btn-preset-horizontal');
    const btnPresetReset = document.getElementById('btn-preset-reset');

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

    // Coordinate state (-8 to +8)
    let pointA = { x: -3, y: -2 };
    let pointB = { x: 3, y: 4 };

    // Canvas scaling state
    let width = 500;
    let height = 500;
    const gridRange = 8;
    let originX = 250;
    let originY = 250;
    let stepSize = 30;

    // Dragging State
    let draggingPoint = null; // 'A' or 'B' or null

    function resizeCanvas() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        const dpr = window.devicePixelRatio || 1;
        width = rect.width;
        height = rect.height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctxCanvas.scale(dpr, dpr);

        originX = width / 2;
        originY = height / 2;
        stepSize = (Math.min(width, height) * 0.42) / gridRange;

        drawPythagorasCanvas();
    }

    function gridToCanvas(gx, gy) {
        return {
            cx: originX + gx * stepSize,
            cy: originY - gy * stepSize
        };
    }

    function canvasToGrid(cx, cy) {
        let gx = (cx - originX) / stepSize;
        let gy = (originY - cy) / stepSize;

        if (snapGridToggle.checked) {
            gx = Math.round(gx);
            gy = Math.round(gy);
        } else {
            gx = Math.round(gx * 10) / 10;
            gy = Math.round(gy * 10) / 10;
        }

        gx = Math.max(-gridRange, Math.min(gridRange, gx));
        gy = Math.max(-gridRange, Math.min(gridRange, gy));

        return { gx, gy };
    }

    function drawPythagorasCanvas() {
        ctxCanvas.clearRect(0, 0, width, height);

        // 1. Grid Lines
        ctxCanvas.lineWidth = 1;
        ctxCanvas.strokeStyle = '#1e293b';

        for (let i = -gridRange; i <= gridRange; i++) {
            const px = originX + i * stepSize;
            ctxCanvas.beginPath();
            ctxCanvas.moveTo(px, 0);
            ctxCanvas.lineTo(px, height);
            ctxCanvas.stroke();

            const py = originY - i * stepSize;
            ctxCanvas.beginPath();
            ctxCanvas.moveTo(0, py);
            ctxCanvas.lineTo(width, py);
            ctxCanvas.stroke();
        }

        // 2. Axes
        ctxCanvas.lineWidth = 2;
        ctxCanvas.strokeStyle = '#475569';

        ctxCanvas.beginPath();
        ctxCanvas.moveTo(0, originY);
        ctxCanvas.lineTo(width, originY);
        ctxCanvas.stroke();

        ctxCanvas.beginPath();
        ctxCanvas.moveTo(originX, 0);
        ctxCanvas.lineTo(originX, height);
        ctxCanvas.stroke();

        ctxCanvas.fillStyle = '#64748b';
        ctxCanvas.font = '11px sans-serif';
        ctxCanvas.textAlign = 'center';
        ctxCanvas.textBaseline = 'top';

        for (let i = -gridRange; i <= gridRange; i++) {
            if (i === 0) continue;
            const px = originX + i * stepSize;
            if (px > 20 && px < width - 20) {
                ctxCanvas.fillText(i.toString(), px, originY + 4);
            }
            const py = originY - i * stepSize;
            if (py > 20 && py < height - 20) {
                ctxCanvas.fillText(i.toString(), originX - 12, py - 6);
            }
        }
        ctxCanvas.fillText('0', originX - 10, originY + 4);

        // 3. Triangle Points
        const posA = gridToCanvas(pointA.x, pointA.y);
        const posB = gridToCanvas(pointB.x, pointB.y);
        const posC = gridToCanvas(pointB.x, pointA.y);

        const baseLen = Math.abs(pointB.x - pointA.x);
        const heightLen = Math.abs(pointB.y - pointA.y);

        // 4. Triangle Sides
        if (baseLen > 0 && heightLen > 0) {
            ctxCanvas.lineWidth = 3;
            ctxCanvas.strokeStyle = '#38bdf8';
            ctxCanvas.setLineDash([5, 4]);
            ctxCanvas.beginPath();
            ctxCanvas.moveTo(posA.cx, posA.cy);
            ctxCanvas.lineTo(posC.cx, posC.cy);
            ctxCanvas.stroke();

            ctxCanvas.strokeStyle = '#34d399';
            ctxCanvas.beginPath();
            ctxCanvas.moveTo(posC.cx, posC.cy);
            ctxCanvas.lineTo(posB.cx, posB.cy);
            ctxCanvas.stroke();

            ctxCanvas.setLineDash([]);

            // Right Angle Square
            const rightAngleSize = 14;
            const dirX = pointA.x < pointB.x ? -1 : 1;
            const dirY = pointA.y < pointB.y ? 1 : -1;

            ctxCanvas.lineWidth = 1.5;
            ctxCanvas.strokeStyle = '#f43f5e';
            ctxCanvas.beginPath();
            ctxCanvas.moveTo(posC.cx + dirX * rightAngleSize, posC.cy);
            ctxCanvas.lineTo(posC.cx + dirX * rightAngleSize, posC.cy + dirY * rightAngleSize);
            ctxCanvas.lineTo(posC.cx, posC.cy + dirY * rightAngleSize);
            ctxCanvas.stroke();
        }

        // 5. Hypotenuse Segment AB
        ctxCanvas.lineWidth = 4;
        ctxCanvas.strokeStyle = '#fbbf24';
        ctxCanvas.beginPath();
        ctxCanvas.moveTo(posA.cx, posA.cy);
        ctxCanvas.lineTo(posB.cx, posB.cy);
        ctxCanvas.stroke();

        // 6. Labels
        if (baseLen > 0) {
            ctxCanvas.fillStyle = '#38bdf8';
            ctxCanvas.font = 'bold 12px sans-serif';
            const labelX = (posA.cx + posC.cx) / 2;
            const labelY = posC.cy + (pointA.y < pointB.y ? 14 : -18);
            ctxCanvas.fillText(`가로: ${baseLen.toFixed(snapGridToggle.checked ? 0 : 1)}`, labelX, labelY);
        }

        if (heightLen > 0) {
            ctxCanvas.fillStyle = '#34d399';
            ctxCanvas.font = 'bold 12px sans-serif';
            const labelX = posC.cx + (pointA.x < pointB.x ? 14 : -35);
            const labelY = (posB.cy + posC.cy) / 2;
            ctxCanvas.fillText(`세로: ${heightLen.toFixed(snapGridToggle.checked ? 0 : 1)}`, labelX, labelY);
        }

        const dist = Math.sqrt(baseLen * baseLen + heightLen * heightLen);
        ctxCanvas.fillStyle = '#fbbf24';
        ctxCanvas.font = 'bold 13px sans-serif';
        const midX = (posA.cx + posB.cx) / 2;
        const midY = (posA.cy + posB.cy) / 2 - 12;
        ctxCanvas.fillText(`d = ${dist.toFixed(2)}`, midX, midY);

        // 7. Handles A and B
        ctxCanvas.beginPath();
        ctxCanvas.arc(posA.cx, posA.cy, 10, 0, Math.PI * 2);
        ctxCanvas.fillStyle = '#6366f1';
        ctxCanvas.fill();
        ctxCanvas.lineWidth = 3;
        ctxCanvas.strokeStyle = '#ffffff';
        ctxCanvas.stroke();

        ctxCanvas.fillStyle = '#818cf8';
        ctxCanvas.font = 'bold 13px sans-serif';
        ctxCanvas.fillText(`A(${pointA.x}, ${pointA.y})`, posA.cx, posA.cy - 16);

        ctxCanvas.beginPath();
        ctxCanvas.arc(posB.cx, posB.cy, 10, 0, Math.PI * 2);
        ctxCanvas.fillStyle = '#f59e0b';
        ctxCanvas.fill();
        ctxCanvas.lineWidth = 3;
        ctxCanvas.strokeStyle = '#ffffff';
        ctxCanvas.stroke();

        ctxCanvas.fillStyle = '#fbbf24';
        ctxCanvas.font = 'bold 13px sans-serif';
        ctxCanvas.fillText(`B(${pointB.x}, ${pointB.y})`, posB.cx, posB.cy - 16);

        updatePythagorasUI(baseLen, heightLen, dist);
    }

    function updatePythagorasUI(base, height, dist) {
        pointACoordsElem.textContent = `( ${pointA.x} , ${pointA.y} )`;
        pointBCoordsElem.textContent = `( ${pointB.x} , ${pointB.y} )`;

        calcBaseElem.textContent = `|${pointB.x} - (${pointA.x})| = ${base.toFixed(snapGridToggle.checked ? 0 : 1)}`;
        calcHeightElem.textContent = `|${pointB.y} - (${pointA.y})| = ${height.toFixed(snapGridToggle.checked ? 0 : 1)}`;

        const baseSq = base * base;
        const heightSq = height * height;
        const cSq = baseSq + heightSq;

        calcPythagorasExprElem.textContent = `${base.toFixed(snapGridToggle.checked ? 0 : 1)}² + ${height.toFixed(snapGridToggle.checked ? 0 : 1)}² = ${baseSq.toFixed(1)} + ${heightSq.toFixed(1)} = ${cSq.toFixed(1)}`;
        calcCSquaredElem.textContent = cSq.toFixed(snapGridToggle.checked ? 0 : 1);

        if (Number.isInteger(cSq) && Number.isInteger(Math.sqrt(cSq))) {
            calcDistanceSqrtElem.textContent = `√${cSq} = ${Math.sqrt(cSq)}`;
            calcDistanceApproxElem.textContent = `(정수 피타고라스 수!)`;
        } else {
            calcDistanceSqrtElem.textContent = `√${cSq.toFixed(1)}`;
            calcDistanceApproxElem.textContent = `≈ ${dist.toFixed(3)}`;
        }
    }

    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            cx: clientX - rect.left,
            cy: clientY - rect.top
        };
    }

    function onPointerDown(e) {
        const pos = getPointerPos(e);
        const posA = gridToCanvas(pointA.x, pointA.y);
        const posB = gridToCanvas(pointB.x, pointB.y);

        const distA = Math.hypot(pos.cx - posA.cx, pos.cy - posA.cy);
        const distB = Math.hypot(pos.cx - posB.cx, pos.cy - posB.cy);

        if (distA < 25) {
            draggingPoint = 'A';
        } else if (distB < 25) {
            draggingPoint = 'B';
        }
    }

    function onPointerMove(e) {
        if (!draggingPoint) return;
        e.preventDefault();

        const pos = getPointerPos(e);
        const grid = canvasToGrid(pos.cx, pos.cy);

        if (draggingPoint === 'A') {
            pointA.x = grid.gx;
            pointA.y = grid.gy;
        } else if (draggingPoint === 'B') {
            pointB.x = grid.gx;
            pointB.y = grid.gy;
        }

        drawPythagorasCanvas();
    }

    function onPointerUp() {
        draggingPoint = null;
    }

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    snapGridToggle.addEventListener('change', drawPythagorasCanvas);

    btnPreset345.addEventListener('click', () => {
        pointA = { x: 0, y: 0 };
        pointB = { x: 3, y: 4 };
        drawPythagorasCanvas();
    });

    btnPreset51213.addEventListener('click', () => {
        pointA = { x: -3, y: -4 };
        pointB = { x: 2, y: 8 };
        drawPythagorasCanvas();
    });

    btnPresetHorizontal.addEventListener('click', () => {
        pointA = { x: -5, y: 2 };
        pointB = { x: 4, y: 2 };
        drawPythagorasCanvas();
    });

    btnPresetReset.addEventListener('click', () => {
        pointA = { x: -3, y: -2 };
        pointB = { x: 3, y: 4 };
        drawPythagorasCanvas();
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

});
