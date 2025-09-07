from fastapi import FastAPI, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import fal_client
import requests
import os
from pathlib import Path
import uuid
import json
from datetime import datetime
from pydub import AudioSegment

app = FastAPI()

app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/final_videos", StaticFiles(directory="final_videos"), name="final_videos")
app.mount("/generated_videos", StaticFiles(directory="generated_videos"), name="generated_videos")
app.mount("/generated_audios", StaticFiles(directory="generated_audios"), name="generated_audios")
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("uploads", exist_ok=True)
os.makedirs("generated_videos", exist_ok=True)
os.makedirs("generated_audios", exist_ok=True)

METADATA_FILE = "generated_videos/metadata.json"
AUDIO_METADATA_FILE = "generated_audios/metadata.json"
SYNCED_METADATA_FILE = "final_videos/metadata.json"


def load_metadata():
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_metadata(metadata_list):
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata_list, f, indent=2, ensure_ascii=False)

def load_audio_metadata():
    if os.path.exists(AUDIO_METADATA_FILE):
        with open(AUDIO_METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_audio_metadata(metadata_list):
    with open(AUDIO_METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata_list, f, indent=2, ensure_ascii=False)

def load_synced_metadata():
    if os.path.exists(SYNCED_METADATA_FILE):
        with open(SYNCED_METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_synced_metadata(metadata_list):
    with open(SYNCED_METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata_list, f, indent=2, ensure_ascii=False)

def extend_audio_with_silence(audio_path, output_path):
    """Adiciona 1 segundo de silêncio antes e depois do áudio"""
    try:
        audio = AudioSegment.from_file(audio_path)
        silencio = AudioSegment.silent(duration=1000)  # 1 segundo
        audio_final = silencio + audio + silencio
        audio_final.export(output_path, format="wav")
        return True
    except Exception as e:
        print(f"Erro ao estender áudio: {e}")
        return False

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/generate-video")
async def generate_video(file: UploadFile = File(...), prompt: str = Form(...), duration: int = Form(8)):
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}_{file.filename}"
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        url = fal_client.upload_file(file_path)
        
        result = fal_client.subscribe(
            "fal-ai/minimax/hailuo-02-fast/image-to-video",
            arguments={
                "prompt": prompt,
                "image_url": url,
                "duration": str(duration)
            }
        )
        
        video_url = result["video"]["url"]
        response = requests.get(video_url)
        
        output_path = f"generated_videos/{file_id}.mp4"
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        # Salvar metadados
        metadata = load_metadata()
        video_metadata = {
            "id": file_id,
            "video_path": output_path,
            "original_filename": file.filename,
            "prompt": prompt,
            "duration": duration,
            "created_at": datetime.now().isoformat(),
            "thumbnail": None
        }
        metadata.append(video_metadata)
        save_metadata(metadata)
        
        os.remove(file_path)
        return {"success": True, "video_path": output_path, "metadata": video_metadata}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/generate-audio")
async def generate_audio(text: str = Form(...), voice_id: str = Form("Lively_Girl")):
    try:
        result = fal_client.subscribe(
            "fal-ai/minimax/speech-02-turbo",
            arguments={
                "text": text,
                "voice_setting": {
                    "speed": 1,
                    "vol": 1,
                    "voice_id": voice_id,
                    "pitch": 0,
                    "english_normalization": False
                }
            }
        )
        
        audio_url = result["audio"]["url"]
        response = requests.get(audio_url)
        
        audio_id = str(uuid.uuid4())
        temp_path = f"generated_audios/{audio_id}_temp.wav"
        output_path = f"generated_audios/{audio_id}.wav"
        
        # Salvar áudio temporário
        with open(temp_path, "wb") as f:
            f.write(response.content)
        
        # Estender com silêncio
        if extend_audio_with_silence(temp_path, output_path):
            os.remove(temp_path)  # Remove arquivo temporário
        else:
            # Se falhar, usa o arquivo original
            os.rename(temp_path, output_path)
        
        # Salvar metadados do áudio
        audio_metadata = load_audio_metadata()
        audio_info = {
            "id": audio_id,
            "audio_path": output_path,
            "text": text,
            "voice_id": voice_id,
            "created_at": datetime.now().isoformat()
        }
        audio_metadata.append(audio_info)
        save_audio_metadata(audio_metadata)
        
        return {"success": True, "audio_path": output_path, "metadata": audio_info}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/lipsync")
async def lipsync(video_path: str = Form(...), audio_path: str = Form(...)):
    try:
        url_mp4 = fal_client.upload_file(video_path)
        url_wav = fal_client.upload_file(audio_path)
        
        result = fal_client.subscribe(
            "fal-ai/latentsync",
            arguments={
                "video_url": url_mp4,
                "audio_url": url_wav
            }
        )
        
        video_url = result["video"]["url"]
        response = requests.get(video_url)
        
        sync_id = str(uuid.uuid4())
        output_path = f"final_videos/{sync_id}_lipsync.mp4"
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        # Salvar metadados do vídeo sincronizado
        synced_metadata = load_synced_metadata()
        
        # Buscar metadados do vídeo e áudio originais
        video_metadata = load_metadata()
        audio_metadata = load_audio_metadata()
        
        video_info = next((v for v in video_metadata if v["video_path"] == video_path), None)
        audio_info = next((a for a in audio_metadata if a["audio_path"] == audio_path), None)
        
        sync_info = {
            "id": sync_id,
            "video_path": output_path,
            "original_video_path": video_path,
            "original_audio_path": audio_path,
            "video_prompt": video_info["prompt"] if video_info else "Prompt não encontrado",
            "audio_text": audio_info["text"] if audio_info else "Texto não encontrado",
            "original_filename": video_info["original_filename"] if video_info else "Arquivo não encontrado",
            "created_at": datetime.now().isoformat()
        }
        synced_metadata.append(sync_info)
        save_synced_metadata(synced_metadata)
        
        return {"success": True, "video_path": output_path, "metadata": sync_info}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/list-videos")
async def list_videos():
    videos = []
    for path in Path("generated_videos").glob("*.mp4"):
        videos.append(str(path))
    return {"videos": videos}

@app.get("/list-videos-with-metadata")
async def list_videos_with_metadata():
    metadata = load_metadata()
    # Ordenar por data de criação (mais recente primeiro)
    metadata.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"videos": metadata}

