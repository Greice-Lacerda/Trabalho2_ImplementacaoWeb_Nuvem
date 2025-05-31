// Mapeamento de status: do formato interno (DB) para o formato de exibição (UI)
// Usado no cliente apenas para renderizar corretamente as classes CSS e exibir o status.
const STATUS_MAP_DB_TO_UI = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluído",
};

// --- Elementos do DOM ---
const messageContainer = document.getElementById("messageContainer");
const newTaskOption = document.getElementById("newTaskOption");
const createShoppingListOption = document.getElementById(
  "createShoppingListOption"
);

const taskForm = document.getElementById("task-form");
const addTaskFormContent = document.getElementById("addTaskFormContent");

const taskTitleInput = document.getElementById("task-title");
const taskDescriptionTextarea = document.getElementById("task-description");
const taskStatusSelect = document.getElementById("task-status");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("task-list");

const shoppingListContainer = document.getElementById("shoppingListContainer");
const shoppingListCheckboxes = document.getElementById(
  "shoppingListCheckboxes"
);

const updateForm = document.getElementById("updateForm");
const updateTaskIdInput = document.getElementById("updateTaskId");
const updateTitleInput = document.getElementById("updateTitle");
const updateDescriptionTextarea = document.getElementById("updateDescription");
const updateStatusSelect = document.getElementById("updateStatus");
const saveUpdateBtn = document.getElementById("saveUpdateBtn");
const cancelUpdateBtn = document.getElementById("cancelUpdate");

// Itens padrão para a lista de compras
const defaultShoppingItems = [
  "Leite",
  "Pão",
  "Ovos",
  "Queijo",
  "Presunto",
  "Café",
  "Açúcar",
  "Arroz",
  "Feijão",
  "Macarrão",
  "Óleo",
  "Sal",
  "Frutas (variadas)",
  "Verduras (folhas)",
  "Tomate",
  "Cebola",
  "Alho",
  "Carne (frango/bovina)",
  "Peixe",
  "Refrigerante",
  "Água mineral",
  "Sabonete",
  "Shampoo",
  "Condicionador",
  "Creme dental",
  "Papel higiênico",
  "Detergente",
  "Água sanitária",
  "Sabão em pó",
  "Amaciante",
  "Esponja de louça",
  "Saco de lixo",
];

// --- Funções Auxiliares de UI ---

/**
 * Exibe uma mensagem de sucesso ou erro na interface.
 * @param {string} msg A mensagem a ser exibida.
 * @param {string} type O tipo de mensagem ('success' ou 'error').
 */
function showMessage(msg, type) {
  messageContainer.textContent = msg;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = "block"; // Mostra a mensagem
  setTimeout(() => {
    messageContainer.style.display = "none"; // Oculta após 5 segundos
  }, 5000);
}

// --- Funções de Interação com o Servidor (Apps Script) ---

/**
 * Busca todas as tarefas do servidor (Planilha Google) e as renderiza na UI.
 */
async function fetchAndRenderTasks() {
  taskList.innerHTML = "<li>Carregando tarefas...</li>"; // Mensagem de carregamento
  try {
    // Chama a função 'fetchTasks' no Code.gs
    await google.script.run
      .withSuccessHandler(renderTasks) // Função de sucesso: renderiza as tarefas
      .withFailureHandler(function (error) {
        // Função de falha: exibe erro
        console.error("Erro ao buscar tarefas:", error);
        showMessage(`Erro ao carregar tarefas: ${error.message}`, "error");
        taskList.innerHTML = "<li>Erro ao carregar tarefas.</li>";
      })
      .fetchTasks(); // Executa a função do lado do servidor
  } catch (error) {
    showMessage("Erro de conexão ao carregar tarefas.", "error");
    taskList.innerHTML = "<li>Erro de conexão ao carregar tarefas.</li>";
    console.error("Erro ao chamar fetchTasks:", error);
  }
}

/**
 * Adiciona uma nova tarefa ao servidor (Planilha Google).
 * @param {object} taskData Objeto com os dados da tarefa (title, description, status - em UI/português).
 */
async function addTaskToSheet(taskData) {
  try {
    // Chama a função 'addTask' no Code.gs
    await google.script.run
      .withSuccessHandler(function (data) {
        console.log("Tarefa adicionada com sucesso:", data);
        showMessage("Tarefa adicionada com sucesso!", "success");
        taskTitleInput.value = ""; // Limpa os campos
        taskDescriptionTextarea.value = "";
        taskStatusSelect.value = "Pendente"; // Volta para o status padrão
        if (createShoppingListOption.checked) {
          generateShoppingCheckboxes();
        }
        fetchAndRenderTasks(); // Recarrega a lista de tarefas
      })
      .withFailureHandler(function (error) {
        console.error("Erro ao adicionar tarefa:", error);
        showMessage(`Erro ao adicionar tarefa: ${error.message}`, "error");
      })
      .addTask(taskData);
  } catch (error) {
    showMessage("Erro de conexão ao adicionar tarefa.", "error");
    console.error("Erro ao chamar addTask:", error);
  }
}

