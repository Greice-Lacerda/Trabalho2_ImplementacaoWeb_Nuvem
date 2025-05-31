// A URL da sua API do Google Apps Script DEVE ser a URL de implantação do seu projeto.
// Certifique-se de que ela está correta após cada implantação (Deploy > New deployment > Web App).
const API_URL =
  "https://script.google.com/macros/s/AKfycbzaY2HwBg645Uz1oL-1KrL3e5V_6OcPWOec26VGBhFua0VCe4CYVJnJTGbx5YvxtyI/exec"; // VERIFIQUE ESTA URL!

// Mapeamento de status: do formato interno (DB) para o formato de exibição (UI)
const STATUS_MAP_DB_TO_UI = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluída",
};

// Elementos do DOM
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

// Array de itens padrão para a lista de compras
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

// --- Funções de Utilitário ---

function showMessage(message, type) {
  messageContainer.textContent = message;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = "block";
  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 5000); // Esconde a mensagem após 5 segundos
}

function generateShoppingCheckboxes() {
  shoppingListCheckboxes.innerHTML = ""; // Limpa os checkboxes existentes
  defaultShoppingItems.forEach((item, index) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = item;
    checkbox.id = `item-${index}`; // ID único para cada checkbox

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(item));
    shoppingListCheckboxes.appendChild(label);
  });
}

function getSelectedShoppingItems() {
  const selectedItems = [];
  const checkboxes = shoppingListCheckboxes.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  checkboxes.forEach((checkbox) => {
    selectedItems.push(checkbox.value);
  });
  return selectedItems.join(", "); // Retorna como string separada por vírgulas
}

// --- Funções de Comunicação com a API (Google Apps Script) ---

async function fetchAndRenderTasks() {
  try {
    const response = await fetch(`${API_URL}?action=fetchTasks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tasks = await response.json();
    renderTasks(tasks);
    showMessage("Tarefas carregadas com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    showMessage(
      "Erro ao carregar tarefas. Verifique a URL da API ou o console para mais detalhes.",
      "error"
    );
  }
}

async function addTaskToSheet(taskData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "addTask",
        title: taskData.titulo,
        description: taskData.descricao,
        status: taskData.status,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === "success") {
      showMessage("Tarefa adicionada com sucesso!", "success");
      taskForm.reset(); // Limpa o formulário após adicionar
      fetchAndRenderTasks(); // Recarrega a lista de tarefas
      // Se for lista de compras, desmarca os checkboxes
      if (createShoppingListOption.checked) {
        shoppingListCheckboxes
          .querySelectorAll('input[type="checkbox"]')
          .forEach((cb) => (cb.checked = false));
        taskDescriptionTextarea.placeholder =
          "Itens selecionados aparecerão aqui..."; // Reseta placeholder
        taskTitleInput.value = ""; // Limpa o título (se o usuário não o digitou)
      }
    } else {
      showMessage(`Erro ao adicionar tarefa: ${result.message}`, "error");
    }
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    showMessage(
      "Erro na comunicação com a API ao adicionar tarefa. Verifique o console.",
      "error"
    );
  }
}

async function getTaskById(taskId) {
  try {
    const response = await fetch(`${API_URL}?action=getTaskById&id=${taskId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const task = await response.json();
    if (task) {
      // Preenche o formulário de atualização
      updateTaskIdInput.value = task.id;
      updateTitleInput.value = task.titulo;
      updateDescriptionTextarea.value = task.descricao;
      updateStatusSelect.value = task.status; // Define o status
      updateForm.style.display = "block"; // Mostra o formulário de atualização
      addTaskFormContent.style.display = "none"; // Esconde o formulário de adicionar
      shoppingListContainer.style.display = "none"; // Esconde a lista de compras
    } else {
      showMessage("Tarefa não encontrada.", "error");
    }
  } catch (error) {
    console.error("Erro ao buscar tarefa para edição:", error);
    showMessage(
      "Erro ao buscar tarefa para edição. Verifique o console.",
      "error"
    );
  }
}

async function updateTaskInSheet(taskId, updatedData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "updateTask",
        id: taskId,
        title: updatedData.titulo,
        description: updatedData.descricao,
        status: updatedData.status,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === "success") {
      showMessage("Tarefa atualizada com sucesso!", "success");
      updateForm.reset();
      updateForm.style.display = "none";
      addTaskFormContent.style.display = "block"; // Mostra o formulário de adicionar novamente
      if (createShoppingListOption.checked) {
        // Se a lista de compras estava ativada, reexibe
        shoppingListContainer.style.display = "block";
      }
      fetchAndRenderTasks(); // Recarrega a lista de tarefas
    } else {
      showMessage(`Erro ao atualizar tarefa: ${result.message}`, "error");
    }
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    showMessage(
      "Erro na comunicação com a API ao atualizar tarefa. Verifique o console.",
      "error"
    );
  }
}

