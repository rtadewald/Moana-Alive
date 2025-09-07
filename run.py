#!/usr/bin/env python3

import subprocess
import sys
import os
from dotenv import load_dotenv

load_dotenv()


def main():
    print("🎬 Iniciando Moana Alive...")
    
    if not os.path.exists("static"):
        os.makedirs("static", exist_ok=True)
    if not os.path.exists("uploads"):
        os.makedirs("uploads", exist_ok=True)
    if not os.path.exists("generated_videos"):
        os.makedirs("generated_videos", exist_ok=True)
    if not os.path.exists("generated_audios"):
        os.makedirs("generated_audios", exist_ok=True)
    
    print("🚀 Iniciando Moana Alive...")
    print("📱 Acesse: http://localhost:8000")
    print("⏹️  Para parar: Ctrl+C")
    
    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Servidor parado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao executar: {e}")

if __name__ == "__main__":
    main()
