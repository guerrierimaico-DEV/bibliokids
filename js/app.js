/**
 * js/app.js - Lógica geral de renderização e manipulação do LocalStorage (Painel, Livros, Alunos, Empréstimos e Admins)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Carrega o menu de navegação padrão em todas as páginas internas
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        renderizarMenu();
    }

    // Identifica qual página está ativa e carrega seus dados específicos
    const paginaAtual = window.location.pathname.split('/').pop();
    
    if (paginaAtual === 'dashboard.html') {
        carregarDashboard();
    } else if (paginaAtual === 'livros.html') {
        carregarLivros();
    } else if (paginaAtual === 'alunos.html') {
        carregarAlunos();
    } else if (paginaAtual === 'emprestimos.html') {
        carregarEmprestimos();
    } else if (paginaAtual === 'administradores.html') {
        carregarAdministradores();
    }
});

// Renderiza a barra de navegação dinamicamente
function renderizarMenu() {
    const master = sessionStorage.getItem('admin_master') === 'true';
    const menuContainer = document.getElementById('menu-container');
    
    menuContainer.innerHTML = `
        <div class="navbar">
            <div class="nav-brand">
                <span class="logo">📚</span>
                <span class="brand-text">BiblioKids</span>
            </div>
            <button class="menu-toggle" onclick="toggleMenu()">☰</button>
            <nav class="nav-menu" id="navMenu">
                <a href="dashboard.html" class="nav-link">🏠 Início</a>
                <a href="livros.html" class="nav-link">📚 Livros</a>
                <a href="alunos.html" class="nav-link">👧 Alunos</a>
                <a href="emprestimos.html" class="nav-link">🎒 Empréstimos</a>
                ${master ? '<a href="administradores.html" class="nav-link">👨‍💼 Administradores</a>' : ''}
                <a href="alterar-senha.html" class="nav-link">🔑 Minha Senha</a>
                <a href="#" onclick="fazerLogout()" class="nav-link nav-logout">🚪 Sair</a>
            </nav>
        </div>
    `;
}

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('ativo');
}

// Utilitários de Modal
function abrirModal(id) {
    document.getElementById(id).classList.add('ativo');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('ativo');
}

// 1. DASHBOARD
function carregarDashboard() {
    const nomeAdmin = sessionStorage.getItem('admin_nome') || 'Administrador';
    document.getElementById('nomeAdmin').textContent = nomeAdmin;

    const livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];
    const alunos = JSON.parse(localStorage.getItem('bibliokids_alunos')) || [];
    const emprestimos = JSON.parse(localStorage.getItem('bibliokids_emprestimos')) || [];

    const totalLivros = livros.length;
    const livrosDisponiveis = livros.filter(l => l.status === 'Disponível').length;
    const emprestimosAtivos = emprestimos.filter(e => e.status === 'Ativo').length;
    const totalAlunos = alunos.length;
    
    // Devoluções previstas para hoje
    const hoje = new Date().toISOString().split('T')[0];
    const devolucoesHoje = emprestimos.filter(e => e.status === 'Ativo' && e.data_devolucao === hoje).length;

    document.getElementById('totalLivros').textContent = totalLivros;
    document.getElementById('livrosDisponiveis').textContent = livrosDisponiveis;
    document.getElementById('emprestimosAtivos').textContent = emprestimosAtivos;
    document.getElementById('totalAlunos').textContent = totalAlunos;
    document.getElementById('devolucoesHoje').textContent = devolucoesHoje;

    // Últimos livros
    const ultimosLivrosGrid = document.getElementById('ultimosLivrosGrid');
    const ultimos = [...livros].reverse().slice(0, 8);
    
    ultimosLivrosGrid.innerHTML = ultimos.map(l => `
        <div class="livro-card" style="background-color: ${l.cor_capa}">
            <div class="livro-emoji">${l.capa_emoji}</div>
            <div class="livro-info">
                <h4>${escapeHtml(l.titulo)}</h4>
                <p>${escapeHtml(l.autor)}</p>
                <span class="badge ${l.status === 'Disponível' ? 'badge-green' : 'badge-red'}">${l.status}</span>
            </div>
        </div>
    `).join('');
}

// 2. LIVROS
function carregarLivros(categoriaFiltro = '') {
    const livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];
    const grid = document.getElementById('livrosGrid');
    
    const filtrados = categoriaFiltro ? livros.filter(l => l.categoria === categoriaFiltro) : livros;

    grid.innerHTML = filtrados.map(l => `
        <div class="livro-card" style="background-color: ${l.cor_capa}">
            <div class="livro-emoji">${l.capa_emoji}</div>
            <div class="livro-info">
                <h4>${escapeHtml(l.titulo)}</h4>
                <p class="livro-autor">${escapeHtml(l.autor || '')}</p>
                <p class="livro-editora">${escapeHtml(l.editora || '')}</p>
                <span class="badge ${l.status === 'Disponível' ? 'badge-green' : 'badge-red'}">${l.status}</span>
            </div>
            <div class="livro-actions">
                <button class="btn-icon" onclick='prepararEdicaoLivro(${JSON.stringify(l)})'>✏️</button>
                <button class="btn-icon" onclick="excluirLivro(${l.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function salvarLivro(e) {
    e.preventDefault();
    const id = document.getElementById('id_livro').value;
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const editora = document.getElementById('editora').value;
    const categoria = document.getElementById('categoria').value;
    const capa_emoji = document.getElementById('capa_emoji').value || '📖';
    const cor_capa = document.getElementById('cor_capa').value || '#ff6b9d';

    let livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];

    if (id) {
        // Editar
        livros = livros.map(l => l.id == id ? { ...l, titulo, autor, editora, categoria, capa_emoji, cor_capa } : l);
        mostrarAlerta('✅ Livro atualizado com sucesso!', 'success');
    } else {
        // Adicionar
        const novoId = livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1;
        livros.push({ id: novoId, titulo, autor, editora, categoria, capa_emoji, cor_capa, status: 'Disponível' });
        mostrarAlerta('📚 Livro adicionado com sucesso!', 'success');
    }

    localStorage.setItem('bibliokids_livros', JSON.stringify(livros));
    fecharModal('modalLivro');
    document.getElementById('formLivro').reset();
    carregarLivros();
}

function prepararEdicaoLivro(livro) {
    document.getElementById('tituloModal').textContent = 'Editar Livro';
    document.getElementById('acaoLivro').value = 'editar';
    document.getElementById('id_livro').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('editora').value = livro.editora;
    document.getElementById('categoria').value = livro.categoria;
    document.getElementById('capa_emoji').value = livro.capa_emoji;
    document.getElementById('cor_capa').value = livro.cor_capa;
    abrirModal('modalLivro');
}

function excluirLivro(id) {
    const emprestimos = JSON.parse(localStorage.getItem('bibliokids_emprestimos')) || [];
    const ativo = emprestimos.some(e => e.id_livro == id && e.status === 'Ativo');

    if (ativo) {
        mostrarAlerta('❌ Não é possível excluir: livro está emprestado!', 'danger');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este livro?')) {
        let livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];
        livros = livros.filter(l => l.id != id);
        localStorage.setItem('bibliokids_livros', JSON.stringify(livros));
        carregarLivros();
        mostrarAlerta('🗑️ Livro excluído!', 'success');
    }
}

// 3. ALUNOS
function carregarAlunos() {
    const alunos = JSON.parse(localStorage.getItem('bibliokids_alunos')) || [];
    const tbody = document.getElementById('tabelaAlunos');

    tbody.innerHTML = alunos.map(a => `
        <tr>
            <td>${escapeHtml(a.nome)}</td>
            <td><b>${escapeHtml(a.matricula)}</b></td>
            <td>${escapeHtml(a.turma || '')}</td>
            <td>${escapeHtml(a.responsavel || '')}</td>
            <td>
                <button class="btn-icon" onclick='prepararEdicaoAluno(${JSON.stringify(a)})'>✏️</button>
                <button class="btn-icon" onclick="excluirAluno(${a.id})">🗑️</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center">Nenhum aluno cadastrado 😢</td></tr>';
}

function salvarAluno(e) {
    e.preventDefault();
    const id = document.getElementById('id_aluno').value;
    const nome = document.getElementById('nome_aluno').value;
    const matricula = document.getElementById('matricula').value;
    const turma = document.getElementById('turma').value;
    const responsavel = document.getElementById('responsavel').value;

    let alunos = JSON.parse(localStorage.getItem('bibliokids_alunos')) || [];

    if (id) {
        alunos = alunos.map(a => a.id == id ? { ...a, nome, turma, responsavel } : a);
        mostrarAlerta('✅ Aluno atualizado!', 'success');
    } else {
        if (alunos.some(a => a.matricula === matricula)) {
            mostrarAlerta('❌ Matrícula já cadastrada!', 'danger');
            return;
        }
        const novoId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) + 1 : 1;
        alunos.push({ id: novoId, nome, matricula, turma, responsavel });
        mostrarAlerta('👧 Aluno cadastrado com sucesso!', 'success');
    }

    localStorage.setItem('bibliokids_alunos', JSON.stringify(alunos));
    fecharModal('modalAluno');
    document.getElementById('formAluno').reset();
    carregarAlunos();
}

function prepararEdicaoAluno(aluno) {
    document.getElementById('tituloModalAluno').textContent = 'Editar Aluno';
    document.getElementById('acaoAluno').value = 'editar';
    document.getElementById('id_aluno').value = aluno.id;
    document.getElementById('nome_aluno').value = aluno.nome;
    document.getElementById('matricula').value = aluno.matricula;
    document.getElementById('matricula').readOnly = true;
    document.getElementById('turma').value = aluno.turma;
    document.getElementById('responsavel').value = aluno.responsavel;
    abrirModal('modalAluno');
}

function excluirAluno(id) {
    const emprestimos = JSON.parse(localStorage.getItem('bibliokids_emprestimos')) || [];
    const ativo = emprestimos.some(e => e.id_aluno == id && e.status === 'Ativo');

    if (ativo) {
        mostrarAlerta('❌ Não é possível excluir: aluno tem empréstimos ativos!', 'danger');
        return;
    }

    if (confirm('Deseja excluir este aluno?')) {
        let alunos = JSON.parse(localStorage.getItem('bibliokids_alunos')) || [];
        alunos = alunos.filter(a => a.id != id);
        localStorage.setItem('bibliokids_alunos', JSON.stringify(alunos));
        carregarAlunos();
        mostrarAlerta('🗑️ Aluno excluído!', 'success');
    }
}

// 4. EMPRÉSTIMOS
function carregarEmprestimos() {
    const emprestimos = JSON.parse(localStorage.getItem('bibliokids_emprestimos')) || [];
    const livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];
    const alunos = JSON.parse(localStorage.getItem('bibliokids_alunos')) || [];

    const ativos = emprestimos.filter(e => e.status === 'Ativo');
    const tbody = document.getElementById('tabelaEmprestimos');
    const hoje = new Date();

    tbody.innerHTML = ativos.map(e => {
        const livro = livros.find(l => l.id == e.id_livro) || { titulo: 'Livro não encontrado', capa_emoji: '📖' };
        const aluno = alunos.find(a => a.id == e.id_aluno) || { nome: 'Aluno não encontrado', matricula: '' };
        
        const dataDev = new Date(e.data_devolucao);
        const diffDias = Math.ceil((dataDev - hoje) / (1000 * 60 * 60 * 24));
        const atrasado = diffDias < 0;

        return `
            <tr class="${atrasado ? 'row-danger' : ''}">
                <td><span style="font-size:1.5em">${livro.capa_emoji}</span> ${escapeHtml(livro.titulo)}</td>
                <td>${escapeHtml(aluno.nome)}<br><small>${escapeHtml(aluno.matricula)}</small></td>
                <td>${formatarData(e.data_emprestimo)}</td>
                <td>${formatarData(e.data_devolucao)}</td>
                <td>
                    ${atrasado ? '<span class="badge badge-red">❌ Atrasado</span>' : `<span class="badge badge-green">✅  ${diffDias} dias</span>`}
                </td>
                <td>
                    <button class="btn-icon" onclick="devolverLivro(${e.id})">📥 Devolver</button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6" style="text-align:center">Nenhum empréstimo ativo 🎉</td></tr>';

    // Popular selects do Modal de Empréstimo
    const selectLivros = document.getElementById('selectLivrosDisp');
    const selectAlunos = document.getElementById('selectAlunosDisp');

    if (selectLivros && selectAlunos) {
        const disponiveis = livros.filter(l => l.status === 'Disponível');
        selectLivros.innerHTML = '<option value="">-- Escolha um livro --</option>' + disponiveis.map(l => `<option value="${l.id}">${l.capa_emoji} ${escapeHtml(l.titulo)}</option>`).join('');
        selectAlunos.innerHTML = '<option value="">-- Escolha um aluno --</option>' + alunos.map(a => `<option value="${a.id}">${escapeHtml(a.nome)} (${escapeHtml(a.matricula)})</option>`).join('');
    }
}

function realizarEmprestimo(e) {
    e.preventDefault();
    const id_livro = parseInt(document.getElementById('selectLivrosDisp').value);
    const id_aluno = parseInt(document.getElementById('selectAlunosDisp').value);

    let livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];
    let emprestimos = JSON.parse(localStorage.getItem('bibliokids_emprestimos')) || [];

    const livro = livros.find(l => l.id === id_livro);
    if (!livro || livro.status === 'Emprestado') {
        mostrarAlerta('❌ Livro indisponível!', 'danger');
        return;
    }

    const dataEmp = new Date();
    const dataDev = new Date();
    dataDev.setDate(dataEmp.getDate() + 7); // Devolução automática em 7 dias

    const novoId = emprestimos.length > 0 ? Math.max(...emprestimos.map(ep => ep.id)) + 1 : 1;
    
    emprestimos.push({
        id: novoId,
        id_livro,
        id_aluno,
        data_emprestimo: dataEmp.toISOString().split('T')[0],
        data_devolucao: dataDev.toISOString().split('T')[0],
        status: 'Ativo'
    });

    livros = livros.map(l => l.id === id_livro ? { ...l, status: 'Emprestado' } : l);

    localStorage.setItem('bibliokids_emprestimos', JSON.stringify(emprestimos));
    localStorage.setItem('bibliokids_livros', JSON.stringify(livros));

    fecharModal('modalEmprestimo');
    carregarEmprestimos();
    mostrarAlerta('🎉 Empréstimo realizado com sucesso!', 'success');
}

function devolverLivro(id_emprestimo) {
    let emprestimos = JSON.parse(localStorage.getItem('bibliokids_emprestimos')) || [];
    let livros = JSON.parse(localStorage.getItem('bibliokids_livros')) || [];

    const emp = emprestimos.find(e => e.id === id_emprestimo);
    if (!emp) return;

    emprestimos = emprestimos.map(e => e.id === id_emprestimo ? { ...e, status: 'Devolvido', data_real_devolucao: new Date().toISOString().split('T')[0] } : e);
    livros = livros.map(l => l.id === emp.id_livro ? { ...l, status: 'Disponível' } : l);

    localStorage.setItem('bibliokids_emprestimos', JSON.stringify(emprestimos));
    localStorage.setItem('bibliokids_livros', JSON.stringify(livros));

    carregarEmprestimos();
    mostrarAlerta('✅ Livro devolvido com sucesso!', 'success');
}

// 5. ADMINISTRADORES
function carregarAdministradores() {
    const admins = JSON.parse(localStorage.getItem('bibliokids_admins')) || [];
    const logadoId = parseInt(sessionStorage.getItem('admin_id'));
    const tbody = document.getElementById('tabelaAdmins');

    tbody.innerHTML = admins.map(a => `
        <tr>
            <td>${escapeHtml(a.nome)}</td>
            <td>${a.master ? '<span class="badge badge-gold">⭐ Master</span>' : '<span class="badge badge-blue">👤 Admin</span>'}</td>
            <td>${formatarData(a.criadoEm.split('T')[0])}</td>
            <td>
                <button class="btn-icon" onclick="abrirModalSenhaAdmin(${a.id}, '${escapeHtml(a.nome)}')">🔑</button>
                ${!a.master ? `<button class="btn-icon" onclick="excluirAdmin(${a.id},${logadoId})">🗑️</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function criarAdmin(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeAdminNovo').value;
    const usuario = document.getElementById('usuarioAdminNovo').value;
    const senha = document.getElementById('senhaAdminNovo').value;

    let admins = JSON.parse(localStorage.getItem('bibliokids_admins')) || [];
    if (admins.some(a => a.usuario === usuario)) {
        mostrarAlerta('❌ Nome de usuário já existe!', 'danger');
        return;
    }

    const novoId = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
    admins.push({ id: novoId, nome, usuario, senha, master: false, criadoEm: new Date().toISOString() });

    localStorage.setItem('bibliokids_admins', JSON.stringify(admins));
    fecharModal('modalAdmin');
    document.getElementById('formAdmin').reset();
    carregarAdministradores();
    mostrarAlerta('👨‍💼 Administrador criado com sucesso!', 'success');
}

function abrirModalSenhaAdmin(id, nome) {
    document.getElementById('id_admin_senha').value = id;
    document.getElementById('nomeAdminSenha').textContent = nome;
    abrirModal('modalSenhaAdmin');
}

function alterarSenhaAdminPorMaster(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('id_admin_senha').value);
    const novaSenha = document.getElementById('nova_senha_master').value;

    let admins = JSON.parse(localStorage.getItem('bibliokids_admins')) || [];
    admins = admins.map(a => a.id === id ? { ...a, senha: novaSenha } : a);

    localStorage.setItem('bibliokids_admins', JSON.stringify(admins));
    fecharModal('modalSenhaAdmin');
    document.getElementById('formSenhaAdmin').reset();
    mostrarAlerta('🔑 Senha alterada com sucesso!', 'success');
}

function excluirAdmin(id, logadoId) {
    if (id === logadoId) {
        mostrarAlerta('❌ Você não pode excluir sua própria conta!', 'danger');
        return;
    }
    if (confirm('Deseja excluir este administrador?')) {
        let admins = JSON.parse(localStorage.getItem('bibliokids_admins')) || [];
        admins = admins.filter(a => a.id !== id);
        localStorage.setItem('bibliokids_admins', JSON.stringify(admins));
        carregarAdministradores();
        mostrarAlerta('🗑️ Administrador excluído!', 'success');
    }
}

// Alteração da própria senha
function alterarMinhaSenha(e) {
    e.preventDefault();
    const atual = document.getElementById('senha_atual').value;
    const nova = document.getElementById('nova_senha').value;
    const confirmar = document.getElementById('confirmar_senha').value;

    if (nova !== confirmar) {
        mostrarAlerta('❌ As novas senhas não coincidem!', 'danger');
        return;
    }

    const adminId = parseInt(sessionStorage.getItem('admin_id'));
    let admins = JSON.parse(localStorage.getItem('bibliokids_admins')) || [];
    const admin = admins.find(a => a.id === adminId);

    if (admin.senha !== atual) {
        mostrarAlerta('❌ Senha atual incorreta!', 'danger');
        return;
    }

    admins = admins.map(a => a.id === adminId ? { ...a, senha: nova } : a);
    localStorage.setItem('bibliokids_admins', JSON.stringify(admins));
    mostrarAlerta('✅ Senha alterada com sucesso!', 'success');
    document.getElementById('formMinhaSenha').reset();
}

// Utilitários auxiliares
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatarData(dataIso) {
    if (!dataIso) return '';
    const partes = dataIso.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarAlerta(msg, tipo) {
    const container = document.getElementById('alertaContainer') || criarContainerAlerta();
    container.innerHTML = `<div class="alert alert-${tipo}">${msg}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}

function criarContainerAlerta() {
    const div = document.createElement('div');
    div.id = 'alertaContainer';
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2000; max-width: 400px;';
    document.body.appendChild(div);
    return div;
}