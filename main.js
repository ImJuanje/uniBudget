// =====================
// Elementos DOM
// =====================
const saveBtn = document.getElementById("save-setup");
const initialInput = document.getElementById("initial-income");
const monthsInput = document.getElementById("months");
const startMonthSelect = document.getElementById("start-month");

const totalEl = document.getElementById("total");
const mesesEl = document.getElementById("meses");
const presupuestoEl = document.getElementById("presupuesto");
const gastoAcumuladoEl = document.getElementById("gasto-acumulado");
const saldoRestanteEl = document.getElementById("saldo-restante");

const summarySection = document.getElementById("summary");
const setupSection = document.getElementById("setup");
const monthViewSection = document.getElementById("month-view");

const monthNameEl = document.getElementById("month-name");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const monthDifferenceEl = document.getElementById("month-difference");
const categoriesForm = document.getElementById("categories-form");

const addCategoryForm = document.getElementById("add-category-form");
const newCategoryInput = document.getElementById("new-category-name");
const categoriesList = document.getElementById("categories-list");

const addIncomeBtn = document.getElementById("add-income-btn");
const extraIncomeDialog = document.getElementById("extra-income-dialog");
const extraIncomeAmount = document.getElementById("extra-income-amount");
const extraIncomeMonth = document.getElementById("extra-income-month");
const confirmExtraIncomeBtn = document.getElementById("confirm-extra-income");
const cancelExtraIncomeBtn = document.getElementById("cancel-extra-income");

// =====================
// Variables
// =====================
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const fixedCategories = ["Alquiler", "Transporte", "Ocio", "Materiales", "Alimentación", "Otros"];
let customCategories = [];
let uniBudgetData = null;
let currentMonthIndex = 0;

// Íconos para categorías fijas, por FontAwesome
const categoryIcons = {
  "Alquiler": "fa-house",
  "Transporte": "fa-bus",
  "Ocio": "fa-gamepad",
  "Materiales": "fa-tools",
  "Alimentación": "fa-utensils",
  "Otros": "fa-ellipsis-h"
};

// =====================
// Utilidades
// =====================
const formatEuro = num => `${num.toFixed(2)} €`;

const getAllCategories = () => [...fixedCategories, ...customCategories];

// =====================
// LocalStorage
// =====================
function saveData() {
  localStorage.setItem("uniBudgetData", JSON.stringify(uniBudgetData));
  localStorage.setItem("customCategories", JSON.stringify(customCategories));
}

function loadData() {
  const data = localStorage.getItem("uniBudgetData");
  const custom = localStorage.getItem("customCategories");
  uniBudgetData = data ? JSON.parse(data) : null;
  customCategories = custom ? JSON.parse(custom) : [];
}

// =====================
// Inicialización gastos
// =====================
function initGastos(meses) {
  return Array.from({ length: meses }, () => {
    const obj = {};
    getAllCategories().forEach(cat => obj[cat] = 0);
    return obj;
  });
}

// =====================
// Resumen general
// =====================
function gastoAcumulado() {
  if (!uniBudgetData) return 0;
  return uniBudgetData.gastos.reduce((acc, mes) =>
    acc + getAllCategories().reduce((suma, cat) => suma + (mes[cat] || 0), 0)
  , 0);
}

function actualizarResumen() {
  if (!uniBudgetData) return;
  
  const { total, meses } = uniBudgetData;
  const presupuesto = total / meses;
  const gastado = gastoAcumulado();
  const saldo = total - gastado;

  animateValue(totalEl, 0, total);
  mesesEl.textContent = meses;
  animateValue(presupuestoEl, 0, presupuesto);
  animateValue(gastoAcumuladoEl, 0, gastado);
  animateValue(saldoRestanteEl, 0, saldo);
}

function gastoMes(index) {
  if (!uniBudgetData) return 0;
  return getAllCategories().reduce((suma, cat) =>
    suma + (uniBudgetData.gastos[index][cat] || 0), 0);
}

function mostrarDiferenciaMes(index) {
  if (!uniBudgetData) return;
  const presupuestoMensual = uniBudgetData.total / uniBudgetData.meses;
  const gasto = gastoMes(index);
  const diferencia = presupuestoMensual - gasto;

  monthDifferenceEl.textContent = `${diferencia >= 0 ? "+" : "-"}${formatEuro(Math.abs(diferencia))}`;
  monthDifferenceEl.classList.toggle("negativo", diferencia < 0);
}

