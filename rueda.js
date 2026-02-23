// ============================================
// 🎰 RUEDA DE LA FORTUNA - EL AREPERO
// Juego interactivo con premios
// ============================================

(function() {
    'use strict';

    // ===== CONFIGURACIÓN DE PREMIOS =====
    const PREMIOS = [
        { texto: '🥙 Arepa Gratis', color: '#2A5C3D', premio: 'AREPA-GRATIS', desc: '¡Una arepa completamente gratis!', probabilidad: 5 },
        { texto: '🥤 Bebida Free', color: '#C53A20', premio: 'BEBIDA-FREE', desc: '¡Bebida gratis con tu pedido!', probabilidad: 15 },
        { texto: '💰 20% OFF', color: '#D4AF37', premio: 'DESC20', desc: '20% de descuento en tu pedido', probabilidad: 20 },
        { texto: '🎉 2x1 Arepas', color: '#FF6B35', premio: 'AREPAS-2X1', desc: '¡Lleva 2 arepas por el precio de 1!', probabilidad: 10 },
        { texto: '🧀 Queso Extra', color: '#4285f4', premio: 'QUESO-EXTRA', desc: 'Queso extra gratis en tu arepa', probabilidad: 25 },
        { texto: '⭐ 15% OFF', color: '#9b59b6', premio: 'DESC15', desc: '15% de descuento en tu pedido', probabilidad: 20 },
        { texto: '🔥 Combo VIP', color: '#e74c3c', premio: 'COMBO-VIP', desc: '¡Combo VIP al precio especial!', probabilidad: 5 },
        { texto: '🌟 Topping Free', color: '#1abc9c', premio: 'TOPPING-FREE', desc: '¡Un topping gratis para tu arepa!', probabilidad: 25 },
    ];

    // ===== ESTADO DEL JUEGO =====
    const GameState = {
        instagram: false,
        google: false,
        share: false,
        spinsUsed: 0,
        maxSpins: 0,
        premiosGanados: [],
        spinning: false
    };

    // ===== VARIABLES =====
    let canvas, ctx;
    let currentAngle = 0;
    let isSpinning = false;
    const numSegments = PREMIOS.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    // ===== INICIALIZACIÓN =====
    function init() {
        loadProgress();
        setupCanvas();
        drawWheel();
        updateUI();
        console.log('🎰 Rueda de la Fortuna inicializada');
    }

    // ===== CANVAS DE LA RUEDA =====
    function setupCanvas() {
        canvas = document.getElementById('wheelCanvas');
        if (!canvas) return;
        
        const size = canvas.width;
        ctx = canvas.getContext('2d');
        
        drawWheel();
    }

    function drawWheel() {
        if (!canvas || !ctx) return;
        
        const size = canvas.width;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 5;

        ctx.clearRect(0, 0, size, size);

        for (let i = 0; i < numSegments; i++) {
            const startAngle = currentAngle + i * segmentAngle;
            const endAngle = startAngle + segmentAngle;

            // Dibujar segmento
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Degradado para cada segmento
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, lightenColor(PREMIOS[i].color, 30));
            gradient.addColorStop(1, PREMIOS[i].color);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Borde del segmento
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Texto del premio
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.font = `bold ${size < 300 ? '11px' : '13px'} Montserrat, sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            
            // Dividir texto si es largo
            const text = PREMIOS[i].texto;
            ctx.fillText(text, radius - 15, 5);
            
            ctx.restore();
        }

        // Círculo decorativo interior
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();
    }

    // ===== GIRAR LA RUEDA =====
    function spinWheel() {
        if (isSpinning) return;
        
        const missionsCompleted = getMissionsCompleted();
        if (missionsCompleted === 0) {
            showToast('🔒 Completa al menos 1 misión para girar', 'error');
            shakeElement(document.querySelector('.btn-girar'));
            return;
        }

        if (GameState.spinsUsed >= GameState.maxSpins) {
            showToast('🔒 Completa más misiones para ganar más giros', 'error');
            return;
        }

        isSpinning = true;
        GameState.spinning = true;
        
        const spinBtn = document.getElementById('btnGirar');
        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GIRANDO...';
        }

        // Ocultar resultado anterior
        const resultDiv = document.getElementById('wheelResult');
        if (resultDiv) resultDiv.classList.remove('show');

        // Calcular premio basado en probabilidad
        const premioIndex = selectPrizeByProbability();
        
        // Calcular ángulo objetivo
        const targetSegment = numSegments - premioIndex;
        const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 vueltas completas
        const targetAngle = extraSpins * 2 * Math.PI + targetSegment * segmentAngle + segmentAngle / 2 - Math.PI / 2;
        
        // Animación de giro
        const startAngle = currentAngle;
        const totalRotation = targetAngle - startAngle;
        const duration = 4000 + Math.random() * 2000; // 4-6 segundos
        const startTime = performance.now();

        playTickSound();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: desacelerar al final con efecto rebote
            const eased = easeOutCubic(progress);
            
            currentAngle = startAngle + totalRotation * eased;
            drawWheel();

            // Efecto de sonido tick-tick
            if (progress < 0.9 && Math.random() < 0.1) {
                playTickSound();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // ¡Terminó!
                isSpinning = false;
                GameState.spinning = false;
                GameState.spinsUsed++;
                
                revealPrize(premioIndex);
                saveProgress();
                updateUI();
            }
        }

        requestAnimationFrame(animate);
    }

    function selectPrizeByProbability() {
        const total = PREMIOS.reduce((sum, p) => sum + p.probabilidad, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < PREMIOS.length; i++) {
            random -= PREMIOS[i].probabilidad;
            if (random <= 0) return i;
        }
        return PREMIOS.length - 1;
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // ===== REVELAR PREMIO =====
    function revealPrize(index) {
        const premio = PREMIOS[index];
        const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
        const codigo = premio.premio + '-' + suffix;
        
        GameState.premiosGanados.push({
            premio: premio.texto,
            codigo: codigo,
            fecha: new Date().toISOString()
        });

        const resultDiv = document.getElementById('wheelResult');
        const resultEmoji = document.getElementById('resultEmoji');
        const resultTitle = document.getElementById('resultTitle');
        const resultDesc = document.getElementById('resultDesc');
        const resultCode = document.getElementById('resultCode');
        const reclaimLink = document.getElementById('reclaimLink');

        if (resultEmoji) resultEmoji.textContent = premio.texto.split(' ')[0];
        if (resultTitle) resultTitle.textContent = '🎊 ¡' + premio.texto + '!';
        if (resultDesc) resultDesc.textContent = premio.desc;
        if (resultCode) resultCode.textContent = codigo;
        if (reclaimLink) {
            reclaimLink.href = 'https://wa.me/18296403859?text=' + encodeURIComponent(
                '🎁 ¡Gané un premio en la Rueda de la Fortuna!\n\n' +
                '🏆 Premio: ' + premio.texto + '\n' +
                '🔑 Código: ' + codigo + '\n\n' +
                '¡Quiero reclamar mi premio!'
            );
        }

        setTimeout(() => {
            if (resultDiv) resultDiv.classList.add('show');
            createConfetti(60);
            createParticleExplosion();
            showToast('🎊 ¡Felicidades! Ganaste: ' + premio.texto, 'success');
        }, 300);

        // Actualizar botón
        const spinBtn = document.getElementById('btnGirar');
        if (spinBtn) {
            if (GameState.spinsUsed >= GameState.maxSpins) {
                spinBtn.disabled = true;
                spinBtn.innerHTML = '<i class="fas fa-check-circle"></i> ¡PREMIO OBTENIDO!';
            } else {
                spinBtn.disabled = false;
                spinBtn.innerHTML = '<i class="fas fa-sync-alt"></i> ¡GIRAR DE NUEVO!';
            }
        }

        saveProgress();
    }

    // ===== MISIONES =====
    function getMissionsCompleted() {
        let count = 0;
        if (GameState.instagram) count++;
        if (GameState.google) count++;
        if (GameState.share) count++;
        return count;
    }

    function attemptMission(type) {
        console.log('🔗 Abriendo enlace para misión:', type);
    }

    function verifyMission(type) {
        if (type === 'instagram') {
            if (GameState.instagram) {
                showToast('✅ Ya completaste esta misión', 'info');
                return;
            }
            GameState.instagram = true;
            GameState.maxSpins += 1;
            createConfetti(25);
            showToast('🎉 ¡Misión Instagram completada! +1 giro', 'success');
        }

        if (type === 'google') {
            if (GameState.google) {
                showToast('✅ Ya completaste esta misión', 'info');
                return;
            }
            GameState.google = true;
            GameState.maxSpins += 1;
            createConfetti(25);
            showToast('🎉 ¡Misión Google completada! +1 giro', 'success');
        }

        if (type === 'share') {
            if (GameState.share) {
                showToast('✅ Ya completaste esta misión', 'info');
                return;
            }
            GameState.share = true;
            GameState.maxSpins += 1;
            createConfetti(25);
            showToast('🎉 ¡Misión Compartir completada! +1 giro', 'success');
        }

        saveProgress();
        updateUI();
    }

    function sharePage() {
        const shareData = {
            title: 'EL AREPERO - Las mejores arepas de Punta Cana',
            text: '🥙 ¡Descubrí las mejores arepas venezolanas en Punta Cana! Jugá la Rueda de la Fortuna y ganá premios increíbles. @areperopuntocom',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).then(() => {
                // Verificar después de compartir
            }).catch(() => {
                copyToClipboard(shareData.text + ' ' + shareData.url);
            });
        } else {
            // Fallback: copiar al portapapeles
            copyToClipboard(shareData.text + ' ' + shareData.url);
            showToast('📋 ¡Enlace copiado! Pégalo en tus redes', 'success');
        }
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // ===== ACTUALIZAR UI =====
    function updateUI() {
        const missions = getMissionsCompleted();
        const totalMissions = 3;
        const progress = Math.round((missions / totalMissions) * 100);
        const spinsLeft = GameState.maxSpins - GameState.spinsUsed;

        // Progress bar
        const fill = document.getElementById('ruedaProgressFill');
        const text = document.getElementById('ruedaProgressText');
        if (fill) fill.style.width = progress + '%';
        if (text) text.textContent = missions + '/' + totalMissions + ' misiones';

        // Status de la rueda
        const status = document.getElementById('wheelStatus');
        if (status) {
            if (missions === 0) {
                status.innerHTML = '<i class="fas fa-lock"></i> Completa misiones para desbloquear giros';
            } else if (spinsLeft > 0) {
                status.innerHTML = '<i class="fas fa-gift"></i> ¡Tienes <strong>' + spinsLeft + ' giro' + (spinsLeft > 1 ? 's' : '') + '</strong> disponible' + (spinsLeft > 1 ? 's' : '') + '!';
            } else {
                status.innerHTML = '<i class="fas fa-check-circle"></i> ¡Ya usaste todos tus giros! Revisa tu premio.';
            }
        }

        // Botón girar
        const spinBtn = document.getElementById('btnGirar');
        if (spinBtn) {
            if (missions === 0) {
                spinBtn.disabled = true;
                spinBtn.innerHTML = '<i class="fas fa-lock"></i> BLOQUEADO';
                spinBtn.classList.remove('unlocked');
            } else if (spinsLeft > 0 && !isSpinning) {
                spinBtn.disabled = false;
                spinBtn.innerHTML = '<i class="fas fa-sync-alt"></i> ¡GIRAR! (' + spinsLeft + ')';
                spinBtn.classList.add('unlocked');
            } else if (spinsLeft <= 0) {
                spinBtn.disabled = true;
                spinBtn.innerHTML = '<i class="fas fa-check-circle"></i> SIN GIROS';
                spinBtn.classList.remove('unlocked');
            }
        }

        // Misión Instagram
        const cardIg = document.getElementById('misionInstagram');
        const btnIg = document.getElementById('btnMisionIg');
        if (GameState.instagram) {
            if (cardIg) cardIg.classList.add('completed');
            if (btnIg) { btnIg.disabled = true; btnIg.innerHTML = '<i class="fas fa-check"></i> Completado'; }
        }

        // Misión Google
        const cardGoogle = document.getElementById('misionGoogle');
        const btnGoogle = document.getElementById('btnMisionGoogle');
        if (GameState.google) {
            if (cardGoogle) cardGoogle.classList.add('completed');
            if (btnGoogle) { btnGoogle.disabled = true; btnGoogle.innerHTML = '<i class="fas fa-check"></i> Completado'; }
        }

        // Misión Compartir
        const cardShare = document.getElementById('misionShare');
        const btnShare = document.getElementById('btnMisionShare');
        if (GameState.share) {
            if (cardShare) cardShare.classList.add('completed');
            if (btnShare) { btnShare.disabled = true; btnShare.innerHTML = '<i class="fas fa-check"></i> Completado'; }
        }
    }

    // ===== EFECTOS VISUALES =====
    function createConfetti(amount) {
        const colors = ['#FFD166', '#2A5C3D', '#C53A20', '#D4AF37', '#FF6B35', '#9b59b6', '#1abc9c', '#e74c3c'];
        
        for (let i = 0; i < amount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                const size = Math.random() * 10 + 5;
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.animationDelay = Math.random() * 0.3 + 's';
                
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }

    function createParticleExplosion() {
        const colors = ['#FFD166', '#FF6B35', '#2A5C3D', '#D4AF37'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            const angle = (Math.PI * 2 / 30) * i;
            const dist = 100 + Math.random() * 200;
            particle.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1200);
        }
    }

    function playTickSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.05);
        } catch(e) {
            // Audio not supported
        }
    }

    function shakeElement(el) {
        if (!el) return;
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'shake 0.5s ease';
        setTimeout(() => el.style.animation = '', 500);
    }

    // ===== TOAST =====
    function showToast(message, type) {
        const existing = document.querySelector('.rueda-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'rueda-toast ' + (type || 'success');
        toast.innerHTML = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // ===== PERSISTENCIA =====
    function saveProgress() {
        localStorage.setItem('areperoRueda', JSON.stringify(GameState));
    }

    function loadProgress() {
        const saved = localStorage.getItem('areperoRueda');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                GameState.instagram = data.instagram || false;
                GameState.google = data.google || false;
                GameState.share = data.share || false;
                GameState.spinsUsed = data.spinsUsed || 0;
                GameState.maxSpins = data.maxSpins || 0;
                GameState.premiosGanados = data.premiosGanados || [];
            } catch(e) {
                console.log('Error cargando progreso');
            }
        }
    }

    // ===== UTILIDADES =====
    function lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // ===== MODAL CONTROL =====
    function openModal() {
        const modal = document.getElementById('ruedaModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Inicializar canvas si no existe
            if (!canvas) {
                setTimeout(() => {
                    setupCanvas();
                    updateUI();
                }, 100);
            }
        }
    }

    function closeModal() {
        const modal = document.getElementById('ruedaModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // ===== RESET (para testing) =====
    function resetGame() {
        localStorage.removeItem('areperoRueda');
        GameState.instagram = false;
        GameState.google = false;
        GameState.share = false;
        GameState.spinsUsed = 0;
        GameState.maxSpins = 0;
        GameState.premiosGanados = [];
        currentAngle = 0;
        
        // Reset UI de misiones
        ['misionInstagram', 'misionGoogle', 'misionShare'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('completed');
        });
        ['btnMisionIg', 'btnMisionGoogle', 'btnMisionShare'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.disabled = false; }
        });

        const resultDiv = document.getElementById('wheelResult');
        if (resultDiv) resultDiv.classList.remove('show');

        drawWheel();
        updateUI();
        showToast('🔄 Juego reiniciado', 'info');
    }

    // ===== EXPONER FUNCIONES GLOBALES =====
    window.abrirRueda = openModal;
    window.cerrarRueda = closeModal;
    window.girarRueda = spinWheel;
    window.verificarMisionRueda = verifyMission;
    window.intentarMisionRueda = attemptMission;
    window.compartirPagina = sharePage;
    window.resetearJuego = resetGame;

    // ===== EVENTOS =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    document.addEventListener('click', function(e) {
        const modal = document.getElementById('ruedaModal');
        if (modal && modal.classList.contains('active') && e.target === modal) {
            closeModal();
        }
    });

    // ===== AUTO-INIT =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🎰 Script de Rueda de la Fortuna cargado');
})();
