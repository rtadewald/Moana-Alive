let cameraStream = null;
let capturedImageFile = null;

document.addEventListener('DOMContentLoaded', function() {
    loadVideoGallery();
    loadAudioGallery();
    loadVideoSelector();
    loadAudioSelector();
    loadSyncedGallery();
    
    initCameraControls();
    initSpeedSlider();
    
    document.getElementById('videoForm').addEventListener('submit', handleVideoSubmit);
    document.getElementById('audioForm').addEventListener('submit', handleAudioSubmit);
    document.getElementById('lipsyncForm').addEventListener('submit', handleLipsyncSubmit);
});

async function handleVideoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const resultDiv = document.getElementById('videoResult');
    const fileInput = document.getElementById('fileInput');
    
    // Verificar se há imagem (capturada ou selecionada)
    if (capturedImageFile) {
        formData.set('file', capturedImageFile, 'captured_photo.jpg');
    } else if (!fileInput.files.length) {
        alert('❌ Por favor, selecione uma imagem ou tire uma foto!');
        return;
    }
    
    showLoading(form, 'Gerando vídeo...');
    
    try {
        const response = await fetch('/generate-video', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ Vídeo gerado com sucesso!
                    <video controls class="result-video d-block mt-2">
                        <source src="/${result.video_path}" type="video/mp4">
                    </video>
                </div>
            `;
            loadVideoGallery();
            loadVideoSelector();
            
            // Limpar preview após sucesso
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('fileInput').value = '';
            document.getElementById('mobileCameraInput').value = '';
            capturedImageFile = null;
            document.getElementById('cameraBtn').classList.remove('active');
            document.getElementById('mobileCameraBtn').classList.remove('active');
            document.getElementById('fileBtn').classList.remove('active');
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erro: ${result.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erro de conexão: ${error.message}</div>`;
    }
    
    hideLoading(form);
}

async function handleAudioSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const resultDiv = document.getElementById('audioResult');
    
    showLoading(form, 'Gerando áudio...');
    
    try {
        const response = await fetch('/generate-audio', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ Áudio gerado com sucesso!
                    <audio controls class="result-audio d-block mt-2">
                        <source src="/${result.audio_path}" type="audio/wav">
                    </audio>
                </div>
            `;
            loadAudioGallery();
            loadAudioSelector();
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erro: ${result.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erro de conexão: ${error.message}</div>`;
    }
    
    hideLoading(form);
}

async function handleLipsyncSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const resultDiv = document.getElementById('lipsyncResult');
    
    showLoading(form, 'Sincronizando...');
    
    try {
        const response = await fetch('/lipsync', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    ✅ Sincronização concluída!
                    <video controls class="result-video d-block mt-2">
                        <source src="/${result.video_path}" type="video/mp4">
                    </video>
                </div>
            `;
            loadSyncedGallery();
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erro: ${result.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erro de conexão: ${error.message}</div>`;
    }
    
    hideLoading(form);
}


function showLoading(form, message) {
    form.classList.add('loading');
    const button = form.querySelector('button[type="submit"]');
    button.textContent = message;
    button.disabled = true;
}

function hideLoading(form) {
    form.classList.remove('loading');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = false;
    
    const originalText = button.textContent.includes('Gerar Vídeo') ? '🎬 Gerar Vídeo' :
                        button.textContent.includes('Gerar Áudio') ? '🎤 Gerar Áudio' : '💋 Sincronizar';
    button.textContent = originalText;
}

async function loadVideoGallery() {
    try {
        const response = await fetch('/list-videos-with-metadata');
        const data = await response.json();
        const gallery = document.getElementById('videoGallery');
        
        if (data.videos.length === 0) {
            gallery.innerHTML = '<div class="col-12 text-center text-muted">Nenhum vídeo gerado ainda</div>';
            return;
        }
        
        gallery.innerHTML = '';
        
        data.videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'col-md-6 col-lg-4 mb-3';
            
            videoCard.innerHTML = `
                <div class="card h-100">
                    <video class="card-img-top" style="height: 200px; object-fit: cover;" controls>
                        <source src="/${video.video_path}" type="video/mp4">
                    </video>
                    <div class="card-body p-2">
                        <h6 class="card-title mb-1">📸 ${video.original_filename}</h6>
                        <p class="card-text small mb-1"><strong>Prompt:</strong> ${video.prompt}</p>
                        <p class="card-text small text-muted mb-2">⏱️ ${video.duration || 6}s</p>
                        <button class="btn btn-sm btn-danger w-100" onclick="deleteVideo('${video.id}')">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
            `;
            
            gallery.appendChild(videoCard);
        });
    } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        document.getElementById('videoGallery').innerHTML = 
            '<div class="col-12 text-center text-danger">Erro ao carregar galeria</div>';
    }
}

