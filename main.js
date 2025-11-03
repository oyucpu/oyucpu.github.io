// ========================================
// PORTFOLIO TERMINAL - ANTONIO OYUELA
// Archivo: main.js
// Versión unificada, completa y optimizada
// Incluye: modos.js, prompt.js, script.js, commands.js
// ========================================

class TerminalPortfolio {
  constructor() {
    // Elementos DOM
    this.commandInput = document.getElementById('commandInput');
    this.terminal = document.getElementById('terminal');
    this.currentPrompt = document.getElementById('currentPrompt');
    this.dateElement = document.getElementById('date');
    this.guestTitle = document.querySelector('.guest-title');

    // Estado
    this.commandHistory = [];
    this.historyIndex = -1;
    this.isAdminMode = false;
    this.isHalloweenMode = false;

    // Datos de búsqueda
    this.searchCategories = this.initializeSearchData();
    this.generalSearchData = this.initializeGeneralSearchData();

    // Inicialización
    this.init();
    this.setupEventListeners();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  init() {
    this.updateDateTime();
    this.commandInput.focus();
    this.terminal.addEventListener('click', () => this.commandInput.focus());
  }

  setupEventListeners() {
    this.commandInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('a') && !e.target.closest('input')) {
        this.commandInput.focus();
      }
    });
  }

  // ========================================
  // UTILIDADES
  // ========================================
  updateDateTime() {
    const dateElement = this.dateElement;
    if (!dateElement) return;

    let dateText = '';
    const today = new Date();

    if (this.isHalloweenMode) {
      const month = today.getMonth(); // 0=enero, 9=octubre, 10=noviembre
      if (month === 9 || month === 10) {
        dateText = '31 de Octubre - Noche de Brujas';
      } else {
        dateText = today.toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      }
    } else if (this.isAdminMode) {
      dateText = today.toLocaleString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } else {
      dateText = today.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    dateElement.textContent = dateText;
  }

  updatePrompt() {
    const symbol = document.querySelector('#currentPrompt .prompt-symbol');
    const user = document.querySelector('#currentPrompt .prompt-user');
  
    if (!symbol || !user) {
      console.warn('No se encontraron los elementos del prompt');
      return;
    }

    if (this.isHalloweenMode) {
      symbol.textContent = 'pumpkin';
      user.textContent = 'ghost';
      symbol.style.textShadow = '0 0 4px rgba(255, 165, 0, 0.5)';
      user.style.textShadow = '0 0 4px rgba(255, 165, 0, 0.5)';
    } else if (this.isAdminMode) {
      symbol.textContent = 'right arrow';
      user.textContent = 'admin';
      symbol.style.textShadow = '0 0 3px rgba(16, 185, 129, 0.5)';
      user.style.textShadow = '0 0 3px rgba(16, 185, 129, 0.5)';
    } else {
      symbol.textContent = '$';
      user.textContent = 'invitado';
      symbol.style.textShadow = '';
      user.style.textShadow = '';
    }
  }

  scrollToBottom() {
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  createElement(tag, className = '', html = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  }

  highlightMatch(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="search-match">$1</span>');
  }

  levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // ========================================
  // HISTORIAL
  // ========================================
  addToHistory(command) {
    const cmd = command.trim();
    if (!cmd || (this.commandHistory.length && this.commandHistory[this.commandHistory.length - 1] === cmd)) return;
    this.commandHistory.push(cmd);
    const max = this.isAdminMode ? 100 : 60;
    if (this.commandHistory.length > max) this.commandHistory.shift();
    this.historyIndex = -1;
  }

  navigateHistory(direction) {
    if (!this.commandHistory.length) return;
    if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      this.commandInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === 'down') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.commandInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.commandInput.value = '';
      }
    }
  }

  // ========================================
  // AUTOCOMPLETADO
  // ========================================
  autocompleteCommand() {
    const input = this.commandInput.value.toLowerCase().trim();
    if (!input) return;

    const commands = ['about', 'social', 'skills', 'education', 'experience', 'projects', 'help', 'search', 'tools', 'whoami', 'history', 'clear', 'date', 'theme', 'halloween'];
    if (this.isAdminMode) commands.push('guest', 'contact', 'pwd', 'ls');
    else commands.push('admin');

    const matches = commands.filter(cmd => cmd.startsWith(input));
    if (matches.length === 1) {
      this.commandInput.value = matches[0];
    } else if (matches.length > 1) {
      const div = this.createElement('div', 'command-output', `
        <div class="indent">
          ${this.isAdminMode ? 'Posibles comandos:' : ''}
          ${matches.map(c => `<span class="command">${c}</span>`).join(' • ')}
        </div>
      `);
      this.terminal.insertBefore(div, this.currentPrompt);
      this.scrollToBottom();
    }
  }

  // ========================================
  // PROMPT
  // ========================================
  createCommandLine(command) {
    const div = this.createElement('div');
    const symbol = this.isHalloweenMode ? 'pumpkin' : (this.isAdminMode ? 'right arrow' : '$');
    const user = this.isHalloweenMode ? 'ghost' : (this.isAdminMode ? 'admin' : 'invitado');
    const path = this.isAdminMode ? ' <span class="prompt-path">~/portfolio</span>' : '';
    div.innerHTML = `<span class="prompt-symbol">${symbol}</span> <span class="prompt-user">${user}</span>${path} ${command}`;
    div.style.marginBottom = this.isAdminMode ? '10px' : '5px';
    return div;
  }

  refreshAllPrompts() {
    const currentSymbol = document.querySelector('#currentPrompt .prompt-symbol').textContent;
    document.querySelectorAll('.prompt-symbol').forEach(el => {
      if (!el.closest('#currentPrompt')) {
        el.textContent = currentSymbol;
      }
    });
  }

  // ========================================
  // MODOS
  // ========================================
  toggleAdminMode() {
    this.isAdminMode = !this.isAdminMode;
    document.body.classList.toggle('admin-mode', this.isAdminMode);
    this.updatePrompt();
    this.updateDateTime();
    this.refreshAllPrompts();

    const msg = this.isAdminMode 
      ? 'Modo administrador activado' 
      : 'Modo invitado activado';
  
    const div = this.createElement('div');
    div.innerHTML = `<span class="command">${msg}</span>`;
    this.terminal.insertBefore(div, this.currentPrompt);
    return div;
  }

  switchToAdminMode() {
    if (this.isAdminMode) return this.alreadyInMode('admin');
    this.isAdminMode = true;
    document.body.classList.add('mode-transition');
    setTimeout(() => {
      document.body.classList.add('admin-mode');
      if (this.guestTitle) this.guestTitle.style.display = 'none';
      this.updatePrompt();
      this.updateDateTime();
      this.refreshAllPrompts();
      setTimeout(() => {
        document.body.classList.remove('mode-transition');
        document.body.classList.add('active');
      }, 100);
    }, 250);

    return this.createElement('div', 'command-output', `
      <div class="section-title">Modo Administrador Activado</div>
      <div class="indent">
        <div>Bienvenido al <span class="title">Portfolio Terminal v2.0</span></div>
        <div>Acceso completo concedido - Funcionalidades avanzadas habilitadas</div>
        <div>Terminal mejorada con nuevos estilos y características</div>
        <br>
        <div class="help-hint">Usa <span class="command">guest</span> para volver al modo invitado</div>
      </div>
    `);
  }

  switchToGuestMode() {
    if (!this.isAdminMode) return this.alreadyInMode('guest');
    this.isAdminMode = false;
    document.body.classList.add('mode-transition');
    setTimeout(() => {
      document.body.classList.remove('admin-mode');
      if (this.guestTitle) this.guestTitle.style.display = 'inline';
      this.updatePrompt();
      this.updateDateTime();
      this.refreshAllPrompts();
      setTimeout(() => {
        document.body.classList.remove('mode-transition');
        document.body.classList.add('active');
      }, 100);
    }, 250);

    return this.createElement('div', 'command-output', `
      <div class="section-title">Modo Invitado Activado</div>
      <div class="indent">
        <div>Volviendo al <span class="title">Portfolio v1.0</span></div>
        <div>Modo básico - Funcionalidades estándar</div>
        <br>
        <div class="help-hint">Usa <span class="command">admin</span> para acceder al modo avanzado</div>
      </div>
    `);
  }

  alreadyInMode(mode) {
    return this.createElement('div', 'command-output', `
      <div class="indent">
        <div class="error">Ya estás en modo ${mode === 'admin' ? 'administrador' : 'invitado'}</div>
        <div>Usa <span class="command">${mode === 'admin' ? 'guest' : 'admin'}</span> para cambiar</div>
      </div>
    `);
  }