async function deleteTaskFromSheet(taskId) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
    return;
  }
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "deleteTask",
        id: taskId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === "success") {
      showMessage("Tarefa excluída com sucesso!", "success");
      fetchAndRenderTasks(); // Recarrega a lista de tarefas
    } else {
      showMessage(`Erro ao excluir tarefa: ${result.message}`, "error");
    }
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    showMessage(
      "Erro na comunicação com a API ao excluir tarefa. Verifique o console.",
      "error"
    );
  }
}

// --- Renderização da Interface ---

function renderTasks(tasks) {
  taskList.innerHTML = ""; // Limpa a lista antes de renderizar
  if (tasks.length === 0) {
    taskList.innerHTML = "<li>Nenhuma tarefa cadastrada.</li>";
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id; // Define o data-id para o elemento <li>
    li.classList.add(`status-${task.status.toLowerCase().replace(/ /g, "_")}`); // Adiciona classe para estilização de status

    const taskHeader = document.createElement("div");
    taskHeader.classList.add("task-header");

    const taskTitle = document.createElement("h3");
    taskTitle.classList.add("task-title");
    taskTitle.textContent = task.titulo;

    const taskStatusSpan = document.createElement("span");
    taskStatusSpan.classList.add("task-status");
    taskStatusSpan.textContent =
      STATUS_MAP_DB_TO_UI[task.status] || task.status; // Exibe o status formatado

    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskStatusSpan);

    const taskDescription = document.createElement("p");
    taskDescription.classList.add("task-description");
    taskDescription.textContent = task.descricao;

    const taskDate = document.createElement("p");
    taskDate.classList.add("task-date");
    // Formata a data se existir
    if (task.data) {
      const dateObj = new Date(task.data);
      if (!isNaN(dateObj)) {
        // Verifica se a data é válida
        taskDate.textContent = `Criada em: ${dateObj.toLocaleDateString()}`;
      } else {
        taskDate.textContent = `Criada em: ${task.data}`; // Exibe como está se for inválida
      }
    }

    const taskActions = document.createElement("div");
    taskActions.classList.add("task-actions");

    const statusSelector = document.createElement("select");
    statusSelector.classList.add("status-selector");
    statusSelector.innerHTML = `
      <option value="Pendente">Pendente</option>
      <option value="Em Progresso">Em Progresso</option>
      <option value="Concluída">Concluída</option>
    `;
    // Seleciona a opção correta no dropdown
    statusSelector.value = STATUS_MAP_DB_TO_UI[task.status] || task.status;

    const updateStatusBtn = document.createElement("button");
    updateStatusBtn.classList.add("action-button", "update-status-btn");
    updateStatusBtn.textContent = "Atualizar Status";

    const editBtn = document.createElement("button");
    editBtn.classList.add("action-button", "edit-btn");
    editBtn.textContent = "Editar";

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("action-button", "delete-btn");
    deleteBtn.textContent = "Excluir";

    taskActions.appendChild(statusSelector);
    taskActions.appendChild(updateStatusBtn);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    li.appendChild(taskHeader);
    li.appendChild(taskDescription);
    li.appendChild(taskDate);
    li.appendChild(taskActions);

    taskList.appendChild(li);
  });
}

// --- Event Listeners ---

// Adicionar nova tarefa
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  let description = taskDescriptionTextarea.value.trim();
  const status = taskStatusSelect.value;

  if (!title) {
    showMessage("O título da tarefa é obrigatório.", "error");
    return;
  }

  // Se a opção de lista de compras estiver marcada, a descrição vem dos checkboxes
  if (createShoppingListOption.checked) {
    description = getSelectedShoppingItems();
    if (!title && description) {
      // Se nenhum título foi dado, mas itens foram selecionados
      showMessage(
        "Por favor, dê um título para sua lista de compras ou selecione itens.",
        "error"
      );
      return;
    }
    if (!description && !title) {
      showMessage(
        "Selecione os itens para a lista de compras ou digite um título.",
        "error"
      );
      return;
    }
    // Se o usuário não digitou um título para a lista de compras, pode usar um padrão
    if (!title && description) {
      taskTitleInput.value = "Lista de Compras";
    }
  }

  const taskData = {
    titulo: title || taskTitleInput.value, // Usa o título digitado ou o "Lista de Compras" se preenchido via JS
    descricao: description,
    status: status,
  };

  await addTaskToSheet(taskData);
});