/**
 * Atualiza uma tarefa existente no servidor (Planilha Google).
 * @param {string} taskId O ID da tarefa a ser atualizada.
 * @param {object} updatedData Os dados atualizados da tarefa (title, description, status - em UI/português).
 */
async function updateTaskInSheet(taskId, updatedData) {
  try {
    // Chama a função 'updateTask' no Code.gs
    await google.script.run
      .withSuccessHandler(function (data) {
        console.log("Tarefa atualizada com sucesso:", data);
        showMessage("Tarefa atualizada com sucesso!", "success");
        updateForm.reset(); // Limpa e oculta o formulário de atualização
        updateForm.style.display = "none";
        fetchAndRenderTasks(); // Recarrega a lista de tarefas
      })
      .withFailureHandler(function (error) {
        console.error("Erro ao atualizar tarefa:", error);
        showMessage(`Erro ao atualizar tarefa: ${error.message}`, "error");
      })
      .updateTask(taskId, updatedData);
  } catch (error) {
    showMessage("Erro de conexão ao atualizar tarefa.", "error");
    console.error("Erro ao chamar updateTask:", error);
  }
}

/**
 * Exclui uma tarefa do servidor (Planilha Google).
 * @param {string} taskId O ID da tarefa a ser excluída.
 */
async function deleteTaskFromSheet(taskId) {
  try {
    if (confirm(`Tem certeza que deseja excluir a tarefa?`)) {
      // Confirmação antes de excluir
      // Chama a função 'deleteTask' no Code.gs
      await google.script.run
        .withSuccessHandler(function () {
          // A função não retorna dados, apenas sucesso/falha
          console.log("Tarefa excluída.");
          showMessage("Tarefa excluída com sucesso!", "success");
          fetchAndRenderTasks(); // Recarrega a lista de tarefas
        })
        .withFailureHandler(function (error) {
          console.error("Erro ao excluir tarefa:", error);
          showMessage(`Erro ao excluir tarefa: ${error.message}`, "error");
        })
        .deleteTask(taskId);
    }
  } catch (error) {
    showMessage("Erro de conexão ao excluir tarefa.", "error");
    console.error("Erro ao chamar deleteTask:", error);
  }
}

// --- Funções de Renderização e Lógica do UI ---

/**
 * Renderiza a lista de tarefas na interface do usuário.
 * @param {Array<object>} tasks Um array de objetos de tarefa (com status em UI/português).
 */
function renderTasks(tasks) {
  taskList.innerHTML = ""; // Limpa o container antes de renderizar
  if (tasks.length === 0) {
    taskList.innerHTML = "<li>Nenhuma tarefa cadastrada.</li>";
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id; // Define o ID da tarefa como um atributo de dado

    const displayStatus = task.status; // O status já vem em português do servidor

    // Determina a classe CSS com base no status do DB (que o servidor já mapeou para UI)
    // Isso é para que as classes CSS como 'status-pending' funcionem.
    const statusClassKey = Object.keys(STATUS_MAP_DB_TO_UI).find(
      (key) => STATUS_MAP_DB_TO_UI[key] === displayStatus
    );
    li.classList.add(`status-${statusClassKey || "unknown"}`); // Adiciona uma classe com base no status

    li.innerHTML = `
      <span class="task-title">${task.title}</span> ${
      task.description // Exibe a descrição se houver
        ? `<p class="task-description">${task.description}</p>`
        : ""
    }
      <div class="task-actions">
        <span class="task-status">${displayStatus}</span> 
        <select class="status-selector">
          <option value="Pendente" ${
            displayStatus === "Pendente" ? "selected" : ""
          }>Pendente</option>
          <option value="Em Progresso" ${
            displayStatus === "Em Progresso" ? "selected" : ""
          }>Em Progresso</option>
          <option value="Concluído" ${
            displayStatus === "Concluído" ? "selected" : ""
          }>Concluído</option>
        </select>
        <button class="update-status-btn primary-button">Atualizar Status</button>
        <button class="edit-btn edit-button">Editar</button>
        <button class="delete-btn delete-button">Excluir</button>
      </div>
    `;
    taskList.appendChild(li); // Adiciona a tarefa à lista
  });
}

/**
 * Gera checkboxes para os itens da lista de compras padrão.
 */
