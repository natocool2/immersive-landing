#!/bin/bash

# Script de Configuração do Token GitHub
# =======================================

echo "🔐 Configuração do Token GitHub para Auto-Sync"
echo "=============================================="
echo ""
echo "📋 Instruções:"
echo "1. Vá para: https://github.com/settings/tokens"
echo "2. Crie um token com permissões: repo, workflow"
echo "3. O token começa com: ghp_xxxxxxxxxxxxx"
echo ""

# Solicitar o token
read -p "Cole seu token GitHub aqui: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token não pode estar vazio!"
    exit 1
fi

# Verificar se o token tem o formato correto
if [[ ! "$GITHUB_TOKEN" =~ ^ghp_ ]]; then
    echo "⚠️  Aviso: Token geralmente começa com 'ghp_'"
    read -p "Deseja continuar mesmo assim? (s/n): " confirm
    if [ "$confirm" != "s" ]; then
        exit 1
    fi
fi

# Configurar o Git remote
echo ""
echo "🔧 Configurando Git remote..."
cd /srv/www/domains/easynetpro.com/main/frontend
git remote set-url origin https://natocool2:${GITHUB_TOKEN}@github.com/natocool2/immersive-landing.git

# Testar a conexão
echo "🧪 Testando conexão..."
if git ls-remote origin &>/dev/null; then
    echo "✅ Conexão com GitHub estabelecida com sucesso!"
    
    # Salvar token em arquivo seguro
    echo "GITHUB_TOKEN=${GITHUB_TOKEN}" > /srv/www/domains/easynetpro.com/main/frontend/.env.github
    chmod 600 /srv/www/domains/easynetpro.com/main/frontend/.env.github
    echo "✅ Token salvo com segurança!"
    
    echo ""
    echo "🎉 Configuração concluída!"
    echo ""
    echo "Próximos passos:"
    echo "1. Iniciar sync automático:"
    echo "   sudo systemctl start easynet-autosync"
    echo ""
    echo "2. Verificar status:"
    echo "   sudo systemctl status easynet-autosync"
    echo ""
    echo "3. Ver logs em tempo real:"
    echo "   sudo journalctl -u easynet-autosync -f"
else
    echo "❌ Falha na conexão com GitHub!"
    echo "Verifique se o token está correto e tem as permissões necessárias."
    exit 1
fi