@app.get("/list-audios")
async def list_audios():
    audios = []
    for path in Path("generated_audios").glob("*.wav"):
        audios.append(str(path))
    return {"audios": audios}

@app.get("/list-audios-with-metadata")
async def list_audios_with_metadata():
    metadata = load_audio_metadata()
    # Ordenar por data de criação (mais recente primeiro)
    metadata.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"audios": metadata}

@app.get("/list-synced-videos")
async def list_synced_videos():
    metadata = load_synced_metadata()
    # Ordenar por data de criação (mais recente primeiro)
    metadata.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"videos": metadata}

@app.delete("/delete-video/{video_id}")
async def delete_video(video_id: str):
    try:
        metadata = load_metadata()
        video_to_delete = next((v for v in metadata if v["id"] == video_id), None)
        
        if not video_to_delete:
            return {"success": False, "error": "Vídeo não encontrado"}
        
        # Remover arquivo
        if os.path.exists(video_to_delete["video_path"]):
            os.remove(video_to_delete["video_path"])
        
        # Remover dos metadados
        metadata = [v for v in metadata if v["id"] != video_id]
        save_metadata(metadata)
        
        return {"success": True, "message": "Vídeo deletado com sucesso"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/delete-audio/{audio_id}")
async def delete_audio(audio_id: str):
    try:
        metadata = load_audio_metadata()
        audio_to_delete = next((a for a in metadata if a["id"] == audio_id), None)
        
        if not audio_to_delete:
            return {"success": False, "error": "Áudio não encontrado"}
        
        # Remover arquivo
        if os.path.exists(audio_to_delete["audio_path"]):
            os.remove(audio_to_delete["audio_path"])
        
        # Remover dos metadados
        metadata = [a for a in metadata if a["id"] != audio_id]
        save_audio_metadata(metadata)
        
        return {"success": True, "message": "Áudio deletado com sucesso"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/delete-synced/{synced_id}")
async def delete_synced_video(synced_id: str):
    try:
        metadata = load_synced_metadata()
        synced_to_delete = next((s for s in metadata if s["id"] == synced_id), None)
        
        if not synced_to_delete:
            return {"success": False, "error": "Vídeo sincronizado não encontrado"}
        
        # Remover arquivo
        if os.path.exists(synced_to_delete["video_path"]):
            os.remove(synced_to_delete["video_path"])
        
        # Remover dos metadados
        metadata = [s for s in metadata if s["id"] != synced_id]
        save_synced_metadata(metadata)
        
        return {"success": True, "message": "Vídeo sincronizado deletado com sucesso"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
