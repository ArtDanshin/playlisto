#!/bin/bash

# Скрипт для настройки Spotify API в Playlisto

echo "🎵 Настройка Spotify API для Playlisto"
echo "======================================"

# Проверяем, существует ли уже .env файл
if [ -f ".env" ]; then
    echo "⚠️  Файл .env уже существует!"
    read -p "Хотите перезаписать его? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Настройка отменена."
        exit 1
    fi
fi

# Копируем пример файла
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Файл .env создан из env.example"
else
    echo "❌ Файл env.example не найден!"
    exit 1
fi

echo ""
echo "📝 Следующие шаги:"
echo "1. Перейдите на https://developer.spotify.com/dashboard"
echo "2. Создайте новое приложение"
echo "3. Добавьте Redirect URI: http://localhost:5173"
echo "4. Скопируйте Client ID"
echo "5. Откройте файл .env и замените VITE_SPOTIFY_CLIENT_ID на ваш Client ID"
echo ""
echo "🔗 Подробная инструкция: SPOTIFY_SETUP.md"
echo ""
echo "После настройки запустите: npm run dev" 