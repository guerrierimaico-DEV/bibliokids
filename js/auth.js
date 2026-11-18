/**
 * js/auth.js - Controle de autenticação e sementes iniciais do LocalStorage
 */

// Inicializa dados padrão no LocalStorage caso estejam vazios
function inicializarBanco() {
    if (!localStorage.getItem('bibliokids_admins')) {
        const adminsIniciais = [
            { id: 1, nome: 'Administrador Master', usuario: 'admin', senha: '12345', master: true, criadoEm: new Date().toISOString() }
        ];
        localStorage.setItem('bibliokids_admins', JSON.stringify(adminsIniciais));
    }

    if (!localStorage.getItem('bibliokids_livros')) {
        const livrosIniciais = [
            // Disney
            { id: 1, titulo: 'O Rei Leão', autor: 'Disney', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🦁', cor_capa: '#f39c12', status: 'Disponível' },
            { id: 2, titulo: 'Frozen - Uma Aventura Congelante', autor: 'Disney', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '❄️', cor_capa: '#3498db', status: 'Disponível' },
            { id: 3, titulo: 'Moana', autor: 'Disney', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🌊', cor_capa: '#1abc9c', status: 'Disponível' },
            { id: 4, titulo: 'Mickey Mouse - Aventuras', autor: 'Disney', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🐭', cor_capa: '#e74c3c', status: 'Disponível' },
            { id: 5, titulo: 'Princesas Disney - Bela Adormecida', autor: 'Disney', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '👸', cor_capa: '#9b59b6', status: 'Disponível' },
            { id: 6, titulo: 'Procurando Nemo', autor: 'Disney/Pixar', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🐠', cor_capa: '#f1c40f', status: 'Disponível' },
            { id: 7, titulo: 'Toy Story', autor: 'Disney/Pixar', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🤠', cor_capa: '#3498db', status: 'Disponível' },
            { id: 8, titulo: 'Carros', autor: 'Disney/Pixar', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🏎️', cor_capa: '#e74c3c', status: 'Disponível' },
            { id: 9, titulo: 'Divertida Mente', autor: 'Disney/Pixar', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '😊', cor_capa: '#9b59b6', status: 'Disponível' },
            { id: 10, titulo: 'Encanto', autor: 'Disney', editora: 'Disney Press', categoria: 'Disney', capa_emoji: '🦋', cor_capa: '#e91e63', status: 'Disponível' },
            // Dreamworks
            { id: 11, titulo: 'Shrek - O Ogro Amigo', autor: 'Dreamworks', editora: 'Dreamworks Books', categoria: 'Dreamworks', capa_emoji: '👹', cor_capa: '#27ae60', status: 'Disponível' },
            { id: 12, titulo: 'Kung Fu Panda', autor: 'Dreamworks', editora: 'Dreamworks Books', categoria: 'Dreamworks', capa_emoji: '🐼', cor_capa: '#f39c12', status: 'Disponível' },
            { id: 13, titulo: 'Madagascar', autor: 'Dreamworks', editora: 'Dreamworks Books', categoria: 'Dreamworks', capa_emoji: '🦁', cor_capa: '#e67e22', status: 'Disponível' },
            { id: 14, titulo: 'Como Treinar o Seu Dragão', autor: 'Dreamworks', editora: 'Dreamworks Books', categoria: 'Dreamworks', capa_emoji: '🐉', cor_capa: '#8e44ad', status: 'Disponível' },
            // Brasileiro
            { id: 15, titulo: 'O Menino Maluquinho', autor: 'Ziraldo', editora: 'Melhoramentos', categoria: 'Brasileiro', capa_emoji: '👦', cor_capa: '#e74c3c', status: 'Disponível' },
            { id: 16, titulo: 'Marcelo, Marmelo, Martelo', autor: 'Ruth Rocha', editora: 'Salamandra', categoria: 'Brasileiro', capa_emoji: '🔨', cor_capa: '#f1c40f', status: 'Disponível' },
            { id: 17, titulo: 'Menina Bonita do Laço de Fita', autor: 'Ana Maria Machado', editora: 'Ática', categoria: 'Brasileiro', capa_emoji: '🎀', cor_capa: '#e74c3c', status: 'Disponível' },
            { id: 18, titulo: 'O Saci', autor: 'Monteiro Lobato', editora: 'Globo', categoria: 'Brasileiro', capa_emoji: '🌪️', cor_capa: '#2c3e50', status: 'Disponível' }
        ];
        localStorage.setItem('bibliokids_livros', JSON.stringify(livrosIniciais));
    }

    if (!localStorage.getItem('bibliokids_alunos')) {
        const alunosIniciais = [
            { id: 1, nome: 'Sofia Carvalho', matricula: '2026001', turma: '2º Ano A', responsavel: 'Ana Carvalho' },
            { id: 2, nome: 'Lucas Gabriel', matricula: '2026002', turma: '3º Ano B', responsavel: 'Carlos Gabriel' }
        ];
        localStorage.setItem('bibliokids_alunos', JSON.stringify(alunosIniciais));
    }

    if (!localStorage.getItem('bibliokids_emprestimos')) {
        localStorage.setItem('bibliokids_emprestimos', JSON.stringify([]));
    }
}

// Verifica se o admin está logado nas páginas protegidas
function verificarLogin() {
    const logado = sessionStorage.getItem('admin_logado');
    if (!logado) {
        window.location.href = 'index.html';
    }
}

// Realiza login no cliente
function fazerLogin(e) {
    e.preventDefault();
    const usuarioInput = document.getElementById('usuario').value.trim();
    const senhaInput = document.getElementById('senha').value;
    
    const admins = JSON.parse(localStorage.getItem('bibliokids_admins')) || [];
    const admin = admins.find(a => a.usuario === usuarioInput && a.senha === senhaInput);
    
    if (admin) {
        sessionStorage.setItem('admin_logado', 'true');
        sessionStorage.setItem('admin_id', admin.id);
        sessionStorage.setItem('admin_nome', admin.nome);
        sessionStorage.setItem('admin_master', admin.master);
        window.location.href = 'dashboard.html';
    } else {
        const erroDiv = document.getElementById('erroLogin');
        if (erroDiv) {
            erroDiv.style.display = 'block';
            erroDiv.textContent = '❌ Usuário ou senha inválidos!';
        }
    }
}

// Realiza logout
function fazerLogout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

inicializarBanco();