
import json
import os
import asyncio
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters, CommandHandler
import yt_dlp

# @BotFather dan olgan tokenni shu yerga yozing
BOT_TOKEN = "8408816406:AAEhZdPry-6jbCn5EtvqpAVyO72nZ-w2PfQ"
# Mini App havolasi
APP_URL = "https://loyiha-havolasi.vercel.app"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Botga start berilganda Mini App ochish tugmasini chiqarish"""
    kb = [
        [KeyboardButton("Video Yuklash", web_app=WebAppInfo(url=APP_URL))]
    ]
    reply_markup = ReplyKeyboardMarkup(kb, resize_keyboard=True)
    await update.message.reply_text(
        "Salom! Video yuklash uchun pastdagi tugmani bosing:",
        reply_markup=reply_markup
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Mini Appdan kelgan ma'lumotni (JSON) qabul qilish va yuklash"""
    data = json.loads(update.effective_message.web_app_data.data)
    
    url = data.get('url')
    format_type = data.get('format')
    title = data.get('title', 'video')

    status_msg = await update.message.reply_text(f"⏳ Yuklanmoqda: {title}...")

    # yt-dlp sozlamalari
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' if format_type == 'mp4' else 'bestaudio/best',
        'outtmpl': f'downloads/%(title)s.%(ext)s',
    }

    if format_type == 'mp3':
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    try:
        # Faylni yuklash
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_path = ydl.prepare_filename(info)
            if format_type == 'mp3':
                file_path = file_path.rsplit('.', 1)[0] + '.mp3'

        # Faylni Telegramga yuborish
        await status_msg.edit_text("✅ Yuklash yakunlandi. Fayl yuborilmoqda...")
        
        with open(file_path, 'rb') as f:
            if format_type == 'mp4':
                await update.message.reply_video(video=f, caption=f"🎬 {title}\n\n#SnapMedia orqali yuklandi")
            else:
                await update.message.reply_audio(audio=f, caption=f"🎵 {title}\n\n#SnapMedia orqali yuklandi")
        
        # Tozalash
        os.remove(file_path)
        await status_msg.delete()

    except Exception as e:
        await status_msg.edit_text(f"❌ Xatolik yuz berdi: {str(e)}")

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
        
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    print("Bot ishga tushdi...")
    app.run_polling()
