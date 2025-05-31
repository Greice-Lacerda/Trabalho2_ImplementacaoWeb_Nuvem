
const SPREADSHEET_ID = "1FPYvCbbp-V3D9-sn98ftrfreJXdnn0IYFSxmzmy6-nI";
const SHEET_NAME = "Tarefas";
const HEADERS = ["ID", "Titulo", "Descricao", "Status", "Data"];

// Mapeamentos de status
const STATUS_MAP_UI_TO_DB = {
  "Pendente": "pending",
  "Em Progresso": "in_progress",
  "Concluída": "completed",
};

const STATUS_MAP_DB_TO_UI = {
  "pending": "Pendente",
  "in_progress": "Em Progresso",
  "completed": "Concluída",
};

// Utilitários
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(SHEET_NAME);
}

function getNextAvailableId(data) {
  if (!Array.isArray(data) || data.length === 0) return 1;
  const ids = data.slice(1).map(row => Number(row[0])).filter(n => !isNaN(n));
  let ID = 1;
  while (ids.includes(ID)) ID++;
  return ID;
}

// API GET
function doGet(e) {
  const action = e.parameter.action;
  if (action === "fetchTasks") {
    const tasks = fetchTasksInternal();
    return ContentService.createTextOutput(JSON.stringify(tasks)).setMimeType(ContentService.MimeType.JSON);
  }
  if (action === "getTaskById" && e.parameter.ID) {
    const task = getTaskByIdInternal(e.parameter.ID);
    return ContentService.createTextOutput(JSON.stringify(task || { error: "Tarefa não encontrada" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "Ação inválida." }))
    .setMimeType(ContentService.MimeType.JSON);
}

// API POST
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "JSON inválido." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const action = body.action;
  try {
    if (action === "addTask") {
      Logger.log(body.taskData); // Corrigido aqui
      const result = addTaskInternal(body.taskData);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === "updateTask") {
      const result = updateTaskInternal(body.id, body.updatedData);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === "deleteTask") {
      const result = deleteTaskInternal(body.ID);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: "Ação inválida." }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Funções internas
function fetchTasksInternal() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const tasks = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    tasks.push({
      id: row[0],
      titulo: row[1],
      descricao: row[2],
      status: STATUS_MAP_DB_TO_UI[row[3]] || row[3],
      data: row[4],
    });
  }

  return tasks;
}

function getTaskByIdInternal(ID) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(ID)) {
      return {
        id: data[i][0],
        titulo: data[i][1],
        descricao: data[i][2],
        status: STATUS_MAP_DB_TO_UI[data[i][3]] || data[i][3],
        data: data[i][4],
      };
    }
  }

  return null;
}

function addTaskInternal(taskData) {
  if (!taskData || !taskData.titulo) {
    throw new Error("Dados da tarefa inválidos.");
  }

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const newId = getNextAvailableId(data);
  const statusDB = STATUS_MAP_UI_TO_DB[taskData.status] || "pending";
  const dataCriacao = new Date().toISOString();

  const newRow = [
    newId,
    taskData.titulo,
    taskData.descricao || "",
    statusDB,
    dataCriacao,
  ];
  sheet.appendRow(newRow);

  return {
    id: newId,
    titulo: taskData.titulo,
    descricao: taskData.descricao || "",
    status: taskData.status || "Pendente",
    data: dataCriacao,
  };
}

function updateTaskInternal(taskId, updatedData) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(taskId)) {
      if (updatedData.titulo !== undefined) data[i][1] = updatedData.titulo;
      if (updatedData.descricao !== undefined) data[i][2] = updatedData.descricao;
      if (updatedData.status !== undefined) {
        data[i][3] = STATUS_MAP_UI_TO_DB[updatedData.status] || updatedData.status;
      }

      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);

      return {
        id: data[i][0],
        titulo: data[i][1],
        descricao: data[i][2],
        status: STATUS_MAP_DB_TO_UI[data[i][3]] || data[i][3],
        data: data[i][4],
      };
    }
  }

  return null;
}

function deleteTaskInternal(taskId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(taskId)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }

  return false;
}

// Inicialização da planilha
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
}
