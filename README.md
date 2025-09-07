# 🎬 Moana Alive

**Dê vida aos brinquedos das crianças!** Uma aplicação web que transforma fotos de brinquedos em vídeos falantes usando IA. Ele utiliza o modelo minimax/hailuo-02-fast/image-to-video para transformar uma foto em um vídeo, minimax/speech-02-turbo para gerar um audio e latentsync para lipsync.



## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.12+
- Chave API do [Fal AI](https://fal.ai)

### 1. Clone o projeto
```bash
git clone https://github.com/seu-usuario/moana-alive.git
cd moana-alive
```

### 2. Configure o ambiente
```bash
# Instale dependências
pip install -r requirements.txt

# Configure a chave API
export FAL_KEY=sua_chave_fal_aqui
# Ou crie arquivo .env com: FAL_KEY=sua_chave_fal_aqui
```

### 3. Execute o projeto
```bash
python run.py
```

### 4. Acesse a aplicação
Abra no navegador: `http://localhost:8000`

> ⚠️ **Para usar câmera**: Acesse via `localhost`, não `127.0.0.1`

## 🛠️ Tecnologias

- **Backend**: FastAPI + Python
- **Frontend**: HTML, CSS, JavaScript (Bootstrap)
- **IA**: Fal AI (Minimax, LatentSync, Speech-02)
- **Áudio**: PyDub para processamento
- **Deploy**: Render (produção)