// ========================================
// 🎃 MODO HALLOWEEN – Solo disponible el 31 de octubre
// ========================================
toggleHalloweenMode() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth(); // 0 = enero, 9 = octubre

  const isHalloweenDate = (day === 31 && month === 9);
  const div = this.createElement('div', 'command-output');

  if (!isHalloweenDate) {
  
  // Código nuevo
  
  /* if (this.isHalloweenMode) {
      this.isHalloweenMode = false;
      document.body.classList.remove('halloween-mode');
      this.updatePrompt();
      this.updateDateTime();
      this.refreshAllPrompts();
    } */
  
    div.innerHTML = `
      <div class="section-title">🎃 Modo Halloween bloqueado</div>
      <div class="indent">
        <div>👻 El modo Halloween solo está disponible el <span class="command">31 de octubre</span>.</div>
        <div>🕒 Hoy es: ${today.toLocaleDateString('es-ES')}</div>
      </div>
    `;
    return div;
  }

  // Activar o desactivar si es 31 de octubre
  this.isHalloweenMode = !this.isHalloweenMode;
  document.body.classList.toggle('halloween-mode', this.isHalloweenMode);
  this.updatePrompt();
  this.updateDateTime();
  this.refreshAllPrompts();

  const msg = this.isHalloweenMode
    ? '🎃 ¡Truco o trato! Modo Halloween activado 👻'
    : '💀 Modo normal restaurado. Hasta el próximo Halloween.';

  div.innerHTML = this.isHalloweenMode
    ? `<div class="section-title">${msg}</div>`
    : `<div class="indent">${msg}</div>`;

  return div;
}


  // ========================================
  // COMANDOS
  // ========================================
  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        this.executeCommand();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory('down');
        break;
      case 'Tab':
        e.preventDefault();
        this.autocompleteCommand();
        break;
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          this.clearTerminal();
        }
        break;
    }
  }

  executeCommand() {
    const command = this.commandInput.value.trim();
    if (!command) return;

    const commandLine = this.createCommandLine(command);
    this.terminal.insertBefore(commandLine, this.currentPrompt);
    this.addToHistory(command);

    const output = this.processCommand(command);
    if (output) this.terminal.insertBefore(output, this.currentPrompt);

    this.commandInput.value = '';
    this.scrollToBottom();
  }

  processCommand(command) {
    const [cmd, ...args] = command.toLowerCase().split(' ');
    const query = args.join(' ');

    const commands = {
      admin: () => this.switchToAdminMode(),
      guest: () => this.switchToGuestMode(),
      halloween: () => this.toggleHalloweenMode(),
      help: () => this.showHelp(),
      about: () => this.showAbout(),
      social: () => this.showSocial(),
      contact: () => this.showSocial(),
      skills: () => this.showSkills(),
      education: () => this.showEducation(),
      experience: () => this.showExperience(),
      projects: () => this.showProjects(),
      whoami: () => this.showWhoami(),
      search: () => this.search(query),
      history: () => this.showHistory(),
      clear: () => this.clearTerminal(),
      cls: () => this.clearTerminal(),
      date: () => this.showDate(),
      pwd: () => this.isAdminMode ? this.showPwd() : this.commandNotFound('pwd'),
      ls: () => this.isAdminMode ? this.showLs() : this.commandNotFound('ls'),
      tools: () => this.showTools(args[0]),
      theme: () => this.setTheme(args[0])
    };

    return commands[cmd] ? commands[cmd]() : this.commandNotFound(command);
  }

  // ========================================
  // COMANDOS ESPECÍFICOS
  // ========================================
  showDate() {
    const now = new Date();
    const full = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const time = now.toLocaleTimeString('es-ES');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return this.createElement('div', 'command-output', `
      <div class="indent">
        <div>Fecha: ${full}</div>
        <div>Hora: <span class="command">${time}</span></div>
        <div>Zona horaria: ${tz}</div>
      </div>
    `);
  }

  showPwd() {
    return this.createElement('div', 'command-output', '<div class="indent"><span class="command">/home/admin/portfolio</span></div>');
  }

  showLs() {
    return this.createElement('div', 'command-output', `
      <div class="indent">
        <span class="command">about.txt</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="command">skills.json</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="command">projects/</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="command">contact.md</span>
      </div>
    `);
  }

  setTheme(mode) {
    if (!mode || !['dark', 'light'].includes(mode)) {
      return this.createElement('div', 'command-output', `
        <div class="error">Modo inválido.</div>
        <div class="indent">Uso: <span class="command">theme [dark|light]</span></div>
      `);
    }
    return this.createElement('div', 'command-output', `<div class="indent">Tema ${mode} disponible en futuras versiones.</div>`);
  }

  showHelp() {
    const adminCommands = `
      <div class="section-title">Comandos disponibles (Modo Admin):</div>
      <div class="indent">
        <div><span class="command">about</span> - Información sobre mí</div>
        <div><span class="command">social</span> - Mis redes sociales y contacto</div>
        <div><span class="command">skills</span> - Habilidades técnicas</div>
        <div><span class="command">tools [categoría]</span> - Herramientas por categoría</div>
        <div><span class="command">education</span> - Formación académica</div>
        <div><span class="command">experience</span> - Experiencia laboral</div>
        <div><span class="command">projects</span> - Mis proyectos</div>
        <div><span class="command">search [término]</span> - Buscar contenido</div>
        <div><span class="command">history</span> - Historial de comandos</div>
        <div><span class="command">clear</span> - Limpiar terminal</div>
        <div><span class="command">date</span> - Fecha y hora actual</div>
        <div><span class="command">whoami</span> - Info del usuario</div>
        <div><span class="command">pwd</span> - Directorio actual</div>
        <div><span class="command">ls</span> - Listar archivos</div>
        <div><span class="command">guest</span> - Cambiar a modo invitado</div>
        <div><span class="command">halloween</span> - Activar/desactivar modo Halloween</div>
      </div>
      <div class="help-hint">Usa ↑↓ para historial • Tab para autocompletar • Ctrl+L para limpiar</div>
    `;

    const guestCommands = `
      <div class="section-title">Comandos disponibles:</div>
      <div class="indent">
        <div><span class="command">about</span> - Información sobre mi</div>
        <div><span class="command">social</span> - Mis redes sociales</div>
        <div><span class="command">skills</span> - Habilidades</div>
        <div><span class="command">tools [categoría]</span> - Herramientas agrupadas</div>
        <div><span class="command">education</span> - Formación académica</div>
        <div><span class="command">experience</span> - Experiencia laboral</div>
        <div><span class="command">projects</span> - Mis proyectos</div>
        <div><span class="command">whoami</span> - Información del usuario</div>
        <div><span class="command">search [término]</span> - Buscar por categorías o contenido</div>
        <div><span class="command">date</span> - Mostrar fecha y hora actual</div>
        <div><span class="command">history</span> - Historial de comandos</div>
        <div><span class="command">clear</span> - Limpiar terminal</div>
        <div><span class="command">admin</span> - Acceder al modo administrador</div>
        <div><span class="command">halloween</span> - Activar/desactivar modo Halloween</div>
      </div>
      <div class="help-hint">Usa las flechas ↑↓ para navegar por el historial</div>
    `;

    return this.createElement('div', 'command-output', this.isAdminMode ? adminCommands : guestCommands);
  }

  showAbout() {
    return this.createElement('div', 'command-output', `
      <div class="section-title">Sobre mí</div>
      <div class="indent">
        <div>Hola, soy <span class="command">Antonio Oyuela</span>, un desarrollador apasionado por la tecnología, el diseño y las experiencias digitales.</div>
        <div>Me especializo en <span class="command">frontend</span> y <span class="command">backend</span>, con enfoque en crear interfaces intuitivas y funcionales.</div>
        <div>Este portfolio es una terminal interactiva que refleja mi estilo: <span class="command">creativo</span>, <span class="command">técnico</span> y <span class="command">divertido</span>.</div>
        <br>
        <div class="help-hint">Escribe <span class="command">social</span> para contactarme</div>
      </div>
    `);
  }

  showSocial() {
    return this.createElement('div', 'command-output', `
      <div class="section-title">Redes y Contacto</div>
      <div class="indent">
        <div><span class="command">GitHub:</span> <a href="https://github.com/oyucpu" target="_blank">github.com/Antonio-92-cpu</a></div>
        <div><span class="command">LinkedIn:</span> <a href="https://www.linkedin.com/in/antonio-oyuela-s%C3%A1nchez-0a3185141/" target="_blank">linkedin.com/in/antonio-oyuela</a></div>
        <div><span class="command">Email:</span> <a href="mailto:antonio.oyuela.dev@gmail.com">antonio.oyuela.dev@gmail.com</a></div>
        <br>
        <div class="help-hint">¡Hablemos! Escribe <span class="command">contact</span> para más opciones</div>
      </div>
    `);
  }

  showWhoami() {
    const mode = this.isHalloweenMode ? 'ghost' : (this.isAdminMode ? 'admin' : 'invitado');
    return this.createElement('div', 'command-output', `
      <div class="indent">
        <div>Usuario: <span class="command">${mode}</span></div>
        <div>Terminal: <span class="command">Portfolio v2.0</span></div>
        <div>Acceso: ${this.isAdminMode ? '<span class="success">Completo</span>' : '<span class="warning">Limitado</span>'}</div>
      </div>
    `);
  }

  showSkills() {
    const skills = Object.values(this.searchCategories).map(cat => cat.title).join(' • ');
    return this.createElement('div', 'command-output', `
      <div class="section-title">Habilidades principales</div>
      <div class="indent">${skills}</div>
      <div class="help-hint">Usa <span class="command">tools [categoría]</span> para ver herramientas específicas</div>
    `);
  }

  showTools(category = '') {
    const cat = Object.values(this.searchCategories).find(c => c.aliases.includes(category.toLowerCase()));
    if (!cat) {
      return this.createElement('div', 'command-output', `
        <div class="error">Categoría no encontrada.</div>
        <div class="indent">Categorías: ${Object.keys(this.searchCategories).join(', ')}</div>
      `);
    }
    const tools = cat.content.tools?.join(' • ') || 'Ninguna herramienta listada';
    return this.createElement('div', 'command-output', `
      <div class="section-title">${cat.title}</div>
      <div class="indent"><span class="command">Herramientas:</span> ${tools}</div>
    `);
  }

  showEducation() {
    let html = '<div class="section-title">Formación Académica</div><div class="indent">';
    Object.values(this.searchCategories).forEach(cat => {
      if (cat.content.education) {
        html += `<div class="subsection">${cat.title}</div>`;
        cat.content.education.forEach(edu => {
          html += `<div>• ${edu}</div>`;
        });
      }
    });
    html += '</div>';
    return this.createElement('div', 'command-output', html);
  }

  showExperience() {
    return this.createElement('div', 'command-output', `
      <div class="section-title">Experiencia Laboral</div>
      <div class="indent">
        <div><span class="command">Freelance Full Stack</span> - React, Node.js, PostgreSQL</div>
        <div><span class="command">Prácticas en SomotierraTech</span> - Desarrollo web</div>
        <div><span class="command">Proyectos personales</span> - API, UI/UX, terminal interactiva</div>
      </div>
    `);
  }

  showProjects() {
    let html = '<div class="section-title">Proyectos Destacados</div><div class="indent">';
    Object.values(this.searchCategories).forEach(cat => {
      if (cat.content.projects) {
        cat.content.projects.forEach(proj => {
          html += `<div>• <span class="command">${proj}</span></div>`;
        });
      }
    });
    html += '</div>';
    return this.createElement('div', 'command-output', html);
  }

  search(term) {
    if (!term) {
      return this.createElement('div', 'command-output', `
        <div class="error">Término de búsqueda requerido.</div>
        <div class="indent">Uso: <span class="command">search [palabra]</span></div>
      `);
    }

    const categoryResults = this.performCategorySearch(term.toLowerCase());
    const generalResults = this.performGeneralSearch(term.toLowerCase());

    let html = '<div class="section-title">Resultados de búsqueda</div>';
    if (categoryResults.length === 0 && generalResults.length === 0) {
      html += '<div class="indent">No se encontraron resultados para "<span class="command">' + term + '</span>"</div>';
    } else {
      if (categoryResults.length > 0) {
        html += '<div class="subsection">Categorías:</div><div class="indent">';
        categoryResults.forEach(res => {
          html += `<div>• <span class="command">${res.category}</span>: ${res.content}</div>`;
        });
        html += '</div>';
      }
      if (generalResults.length > 0) {
        html += '<div class="subsection">Coincidencias generales:</div><div class="indent">';
        generalResults.forEach(res => {
          html += `<div>• <span class="command">${res.section}</span>: ${res.snippet}</div>`;
        });
        html += '</div>';
      }
    }
    return this.createElement('div', 'command-output', html);
  }

  performCategorySearch(searchTerm) {
    const results = [];
    Object.values(this.searchCategories).forEach(cat => {
      let content = '';
      if (cat.content.skills?.some(s => s.toLowerCase().includes(searchTerm))) {
        content += cat.content.skills.filter(s => s.toLowerCase().includes(searchTerm)).map(s => this.highlightMatch(s, searchTerm)).join(', ') + ' ';
      }
      if (cat.content.education?.some(e => e.toLowerCase().includes(searchTerm))) {
        content += cat.content.education.filter(e => e.toLowerCase().includes(searchTerm)).map(e => this.highlightMatch(e, searchTerm)).join(', ') + ' ';
      }
      if (cat.content.tools?.some(t => t.toLowerCase().includes(searchTerm))) {
        content += cat.content.tools.filter(t => t.toLowerCase().includes(searchTerm)).map(t => this.highlightMatch(t, searchTerm)).join(', ') + ' ';
      }
      if (cat.content.projects?.some(p => p.toLowerCase().includes(searchTerm))) {
        content += cat.content.projects.filter(p => p.toLowerCase().includes(searchTerm)).map(p => this.highlightMatch(p, searchTerm)).join(', ') + ' ';
      }
      if (content) {
        results.push({ category: cat.title, content });
      }
    });
    return results;
  }

  performGeneralSearch(term) {
    return Object.entries(this.generalSearchData)
      .filter(([_, text]) => text.toLowerCase().includes(term))
      .map(([section, text]) => {
        const idx = text.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 50);
        const end = Math.min(text.length, idx + term.length + 50);
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet += '...';
        snippet = snippet.replace(new RegExp(`(${term})`, 'gi'), '<span class="search-highlight">$1</span>');
        return { section: section.charAt(0).toUpperCase() + section.slice(1), snippet };
      });
  }

  showHistory() {
    if (!this.commandHistory.length) {
      return this.createElement('div', 'command-output', `<div class="indent">No hay comandos en el historial.</div>`);
    }
    const count = this.isAdminMode ? 20 : 15;
    const history = this.commandHistory.slice(-count);
    let html = `<div class="section-title">Historial de comandos:</div><div class="indent">`;
    history.forEach((cmd, i) => {
      const idx = this.commandHistory.length - count + i;
      html += `<div><span class="command">${idx}:</span> ${cmd}</div>`;
    });
    html += `</div>`;
    if (this.commandHistory.length > count) {
      html += `<div class="help-hint">Mostrando últimos ${count} (${this.commandHistory.length - count} ocultos)</div>`;
    }
    return this.createElement('div', 'command-output', html);
  }

  clearTerminal() {
    Array.from(this.terminal.children).forEach(child => {
      if (child.id !== 'currentPrompt') child.remove();
    });
    const welcome = this.createElement('div', 'terminal-content', `
      <div class="command">Terminal limpia - <span class="error">${new Date().toLocaleString('es-ES')}</span></div>
      <div class="title welcome">${this.isAdminMode ? 'Portfolio Terminal v2.0' : 'Mi Portfolio v1.0'}</div>
      <div>Escribe <span class="command">help</span> para ver los comandos disponibles.</div>
    `);
    this.terminal.insertBefore(welcome, this.currentPrompt);
    return null;
  }

  commandNotFound(command) {
    const commands = this.isAdminMode
      ? ['about', 'social', 'skills', 'education', 'experience', 'projects', 'help', 'search', 'tools', 'guest', 'contact', 'pwd', 'ls', 'admin', 'theme', 'date', 'whoami', 'history', 'clear', 'halloween']
      : ['about', 'social', 'skills', 'education', 'experience', 'projects', 'help', 'search', 'tools', 'admin', 'date', 'whoami', 'history', 'clear', 'halloween'];

    const suggestions = commands.filter(c => this.levenshteinDistance(command.toLowerCase(), c) <= 2).slice(0, 3);
    let html = this.isAdminMode ? `<div>-bash: ${command}: command not found</div>` : `<div>-bash: ${command}: command not found</div>`;
    if (suggestions.length) {
      html += `<div class="indent">${this.isAdminMode ? '' : '¿Quizás quisiste decir: '}${suggestions.map(s => `<span class="command">${s}</span>`).join(', ')}?</div>`;
    }
    html += `<div class="indent">Escribe <span class="command">help</span> para ver todos los comandos.</div>`;
    return this.createElement('div', 'command-output error', html);
  }

  // ========================================
  // DATOS DE BÚSQUEDA
  // ========================================
  initializeSearchData() {
    return {
      informatica: {
        title: 'Informática y Sistemas',
        aliases: ['informatica', 'informática', 'sistemas', 'system', 'computer', 'ordenador'],
        content: {
          skills: [
            'Hirens Boot CD', 'Clonezilla', 'Windows', 'Linux', 'MacOS', 'Android', 
            'GParted', 'Terminal', 'Seguridad informática', 'Iptables'
          ],
          education: [
            'Técnico en Sistemas Microinformáticos y Redes - IES Gaspar Melchor de Jovellanos',
            'Operación de Sistemas Informáticos - Academia Colón Fuenlabrada', 
            'Montaje y Reparación de Sistemas Microinformáticos - Centro Tecnológico Getafe',
            'Sistemas Microinformáticos - Cursos Femxa',
            'Operación de Redes Departamentales - Cursos Femxa'
          ],
          tools: ['GParted', 'Clonezilla', 'Hiren\'s BootCD', 'VirtualBox', 'Iptables']
        }
      },
      programacion: {
        title: 'Programación y Desarrollo',
        aliases: ['programacion', 'programación', 'desarrollo', 'dev', 'coding', 'code'],
        content: {
          skills: [
            'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Angular', 
            'Astro', 'Node.js', 'Git', 'GitHub', 'PostgreSQL', 'MariaDB'
          ],
          education: [
            'Programación con Lenguajes Orientados a Objetos y Bases de Datos Relacionales - Cursos 0,0',
            'Desarrollo de Aplicaciones con Tecnologías Web - Academia Colón',
            'FP GS Desarrollo de Aplicaciones Web - IES Enrique Tierno Galván',
            'Confección y Publicación de Páginas Web - Cursos Femxa'
          ],
          tools: ['VS Code', 'Postman', 'Git', 'GitHub Desktop', 'XAMPP', 'Node.js'],
          projects: [
            'La Pesadilla de Rick y Morty - Aplicación web con API',
            'Portfolio Terminal - Terminal interactiva con JavaScript',
            'Sistema de Gestión Web - Aplicación fullstack en desarrollo'
          ]
        }
      },
      diseño: {
        title: 'Diseño y Multimedia',
        aliases: ['diseño', 'design', 'multimedia', 'grafico', 'gráfico'],
        content: {
          skills: [
            'Adobe Illustrator', 'Photoshop', 'InDesign', 'Premiere Pro', 
            'Adobe Dreamweaver', 'Paquete Corel Draw', 'Figma', 'UI/UX Design', 
            'Adobe Animate', 'Paquete Affinity', 'Canva'
          ],
          education: [
            'Diseño Editorial y Publicaciones Impresas y Multimedia - IES Virgen de la Paloma',
            'Desarrollo de Productos Editoriales Multimedia - Academia Colón Coslada',
            'Técnico Preimpresor Digital - IES Tajamar'
          ],
          tools: ['Adobe Illustrator', 'Photoshop', 'Figma', 'Canva', 'InDesign', 'Premiere Pro']
        }
      },
      seguridad: {
        title: 'Seguridad Informática',
        aliases: ['seguridad', 'security', 'ciberseguridad', 'cyber'],
        content: {
          skills: ['Maltego', 'FOCA', 'Seguridad informática', 'Iptables'],
          education: ['Seguridad Informática - Grupo Aspasa'],
          tools: ['Wireshark', 'Maltego', 'FOCA', 'Nmap', 'Kali Linux']
        }
      },
      redes: {
        title: 'Redes y Telecomunicaciones',
        aliases: ['redes', 'network', 'telecomunicaciones', 'comunicaciones'],
        content: {
          skills: ['Iptables', 'Redes departamentales'],
          education: [
            'Operación de Sistemas de Comunicación de Voz y Datos - Grupo Aspasia',
            'Operación de Redes Departamentales - Cursos Femxa',
            'Técnico en Sistemas Microinformáticos y Redes - IES Gaspar Melchor de Jovellanos'
          ],
          tools: ['Iptables', 'VirtualBox', 'Wireshark']
        }
      },
      idiomas: {
        title: 'Idiomas',
        aliases: ['idiomas', 'languages', 'lenguas'],
        content: {
          skills: ['Español (Nativo)', 'Inglés (Básico)', 'Portugués (Básico)']
        }
      }
    };
  }

  initializeGeneralSearchData() {
    return {
      about: 'Antonio Oyuela desarrollador apasionado tecnología diseño frontend backend experiencias digitales',
      social: 'GitHub LinkedIn Email redes sociales contacto Antonio-92-cpu',
      skills: 'HTML CSS JavaScript TypeScript React Angular Astro Node.js Git GitHub Adobe Illustrator Photoshop InDesign Premiere Pro Figma UI UX Design Español Inglés Portugués',
      education: 'Academia Colón Cursos Femxa IES Gaspar Melchor Jovellanos IES Tajamar Desarrollo Aplicaciones Web Técnico Sistemas Microinformáticos Redes',
      experience: 'Desarrollador Full Stack Frontend Freelance proyectos React Node.js Vue.js bases datos aplicaciones web interfaces usuario responsive HTML CSS JavaScript experiencia laboral trabajo SomotierraTech Pipote prácticas diseño UI UX',
      projects: 'Rick Morty Portfolio Terminal Sistema Gestión Web GitHub API aplicación interactiva HTML CSS JavaScript fullstack proyectos desarrollo'
    };
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  new TerminalPortfolio();
});