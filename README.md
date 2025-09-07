# 🎬 Moana Alive

**Dê vida aos brinquedos das crianças!** Uma aplicação web que transforma fotos de brinquedos em vídeos falantes usando IA.

## ✨ O que faz?

- **📸 Anima fotos** de brinquedos usando modelos de image-to-video
- **🎤 Gera áudios** com texto-para-fala em português
- **💋 Sincroniza lábios** para criar vídeos realistas falantes
- **📱 Interface simples** para crianças e pais usarem

## 🎯 Funcionalidades

### 📸 **Animar Foto**
- Upload de foto ou captura com câmera web
- Prompt personalizado para animação
- Duração configurável (6-10 segundos)
- Galeria de vídeos gerados

### 🎤 **Gerar Áudio**
- Texto-para-fala em português brasileiro
- Múltiplas vozes disponíveis
- Áudio estendido com silêncio automático
- Biblioteca de áudios criados

### 💋 **Lip Sync**
- Combinação visual de vídeo + áudio
- Seleção interativa com prévias
- Sincronização labial inteligente

### 🎬 **Vídeos Sincronizados**
- Galeria de resultados finais
- Informações completas dos projetos
- Sistema de organização

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

## 📁 Estrutura do Projeto

```
moana-alive/
├── app.py              # Backend FastAPI
├── run.py              # Script de execução
├── requirements.txt    # Dependências
├── build.sh           # Script de deploy
├── static/            # Frontend
│   ├── index.html     # Interface principal
│   ├── script.js      # Funcionalidades
│   └── style.css      # Estilos
├── assets/            # Arquivos de exemplo
├── generated_videos/  # Vídeos criados
├── generated_audios/  # Áudios gerados
└── final_videos/      # Resultados finais
```

## 🎮 Como Usar

1. **📸 Tire ou envie** uma foto do brinquedo
2. **✍️ Escreva** o que quer que ele fale
3. **⚙️ Configure** duração e voz
4. **🎬 Gere** o vídeo animado
5. **🎤 Crie** o áudio com a fala
6. **💋 Combine** tudo no lip sync
7. **🎉 Divirta-se** com o resultado!

## 🌟 Exemplos de Uso

- **Bonecas falantes** para histórias
- **Brinquedos educativos** com lições
- **Personagens** de contos infantis
- **Presentes personalizados** para crianças

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit mudanças: `git commit -m 'Nova feature'`
4. Push para branch: `git push origin minha-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: Reporte bugs no GitHub
- **Documentação**: Veja os comentários no código
- **Deploy**: Siga o guia do Render.com

---

**Feito com ❤️ para trazer magia aos brinquedos das crianças!** ✨