// Atualizar tarefa (formulário de edição)
saveUpdateBtn.addEventListener("click", async (event) => {
  event.preventDefault(); // Impede o envio padrão do formulário

  const id = updateTaskIdInput.value;
  const title = updateTitleInput.value.trim();
  const description = updateDescriptionTextarea.value.trim();
  const statusUI = updateStatusSelect.value;

  if (!title) {
    showMessage("O título da tarefa é obrigatório para atualização.", "error");
    return;
  }

  const updatedData = {
    titulo: title,
    descricao: description,
    status: statusUI,
  };

  await updateTaskInSheet(id, updatedData);
});

// Cancelar atualização
cancelUpdateBtn.addEventListener("click", () => {
  updateForm.reset();
  updateForm.style.display = "none";
  addTaskFormContent.style.display = "block"; // Reexibe o formulário de adicionar
  if (createShoppingListOption.checked) {
    // Se a lista de compras estava ativada, reexibe
    shoppingListContainer.style.display = "block";
  }
});

// Alternar entre tarefa e lista de compras
newTaskOption.addEventListener("change", () => {
  if (newTaskOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "none";
    taskDescriptionTextarea.placeholder = "Descrição (opcional)";
    taskTitleInput.value = "";
    taskDescriptionTextarea.value = "";
    taskStatusSelect.value = "Pendente"; // Reseta o status para Pendente
  }
});

createShoppingListOption.addEventListener("change", () => {
  if (createShoppingListOption.checked) {
    addTaskFormContent.style.display = "block";
    shoppingListContainer.style.display = "block";
    generateShoppingCheckboxes(); // Gera os checkboxes
    taskTitleInput.value = ""; // Limpa o título para o usuário digitar
    taskTitleInput.placeholder = "Título da sua lista de compras"; // Novo placeholder
    taskDescriptionTextarea.value = "";
    taskDescriptionTextarea.placeholder =
      "Itens selecionados aparecerão aqui...";
    taskStatusSelect.value = "Pendente"; // Reseta o status para Pendente
  }
});

// Delegação de eventos para os botões da lista de tarefas (Editar, Excluir, Atualizar Status)
taskList.addEventListener("click", async (event) => {
  const target = event.target;
  const li = target.closest("li"); // Encontra o elemento <li> pai

  // Verifique se o li e o data-id existem antes de prosseguir
  if (!li || !li.dataset.id) {
    console.warn("Clique em um elemento sem ID de tarefa ou fora de um LI.");
    return;
  }

  const taskId = li.dataset.id; // Obtém o ID da tarefa

  console.log("Evento de clique na lista. Target:", target);
  console.log("ID da tarefa encontrada:", taskId);

  if (target.classList.contains("edit-btn")) {
    console.log(`Clicou em Editar para a tarefa ID: ${taskId}`);
    await getTaskById(taskId);
  } else if (target.classList.contains("delete-btn")) {
    console.log(`Clicou em Excluir para a tarefa ID: ${taskId}`);
    await deleteTaskFromSheet(taskId);
  } else if (target.classList.contains("update-status-btn")) {
    const statusSelector = li.querySelector(".status-selector");
    if (statusSelector) {
      const newStatusUI = statusSelector.value;
      console.log(
        `Clicou em Atualizar Status para a tarefa ID: ${taskId}, novo status: ${newStatusUI}`
      );
      await updateTaskInSheet(taskId, { status: newStatusUI });
    } else {
      console.error("Seletor de status não encontrado para atualização.");
    }
  }
});

// Event listener para mudança no seletor de status diretamente na lista
// Isso permite atualizar o status sem precisar clicar no botão "Atualizar Status" ao lado.
taskList.addEventListener("change", async (event) => {
  const target = event.target;
  if (target.classList.contains("status-selector")) {
    const li = target.closest("li");
    if (li && li.dataset.id) {
      const taskId = li.dataset.id;
      const newStatusUI = target.value;
      console.log(
        `Mudança de status via dropdown para ID: ${taskId}, novo status: ${newStatusUI}`
      );
      await updateTaskInSheet(taskId, { status: newStatusUI });
    }
  }
});

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTasks();
  generateShoppingCheckboxes(); // Garante que os checkboxes sejam gerados na carga inicial
  newTaskOption.checked = true; // Define "Digitar Nova Tarefa" como padrão
  addTaskFormContent.style.display = "block"; // Garante que o formulário de tarefa esteja visível
  shoppingListContainer.style.display = "none"; // Garante que a lista de compras esteja oculta
});