function generateShoppingCheckboxes() {
  shoppingListCheckboxes.innerHTML = ""; // Limpa antes de adicionar
  defaultShoppingItems.forEach((item, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" id="item${index}" value="${item}">
      ${item}
    `;
    shoppingListCheckboxes.appendChild(label);
  });
}

// --- Event Listeners ---

// Alternar entre formulário de nova tarefa e lista de compras
newTaskOption.addEventListener("change", () => {
  if (newTaskOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "none";
    taskDescriptionTextarea.placeholder = "Descrição (opcional)";
    taskTitleInput.value = "";
    taskDescriptionTextarea.value = "";
  }
});

createShoppingListOption.addEventListener("change", () => {
  if (createShoppingListOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "block";
    generateShoppingCheckboxes();
    taskTitleInput.value = "Lista de Compras"; // Preenche o título automaticamente
    taskDescriptionTextarea.value = "";
    taskDescriptionTextarea.placeholder =
      "Itens selecionados aparecerão aqui...";
  }
});

// Adicionar Tarefa / Criar Lista de Compras ao enviar o formulário
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o recarregamento da página

  const title = taskTitleInput.value.trim();
  const statusUI = taskStatusSelect.value;
  let description = taskDescriptionTextarea.value.trim();

  if (!title) {
    showMessage("O título da tarefa é obrigatório.", "error");
    return;
  }

  // Lógica específica para lista de compras
  if (createShoppingListOption.checked) {
    const selectedItems = Array.from(
      shoppingListCheckboxes.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => `- ${checkbox.value}`); // Formata como lista
    description = selectedItems.join("\n"); // Une os itens com quebra de linha

    if (selectedItems.length === 0) {
      showMessage(
        "Selecione pelo menos um item para a lista de compras.",
        "error"
      );
      return;
    }
    taskTitleInput.value = "Lista de Compras"; // Garante que o título seja "Lista de Compras"
  }

  const taskData = {
    title: title,
    description: description,
    status: statusUI, // O status é enviado em português e mapeado no servidor
  };

  await addTaskToSheet(taskData); // Chama a função para adicionar ao Apps Script
});

// Event listener para botões de Editar, Excluir e Atualizar Status na lista de tarefas
taskList.addEventListener("click", async (event) => {
  const target = event.target;
  const li = target.closest("li"); // Encontra o <li> pai da ação
  const taskId = li ? li.dataset.id : null; // Pega o ID do <li>

  if (!taskId) return; // Se não encontrou o ID, não faz nada

  if (target.classList.contains("edit-btn")) {
    try {
      // Chama a função 'getTaskById' no Code.gs para obter os detalhes da tarefa
      await google.script.run
        .withSuccessHandler(function (task) {
          updateTaskIdInput.value = task.id;
          updateTitleInput.value = task.title;
          updateDescriptionTextarea.value = task.description || "";
          updateStatusSelect.value = task.status; // Preenche com o status em português
          updateForm.style.display = "block"; // Mostra o formulário de atualização
          window.scrollTo({ top: updateForm.offsetTop, behavior: "smooth" }); // Rola para o formulário
        })
        .withFailureHandler(function (error) {
          console.error("Erro ao buscar tarefa para edição:", error);
          showMessage(
            `Erro ao carregar tarefa para edição: ${error.message}`,
            "error"
          );
        })
        .getTaskById(taskId);
    } catch (error) {
      showMessage("Erro de conexão ao carregar tarefa para edição.", "error");
      console.error("Erro ao carregar tarefa para edição:", error);
    }
  } else if (target.classList.contains("delete-btn")) {
    await deleteTaskFromSheet(taskId); // Chama a função para excluir
  } else if (target.classList.contains("update-status-btn")) {
    // Ação para atualizar status diretamente da lista
    const newStatusUI = li.querySelector(".status-selector").value; // Pega o novo status em português
    await updateTaskInSheet(taskId, { status: newStatusUI }); // Chama a função para atualizar
  }
});

// Salvar Alterações (do formulário de atualização)
updateForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o envio padrão do formulário
  const id = updateTaskIdInput.value;
  const title = updateTitleInput.value.trim();
  const description = updateDescriptionTextarea.value.trim();
  const statusUI = updateStatusSelect.value; // Status em português

  if (!title) {
    showMessage("O título da tarefa é obrigatório para atualização.", "error");
    return;
  }

  const updatedData = {
    title: title,
    description: description,
    status: statusUI, // O status é enviado em português e mapeado no servidor
  };

  await updateTaskInSheet(id, updatedData); // Chama a função para atualizar
});

// Cancelar atualização
cancelUpdateBtn.addEventListener("click", () => {
  updateForm.reset(); // Limpa o formulário
  updateForm.style.display = "none"; // Oculta o formulário
});

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  // fetchAndRenderTasks() só é chamado APÓS a API do Apps Script ser carregada
  // (Lógica de carregamento agora está no index.html)

  generateShoppingCheckboxes(); // Gera os checkboxes da lista de compras
  // Garante que o formulário de adicionar tarefa esteja visível por padrão
  newTaskOption.checked = true;
  addTaskFormContent.style.display = "block";
  shoppingListContainer.style.display = "none";
});

// Adiciona o listener para o carregamento da API do Apps Script
// Esta parte será executada APÓS o script do Apps Script ser carregado pelo index.html
// e disponibilizar `google.script.run`.
if (typeof google !== "undefined" && google.script && google.script.run) {
  // Se já carregou, pode renderizar as tarefas imediatamente
  fetchAndRenderTasks();
} else {
  // Caso contrário, significa que há um problema com o carregamento da API.
  // A mensagem de erro já será tratada no index.html.
  console.error(
    "google.script.run não está disponível. Verifique o carregamento da API do Apps Script no index.html."
  );
}
