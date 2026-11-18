#  BiblioKids - A Biblioteca Mágica dos Livros 



O **BiblioKids** é uma aplicação web interativa, lúdica e responsiva 
desenvolvida para gerenciar bibliotecas infantis (escolas, projetos sociais ou uso doméstico). 



Esta versão foi totalmente refatorada para funcionar:
**100% no lado do cliente (Frontend)** utilizando **HTML5, CSS3, Bootstrap 5, JavaScript e LocalStorage**, estando totalmente pronta para ser publicada
gratuitamente no **GitHub Pages** e instalada como um **PWA (Aplicativo Web Progressivo)**.

Acesso:
Login: admin
senha: 12345


---

##  O que mudou nesta versão?
* **Sem Backend / Sem Servidor:** Não requer PHP, Apache, XAMPP ou banco de dados relacional MySQL. Roda direto no navegador.
* **Persistência Local (`LocalStorage`):** Simula um banco de dados completo salvando livros, alunos, empréstimos e administradores diretamente no navegador.
* **PWA Pronto:** Funciona offline e pode ser instalado no celular ou computador.


---




##  Como Executar Localmente

Como a aplicação roda inteiramente no navegador, você não precisa de servidores complexos.:
1. Baixe ou clone este repositório em seu computador.
2. Certifique-se de que a estrutura de pastas está correta:
  

  ```text
   /
   ├── index.html
   ├── dashboard.html
   ├── livros.html
   ├── alunos.html
   ├── emprestimos.html
   ├── administradores.html
   ├── alterar-senha.html
   ├── manifest.json
   ├── sw.js
   ├── css/
   │   └── style.css
   └── js/
       ├── auth.js
       └── app.js