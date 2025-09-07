#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

# Criar diretórios necessários
mkdir -p uploads
mkdir -p generated_videos  
mkdir -p generated_audios
mkdir -p final_videos
