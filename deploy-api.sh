#!/bin/bash

echo "======================================"
echo " Iniciando despliegue de la API"
echo "======================================"

echo ""
echo "Actualizando repositorio..."
git fetch --all

git pull

echo ""
echo "Instalando dependencias..."
npm install --force

echo ""
echo "Compilando proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error durante la compilación."
    exit 1
fi

echo ""
echo "Reiniciando PM2..."
pm2 restart bingo-api

echo ""
echo "Guardando configuración de PM2..."
pm2 save

echo ""
echo "======================================"
echo "✅ Despliegue finalizado correctamente"
echo "======================================"