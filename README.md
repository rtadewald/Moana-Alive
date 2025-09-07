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

### 2. Obtenha sua chave API do Fal AI
1. **Acesse**: [fal.ai](https://fal.ai)
2. **Crie uma conta** gratuita
3. **Vá para**: Dashboard → API Keys
4. **Crie uma nova chave** e copie o valor

### 3. Configure as variáveis de ambiente
```bash
# Instale dependências
pip install -r requirements.txt

# Crie arquivo .env na raiz do projeto
echo "FAL_KEY=sua_chave_fal_aqui" > .env

# ⚠️ IMPORTANTE: Substitua "sua_chave_fal_aqui" pela chave real do Fal AI
```

**Exemplo do arquivo `.env`:**
```env
# Configuração da API Fal AI
# Obtenha sua chave em: https://fal.ai/dashboard/keys
FAL_KEY=fal_c1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6

# Configuração do servidor (opcional)
PORT=8000
```

> 📝 **Nota**: O arquivo `.env` deve ficar na **raiz do projeto** (mesmo diretório que `app.py`)

### 4. Execute o projeto
```bash
python run.py
```

### 5. Acesse a aplicação
Abra no navegador: `http://localhost:8000`

> ⚠️ **Para usar câmera**: Acesse via `localhost`, não `127.0.0.1`

## 🛠️ Tecnologias

- **Backend**: FastAPI + Python
- **Frontend**: HTML, CSS, JavaScript (Bootstrap)
- **IA**: Fal AI (Minimax, LatentSync, Speech-02)
- **Áudio**: PyDub para processamento
- **Deploy**: Render (produção)

## 🔧 Problemas Comuns

### ❌ "Erro: Chave API não encontrada"
- **Solução**: Verifique se o arquivo `.env` existe e tem a chave correta
- **Comando**: `cat .env` para verificar o conteúdo

### ❌ "Câmera não funciona no celular"  
- **Solução**: Use o botão "📱 Câmera Celular" em vez de "📷 Câmera Web"
- **Requisito**: Acesso via HTTPS (deploy em produção)

### ❌ "ModuleNotFoundError"
- **Solução**: Instale as dependências: `pip install -r requirements.txt`

## 🆘 Suporte

- **Issues**: Reporte bugs no GitHub
- **API Fal**: [Documentação oficial](https://fal.ai/docs)
- **Deploy**: Guia do [Render.com](https://render.com/docs)