// =====================
// Render inputs por categoría
// =====================
function renderCategoryInputs() {
  categoriesForm.innerHTML = "";
  getAllCategories().forEach(cat => {
    const label = document.createElement("label");
    label.setAttribute("for", `category-${cat}`);

    // Crear el icono y añadirlo al label
    const icon = document.createElement("i");
    icon.className = "fa-solid " + (categoryIcons[cat] || "fa-tag");
    icon.style.marginRight = "0.5rem";
    label.appendChild(icon);

    // Añadir texto al label
    const textNode = document.createTextNode(cat);
    label.appendChild(textNode);

    const input = document.createElement("input");
    input.type = "number";
    input.id = `category-${cat}`;
    input.min = "0";
    input.step = "0.01";
    input.value = "0.00";

    input.addEventListener("input", e => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < 0) val = 0;
      uniBudgetData.gastos[currentMonthIndex][cat] = val;
      saveData();
      actualizarResumen();
      mostrarDiferenciaMes(currentMonthIndex);
    });

    categoriesForm.appendChild(label);
    categoriesForm.appendChild(input);
  });
}

// =====================
// Mostrar mes
// =====================
function mostrarMes(index) {
  if (!uniBudgetData) return;
  const { meses, startMonth, gastos } = uniBudgetData;
  if (index < 0 || index >= meses) return;

  currentMonthIndex = index;
  const realMonth = (startMonth + index) % 12;
  monthNameEl.textContent = monthNames[realMonth];

  getAllCategories().forEach(cat => {
    const input = document.getElementById(`category-${cat}`);
    if (input) input.value = (gastos[index][cat] ?? 0).toFixed(2);
  });

  mostrarDiferenciaMes(index);
}

// =====================
// Categorías personalizadas con iconos dinámicos
// =====================
function renderCategoriesList() {
  categoriesList.innerHTML = "";
  getAllCategories().forEach(cat => {
    const li = document.createElement("li");
    
    // Icono FontAwesome dinámico
    const icon = document.createElement("i");
    icon.className = "fa-solid " + (categoryIcons[cat] || "fa-tag");
    icon.style.marginRight = "0.5rem";
    li.appendChild(icon);

    const textNode = document.createTextNode(cat);
    li.appendChild(textNode);

    if (!fixedCategories.includes(cat)) {
      const btn = document.createElement("button");
      btn.textContent = "Eliminar";
      btn.style.marginLeft = "0.8rem";
      btn.addEventListener("click", () => eliminarCategoria(cat));
      li.appendChild(btn);
    }

    categoriesList.appendChild(li);
  });
}

function eliminarCategoria(cat) {
  customCategories = customCategories.filter(c => c !== cat);
  if (uniBudgetData) {
    uniBudgetData.gastos.forEach(mes => delete mes[cat]);
    saveData();
  }
  renderCategoryInputs();
  renderCategoriesList();
  mostrarMes(currentMonthIndex);
  actualizarResumen();
}

// =====================
// Guardar configuración inicial
// =====================
saveBtn.addEventListener("click", () => {
  clearInputErrors();

  const total = parseFloat(initialInput.value);
  const meses = parseInt(monthsInput.value);
  const startMonth = parseInt(startMonthSelect.value);

  let hasError = false;

  if (isNaN(total) || total <= 0) {
    showInputError(initialInput, "Introduce un monto válido mayor que 0.");
    hasError = true;
  }

  if (isNaN(meses) || meses <= 0) {
    showInputError(monthsInput, "Introduce un número de meses mayor que 0.");
    hasError = true;
  }

  if (isNaN(startMonth)) {
    showInputError(startMonthSelect, "Selecciona un mes de inicio.");
    hasError = true;
  }

  if (hasError) return;

  uniBudgetData = {
    total,
    meses,
    startMonth,
    gastos: initGastos(meses),
    ingresosExtra: Array(meses).fill(0)
  };

  saveData();

  setupSection.classList.add("hidden");
  summarySection.classList.remove("hidden");
  monthViewSection.classList.remove("hidden");

  renderCategoryInputs();
  renderCategoriesList();
  actualizarResumen();
  mostrarMes(0);
});

function showInputError(input, message) {
  input.classList.add("input-error");

  const msg = document.createElement("div");
  msg.className = "error-message";
  msg.textContent = message;

  input.parentNode.insertBefore(msg, input.nextSibling);
  input.focus();
}

function clearInputErrors() {
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
  document.querySelectorAll(".error-message").forEach(el => el.remove());
}

// =====================
// Navegación
// =====================
prevMonthBtn.addEventListener("click", () => mostrarMes(currentMonthIndex - 1));
nextMonthBtn.addEventListener("click", () => mostrarMes(currentMonthIndex + 1));