async function loadAudioGallery() {
    try {
        const response = await fetch('/list-audios-with-metadata');
        const data = await response.json();
        const gallery = document.getElementById('audioGallery');
        
        if (data.audios.length === 0) {
            gallery.innerHTML = '<div class="col-12 text-center text-muted">Nenhum áudio gerado ainda</div>';
            return;
        }
        
        gallery.innerHTML = '';
        
        const voiceNames = {
            'Lively_Girl': 'Menina Animada',
            'Warm_Male': 'Homem Caloroso',
            'Gentle_Female': 'Mulher Gentil'
        };
        
        data.audios.forEach(audio => {
            const audioCard = document.createElement('div');
            audioCard.className = 'col-md-6 col-lg-4 mb-3';
            
            audioCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-body p-3">
                        <div class="audio-info mb-3">
                            <h6 class="card-title mb-2">💭 "${audio.text}"</h6>
                            <p class="card-text small mb-2">🎤 ${voiceNames[audio.voice_id] || audio.voice_id}</p>
                        </div>
                        <audio controls class="w-100 mb-3">
                            <source src="/${audio.audio_path}" type="audio/wav">
                        </audio>
                        <button class="btn btn-sm btn-danger w-100" onclick="deleteAudio('${audio.id}')">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
            `;
            
            gallery.appendChild(audioCard);
        });
    } catch (error) {
        console.error('Erro ao carregar galeria de áudios:', error);
        document.getElementById('audioGallery').innerHTML = 
            '<div class="col-12 text-center text-danger">Erro ao carregar áudios</div>';
    }
}

async function loadVideoSelector() {
    try {
        const response = await fetch('/list-videos-with-metadata');
        const data = await response.json();
        const selector = document.getElementById('videoSelector');
        
        if (data.videos.length === 0) {
            selector.innerHTML = '<div class="text-center text-muted">Nenhum vídeo disponível</div>';
            return;
        }
        
        selector.innerHTML = '';
        
        data.videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'selector-item';
            item.dataset.path = video.video_path;
            
            item.innerHTML = `
                <video class="selector-video" muted>
                    <source src="/${video.video_path}" type="video/mp4">
                </video>
                <div class="mt-2">
                    <small><strong>📸 ${video.original_filename}</strong></small><br>
                    <small class="text-muted">💭 ${video.prompt}</small><br>
                    <small class="text-muted">⏱️ ${video.duration || 6}s</small>
                </div>
            `;
            
            item.addEventListener('click', function() {
                document.querySelectorAll('.video-selector .selector-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('selectedVideoPath').value = this.dataset.path;
            });
            
            selector.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar seletor de vídeos:', error);
        document.getElementById('videoSelector').innerHTML = 
            '<div class="text-center text-danger">Erro ao carregar vídeos</div>';
    }
}

async function loadAudioSelector() {
    try {
        const response = await fetch('/list-audios-with-metadata');
        const data = await response.json();
        const selector = document.getElementById('audioSelector');
        
        if (data.audios.length === 0) {
            selector.innerHTML = '<div class="text-center text-muted">Nenhum áudio disponível</div>';
            return;
        }
        
        selector.innerHTML = '';
        
        data.audios.forEach(audio => {
            const item = document.createElement('div');
            item.className = 'selector-item';
            item.dataset.path = audio.audio_path;
            
            const voiceNames = {
                'Lively_Girl': 'Menina Animada',
                'Warm_Male': 'Homem Caloroso',
                'Gentle_Female': 'Mulher Gentil'
            };
            
            item.innerHTML = `
                <div class="selector-audio-info">
                    <div><strong>💭 "${audio.text}"</strong></div>
                    <div class="mt-1 d-flex justify-content-between align-items-center">
                        <div>
                            <small>🎤 ${voiceNames[audio.voice_id] || audio.voice_id}</small>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="deleteAudio('${audio.id}')">🗑️</button>
                    </div>
                </div>
                <audio controls class="w-100 mt-2" style="height: 30px;">
                    <source src="/${audio.audio_path}" type="audio/wav">
                </audio>
            `;
            
            item.addEventListener('click', function() {
                document.querySelectorAll('.audio-selector .selector-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('selectedAudioPath').value = this.dataset.path;
            });
            
            selector.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar seletor de áudios:', error);
        document.getElementById('audioSelector').innerHTML = 
            '<div class="text-center text-danger">Erro ao carregar áudios</div>';
    }
}

async function loadSyncedGallery() {
    try {
        const response = await fetch('/list-synced-videos');
        const data = await response.json();
        const gallery = document.getElementById('syncedGallery');
        
        if (data.videos.length === 0) {
            gallery.innerHTML = '<div class="col-12 text-center text-muted">Nenhum vídeo sincronizado ainda</div>';
            return;
        }
        
        gallery.innerHTML = '';
        
        data.videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'col-md-6 col-lg-4 mb-3';
            
            videoCard.innerHTML = `
                <div class="card h-100">
                    <video class="card-img-top" style="height: 200px; object-fit: cover;" controls>
                        <source src="/${video.video_path}" type="video/mp4">
                    </video>
                    <div class="card-body p-2">
                        <h6 class="card-title mb-1">📸 ${video.original_filename}</h6>
                        <p class="card-text small mb-1"><strong>Vídeo:</strong> ${video.video_prompt}</p>
                        <p class="card-text small mb-2"><strong>Áudio:</strong> ${video.audio_text}</p>
                        <button class="btn btn-sm btn-danger w-100" onclick="deleteSyncedVideo('${video.id}')">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
            `;
            
            gallery.appendChild(videoCard);
        });
    } catch (error) {
        console.error('Erro ao carregar galeria de sincronizados:', error);
        document.getElementById('syncedGallery').innerHTML = 
            '<div class="col-12 text-center text-danger">Erro ao carregar vídeos sincronizados</div>';
    }
}

async function deleteVideo(videoId) {
    if (!confirm('Tem certeza que deseja deletar este vídeo?')) return;
    
    try {
        const response = await fetch(`/delete-video/${videoId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            loadVideoGallery();
            loadVideoSelector();
        } else {
            alert('❌ Erro ao deletar vídeo: ' + result.error);
        }
    } catch (error) {
        alert('❌ Erro de conexão: ' + error.message);
    }
}

async function deleteAudio(audioId) {
    if (!confirm('Tem certeza que deseja deletar este áudio?')) return;
    
    try {
        const response = await fetch(`/delete-audio/${audioId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            loadAudioGallery();
            loadAudioSelector();
        } else {
            alert('❌ Erro ao deletar áudio: ' + result.error);
        }
    } catch (error) {
        alert('❌ Erro de conexão: ' + error.message);
    }
}

async function deleteSyncedVideo(syncedId) {
    if (!confirm('Tem certeza que deseja deletar este vídeo sincronizado?')) return;
    
    try {
        const response = await fetch(`/delete-synced/${syncedId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            loadSyncedGallery();
        } else {
            alert('❌ Erro ao deletar vídeo: ' + result.error);
        }
    } catch (error) {
        alert('❌ Erro de conexão: ' + error.message);
    }
}

function initCameraControls() {
    const cameraBtn = document.getElementById('cameraBtn');
    const mobileCameraBtn = document.getElementById('mobileCameraBtn');
    const fileBtn = document.getElementById('fileBtn');
    const fileInput = document.getElementById('fileInput');
    const mobileCameraInput = document.getElementById('mobileCameraInput');
    const cameraArea = document.getElementById('cameraArea');
    const cameraVideo = document.getElementById('cameraVideo');
    const captureBtn = document.getElementById('captureBtn');
    const stopCameraBtn = document.getElementById('stopCameraBtn');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    // Função auxiliar segura para acessar getUserMedia
    function safeGetUserMedia(constraints) {
        if (!navigator.mediaDevices) {
            return Promise.reject(new Error('navigator.mediaDevices não está disponível'));
        }
        if (!navigator.mediaDevices.getUserMedia) {
            return Promise.reject(new Error('getUserMedia não está disponível'));
        }
        return navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Verificar compatibilidade da câmera
    
    // Verificar se câmera está disponível - versão simplificada
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    // Detectar se é dispositivo móvel
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Configurar visibilidade dos botões baseado no dispositivo
    if (isMobile) {
        // Em mobile, priorizar câmera nativa
        mobileCameraBtn.classList.remove('btn-outline-success');
        mobileCameraBtn.classList.add('btn-success');
        mobileCameraBtn.innerHTML = '📱 Usar Câmera';
    }
    
    if (!hasMediaDevices) {
        cameraBtn.disabled = true;
        cameraBtn.innerHTML = '📷 Indisponível';
        cameraBtn.title = 'Câmera web não disponível. Use "📱 Câmera Celular" em dispositivos móveis.';
        
        if (!isMobile) {
            document.getElementById('httpsWarning').style.display = 'block';
            document.querySelector('#httpsWarning small').innerHTML = 
                `⚠️ <strong>Câmera web indisponível.</strong> Em dispositivos móveis, use o botão "📱 Câmera Celular".`;
        }
    }

    // Função para lidar com clique na câmera
    async function handleCameraClick() {
        try {
            cameraStream = await safeGetUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            cameraVideo.srcObject = cameraStream;
            
            cameraArea.style.display = 'block';
            fileInput.style.display = 'none';
            imagePreview.style.display = 'none';
            
            cameraBtn.classList.add('active');
            fileBtn.classList.remove('active');
        } catch (error) {
            let errorMessage = 'Erro desconhecido';
            
            switch(error.name) {
                case 'NotAllowedError':
                    errorMessage = 'Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.';
                    break;
                case 'NotFoundError':
                    errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
                    break;
                case 'NotReadableError':
                    errorMessage = 'Câmera está sendo usada por outro aplicativo.';
                    break;
                case 'OverconstrainedError':
                    errorMessage = 'Configurações de câmera não suportadas.';
                    break;
                case 'SecurityError':
                    errorMessage = 'Acesso à câmera bloqueado. Use HTTPS ou localhost.';
                    break;
                default:
                    errorMessage = error.message || 'Erro ao acessar câmera';
            }
            
            alert('❌ ' + errorMessage);
        }
    }

    // Botão da câmera web
    cameraBtn.addEventListener('click', handleCameraClick);
    
    // Botão da câmera móvel
    mobileCameraBtn.addEventListener('click', function() {
        stopCamera();
        cameraArea.style.display = 'none';
        imagePreview.style.display = 'none';
        
        mobileCameraBtn.classList.add('active');
        cameraBtn.classList.remove('active');
        fileBtn.classList.remove('active');
        
        mobileCameraInput.click();
    });
    
    // Input da câmera móvel
    mobileCameraInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            capturedImageFile = file; // Usar a foto da câmera móvel
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Botão de arquivo
    fileBtn.addEventListener('click', function() {
        stopCamera();
        fileInput.style.display = 'block';
        cameraArea.style.display = 'none';
        
        fileBtn.classList.add('active');
        cameraBtn.classList.remove('active');
        mobileCameraBtn.classList.remove('active');
        
        fileInput.click();
    });
    
    // Input de arquivo
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
                capturedImageFile = null; // Limpar foto capturada
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Capturar foto
    captureBtn.addEventListener('click', function() {
        const canvas = document.getElementById('cameraCanvas');
        const context = canvas.getContext('2d');
        
        canvas.width = cameraVideo.videoWidth;
        canvas.height = cameraVideo.videoHeight;
        
        context.drawImage(cameraVideo, 0, 0);
        
        // Converter para blob
        canvas.toBlob(function(blob) {
            capturedImageFile = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' });
            
            // Mostrar preview
            previewImg.src = canvas.toDataURL();
            imagePreview.style.display = 'block';
            
            // Parar câmera
            stopCamera();
        }, 'image/jpeg', 0.8);
    });
    
    // Parar câmera
    stopCameraBtn.addEventListener('click', stopCamera);
    
    // Remover imagem
    removeImageBtn.addEventListener('click', function() {
        imagePreview.style.display = 'none';
        fileInput.value = '';
        mobileCameraInput.value = '';
        capturedImageFile = null;
        cameraBtn.classList.remove('active');
        mobileCameraBtn.classList.remove('active');
        fileBtn.classList.remove('active');
    });
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('cameraArea').style.display = 'none';
}

function initSpeedSlider() {
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', function() {
            speedValue.textContent = this.value + 'x';
        });
    }
}