// =====================
// Añadir categoría personalizada
// =====================
addCategoryForm.addEventListener("submit", e => {
  e.preventDefault();
  const nuevaCat = newCategoryInput.value.trim();
  if (!nuevaCat) return alert("Escribe un nombre válido.");
  if (getAllCategories().includes(nuevaCat)) return alert("Esa categoría ya existe.");

  customCategories.push(nuevaCat);
  if (uniBudgetData) {
    uniBudgetData.gastos.forEach(mes => mes[nuevaCat] = 0);
    saveData();
  }

  newCategoryInput.value = "";
  renderCategoryInputs();
  renderCategoriesList();
  mostrarMes(currentMonthIndex);
});

// =====================
// Inicio
// =====================
window.addEventListener("DOMContentLoaded", () => {
  loadData();

  if (uniBudgetData) {
    setupSection.classList.add("hidden");
    summarySection.classList.remove("hidden");
    monthViewSection.classList.remove("hidden");

    renderCategoryInputs();
    renderCategoriesList();
    actualizarResumen();
    mostrarMes(0);
  }
});

// =====================
// Ingresos extra - Modal
// =====================
addIncomeBtn.addEventListener("click", () => {
  if (!uniBudgetData) {
    alert("Primero configura tu presupuesto.");
    return;
  }

  extraIncomeAmount.value = "";
  extraIncomeMonth.innerHTML = "";

  const { meses, startMonth } = uniBudgetData;
  for (let i = 0; i < meses; i++) {
    const mesIndex = (startMonth + i) % 12;
    const option = document.createElement("option");
    option.value = i;
    option.textContent = monthNames[mesIndex];
    extraIncomeMonth.appendChild(option);
  }

  extraIncomeDialog.classList.remove("hidden");
});

cancelExtraIncomeBtn.addEventListener("click", () => {
  extraIncomeDialog.classList.add("hidden");
});

confirmExtraIncomeBtn.addEventListener("click", () => {
  clearInputErrors();

  const val = parseFloat(extraIncomeAmount.value);
  const mesSeleccionado = parseInt(extraIncomeMonth.value);

  let hasError = false;

  if (isNaN(val) || val <= 0) {
    showInputError(extraIncomeAmount, "Introduce un importe mayor que 0.");
    hasError = true;
  }

  if (isNaN(mesSeleccionado)) {
    showInputError(extraIncomeMonth, "Selecciona un mes válido.");
    hasError = true;
  }

  if (hasError) return;

  if (!uniBudgetData.ingresosExtra) {
    uniBudgetData.ingresosExtra = Array(uniBudgetData.meses).fill(0);
  }

  uniBudgetData.ingresosExtra[mesSeleccionado] += val;
  uniBudgetData.total += val;

  saveData();
  actualizarResumen();
  mostrarMes(currentMonthIndex);

  extraIncomeDialog.classList.add("hidden");
});

document.getElementById("open-graph-btn").addEventListener("click", () => {
  window.location.href = "graph.html";
});

// Añadir al inicio del DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Animación inicial
  document.querySelector('header').style.animation = 'fadeIn 0.6s forwards';
  
  // Efecto especial al guardar configuración
  saveBtn.addEventListener('click', function() {
    if (!uniBudgetData) return;
    
    // Efecto visual al guardar
    this.classList.add('pulse');
    setTimeout(() => this.classList.remove('pulse'), 1500);
    
    // Feedback visual
    const check = document.createElement('span');
    check.innerHTML = '✓';
    this.appendChild(check);
    setTimeout(() => check.remove(), 2000);
  });

  // Mejor feedback al añadir categoría
  addCategoryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const input = newCategoryInput;
    input.style.borderColor = '#10b981';
    setTimeout(() => input.style.borderColor = '', 1000);
  });

  // Efecto al mostrar mes
  const originalMostrarMes = mostrarMes;
  mostrarMes = function(index) {
    monthViewSection.style.opacity = '0';
    originalMostrarMes(index);
    setTimeout(() => {
      monthViewSection.style.transition = 'opacity 0.3s ease';
      monthViewSection.style.opacity = '1';
    }, 50);
  };
});

// Nueva función para animar cambios numéricos
function animateValue(element, start, end, duration = 1000) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = formatEuro(value);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Mejor feedback en errores
function showInputError(input, message) {
  input.classList.add('input-error');
  
  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-message';
  errorMsg.style.animation = 'fadeIn 0.3s ease-out';
  errorMsg.textContent = message;
  
  input.parentNode.insertBefore(errorMsg, input.nextSibling);
  input.focus();
  
  // Efecto de shake
  input.style.animation = 'shake 0.5s';
  setTimeout(() => input.style.animation = '', 500);
}

// Asegurar que los botones mantengan estilo al cargar
document.querySelectorAll('button').forEach(btn => {
  btn.style.opacity = '1';
  btn.style.transform = 'none';
});

// Efecto al pasar ratón (opcional, mejora interactividad)
document.querySelectorAll('button, section, #categories-list li').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.transition = 'all 0.2s ease';
  });
});
